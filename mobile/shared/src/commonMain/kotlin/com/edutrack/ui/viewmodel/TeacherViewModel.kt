package com.edutrack.ui.viewmodel

import com.edutrack.data.model.*
import com.edutrack.data.repository.EduTrackRepository
import com.edutrack.util.parseErrorMessage
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.catch
import kotlinx.coroutines.launch

sealed class TeacherUiState {
    data object Loading : TeacherUiState()
    data class Success(
        val subjects: List<Subject>,
        val selectedSubject: Subject? = null,
        val milestones: List<Milestone> = emptyList(),
        val selectedMilestone: Milestone? = null,
        val roster: List<MilestoneRosterEntry> = emptyList(),
        val isRosterLoading: Boolean = false
    ) : TeacherUiState()
    data class Error(val message: String) : TeacherUiState()
}

class TeacherViewModel(private val repository: EduTrackRepository) {
    private val scope = CoroutineScope(Dispatchers.Main)
    private var rosterJob: Job? = null

    private val _uiState = MutableStateFlow<TeacherUiState>(TeacherUiState.Loading)
    val uiState: StateFlow<TeacherUiState> = _uiState.asStateFlow()

    private val _gradingSubmitting = MutableStateFlow(false)
    val gradingSubmitting: StateFlow<Boolean> = _gradingSubmitting.asStateFlow()

    private val _actionMessage = MutableStateFlow<String?>(null)
    val actionMessage: StateFlow<String?> = _actionMessage.asStateFlow()

    fun loadTeacherDashboard(instructorId: Long) {
        _uiState.value = TeacherUiState.Loading
        scope.launch {
            repository.getSubjectsFlow(instructorId, Role.INSTRUCTOR)
                .catch { e -> _uiState.value = TeacherUiState.Error(parseErrorMessage(e)) }
                .collect { subjects ->
                    if (subjects.isEmpty()) {
                        _uiState.value = TeacherUiState.Success(subjects = emptyList())
                    } else {
                        selectSubject(subjects.first(), subjects)
                    }
                }
        }
    }

    fun selectSubject(subject: Subject, subjectsList: List<Subject>? = null) {
        scope.launch {
            val allSubjects = subjectsList ?: (_uiState.value as? TeacherUiState.Success)?.subjects ?: listOf(subject)
            _uiState.value = TeacherUiState.Loading

            try {
                val milestones = repository.getTeacherMilestones(subject.id)
                val initialMilestone = milestones.firstOrNull()
                _uiState.value = TeacherUiState.Success(
                    subjects = allSubjects,
                    selectedSubject = subject,
                    milestones = milestones,
                    selectedMilestone = initialMilestone,
                    roster = emptyList(),
                    isRosterLoading = initialMilestone != null
                )
                initialMilestone?.let { selectMilestone(it) }
            } catch (e: Exception) {
                _uiState.value = TeacherUiState.Error(parseErrorMessage(e))
            }
        }
    }

    fun selectMilestone(milestone: Milestone) {
        val current = _uiState.value as? TeacherUiState.Success ?: return

        // Immediately update selectedMilestone and mark roster as loading
        _uiState.value = current.copy(
            selectedMilestone = milestone,
            isRosterLoading = true
        )

        // Cancel previous request to eliminate race conditions
        rosterJob?.cancel()
        rosterJob = scope.launch {
            val res = repository.getMilestoneRoster(milestone.id)
            val updated = _uiState.value as? TeacherUiState.Success ?: return@launch
            if (updated.selectedMilestone?.id == milestone.id) {
                res.fold(
                    onSuccess = { roster ->
                        _uiState.value = updated.copy(
                            roster = roster,
                            isRosterLoading = false
                        )
                    },
                    onFailure = { e ->
                        _actionMessage.value = "Failed to load roster: ${parseErrorMessage(e)}"
                        _uiState.value = updated.copy(isRosterLoading = false)
                    }
                )
            }
        }
    }

    fun loadRoster(milestoneId: Long) {
        val current = _uiState.value as? TeacherUiState.Success ?: return
        val milestone = current.milestones.find { it.id == milestoneId } ?: current.selectedMilestone ?: return
        selectMilestone(milestone)
    }

    fun evaluateSubmission(
        submissionId: Long,
        status: SubmissionStatus,
        qualityRating: Int?,
        obtainedMarks: Double?,
        marksLocked: Boolean,
        feedback: String?
    ) {
        _gradingSubmitting.value = true
        scope.launch {
            val res = repository.reviewSubmission(submissionId, status, qualityRating, obtainedMarks, marksLocked, feedback)
            _gradingSubmitting.value = false
            res.fold(
                onSuccess = {
                    _actionMessage.value = "Evaluation saved successfully!"
                    // Reload roster
                    val current = _uiState.value as? TeacherUiState.Success
                    current?.selectedMilestone?.id?.let { loadRoster(it) }
                },
                onFailure = { e ->
                    _actionMessage.value = "Grading failed: ${parseErrorMessage(e)}"
                }
            )
        }
    }

    fun createMilestone(
        subjectId: Long,
        title: String,
        description: String,
        deadline: String,
        basePoints: Double,
        maxMarks: Double,
        requiredDeliverables: String
    ) {
        scope.launch {
            val req = CreateMilestoneRequest(
                subjectId = subjectId,
                title = title,
                description = description,
                deadline = deadline,
                basePoints = basePoints,
                maxMarks = maxMarks,
                requiredDeliverables = requiredDeliverables
            )
            val res = repository.createMilestone(req)
            res.fold(
                onSuccess = {
                    _actionMessage.value = "Milestone created!"
                    val current = _uiState.value as? TeacherUiState.Success
                    if (current?.selectedSubject != null) {
                        selectSubject(current.selectedSubject, current.subjects)
                    }
                },
                onFailure = { e ->
                    _actionMessage.value = "Failed to create milestone: ${parseErrorMessage(e)}"
                }
            )
        }
    }

    fun createSubject(
        name: String,
        code: String,
        batch: String?,
        description: String?,
        instructorId: Long
    ) {
        scope.launch {
            val res = repository.createSubject(name, code, batch, description, instructorId)
            res.fold(
                onSuccess = { newSub ->
                    _actionMessage.value = "Class '${newSub.name}' created!"
                    loadTeacherDashboard(instructorId)
                },
                onFailure = { e ->
                    _actionMessage.value = "Failed to create class: ${parseErrorMessage(e)}"
                }
            )
        }
    }

    fun clearActionMessage() {
        _actionMessage.value = null
    }
}
