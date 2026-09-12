package com.edutrack.ui.viewmodel

import com.edutrack.data.model.*
import com.edutrack.data.repository.EduTrackRepository
import com.edutrack.util.parseErrorMessage
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.catch
import kotlinx.coroutines.launch

sealed class StudentUiState {
    data object Loading : StudentUiState()
    data class Success(
        val subjects: List<Subject>,
        val selectedSubject: Subject? = null,
        val milestones: List<MilestoneUI> = emptyList(),
        val heroMilestone: MilestoneUI? = null
    ) : StudentUiState()
    data class Error(val message: String) : StudentUiState()
}

class StudentViewModel(private val repository: EduTrackRepository) {
    private val scope = CoroutineScope(Dispatchers.Main)

    private val _uiState = MutableStateFlow<StudentUiState>(StudentUiState.Loading)
    val uiState: StateFlow<StudentUiState> = _uiState.asStateFlow()

    private val _uploading = MutableStateFlow(false)
    val uploading: StateFlow<Boolean> = _uploading.asStateFlow()

    private val _uploadSuccessMessage = MutableStateFlow<String?>(null)
    val uploadSuccessMessage: StateFlow<String?> = _uploadSuccessMessage.asStateFlow()

    fun loadStudentDashboard(studentId: Long) {
        _uiState.value = StudentUiState.Loading
        scope.launch {
            repository.getSubjectsFlow(studentId, Role.STUDENT)
                .catch { e -> _uiState.value = StudentUiState.Error(parseErrorMessage(e)) }
                .collect { subjects ->
                    if (subjects.isEmpty()) {
                        _uiState.value = StudentUiState.Success(subjects = emptyList())
                    } else {
                        selectSubject(studentId, subjects.first(), subjects)
                    }
                }
        }
    }

    fun selectSubject(studentId: Long, subject: Subject, subjectsList: List<Subject>? = null) {
        scope.launch {
            val allSubjects = subjectsList ?: (_uiState.value as? StudentUiState.Success)?.subjects ?: listOf(subject)
            _uiState.value = StudentUiState.Loading

            repository.getStudentMilestonesFlow(subject.id, studentId)
                .catch { e -> _uiState.value = StudentUiState.Error(parseErrorMessage(e)) }
                .collect { milestones ->
                    val hero = milestones.firstOrNull { !it.isLocked && it.submission?.status != SubmissionStatus.APPROVED }
                        ?: milestones.firstOrNull()

                    _uiState.value = StudentUiState.Success(
                        subjects = allSubjects,
                        selectedSubject = subject,
                        milestones = milestones,
                        heroMilestone = hero
                    )
                }
        }
    }

    fun submitDeliverable(
        milestoneId: Long,
        studentId: Long,
        link: String?,
        fileBytes: ByteArray?,
        fileName: String?,
        comments: String?
    ) {
        _uploading.value = true
        _uploadSuccessMessage.value = null

        scope.launch {
            val res = repository.submitDeliverable(milestoneId, studentId, link, fileBytes, fileName, comments)
            _uploading.value = false
            res.fold(
                onSuccess = {
                    _uploadSuccessMessage.value = "Submission successfully uploaded!"
                    // Reload current subject milestones
                    val cur = _uiState.value as? StudentUiState.Success
                    if (cur?.selectedSubject != null) {
                        selectSubject(studentId, cur.selectedSubject, cur.subjects)
                    }
                },
                onFailure = { e ->
                    _uploadSuccessMessage.value = "Upload failed: ${parseErrorMessage(e)}"
                }
            )
        }
    }

    fun clearUploadMessage() {
        _uploadSuccessMessage.value = null
    }
}
