package com.edutrack.data.repository

import com.edutrack.data.local.LocalDataStore
import com.edutrack.data.model.*
import com.edutrack.data.remote.EduTrackApiService
import com.edutrack.platform.SecureStorage
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import kotlinx.serialization.json.Json

class EduTrackRepository(
    private val api: EduTrackApiService,
    private val localDataStore: LocalDataStore,
    private val secureStorage: SecureStorage
) {
    private val json = Json { ignoreUnknownKeys = true }

    // ---------------- AUTH ----------------
    suspend fun login(email: String, pass: String): Result<User> {
        return try {
            val response = api.login(LoginRequest(email.trim(), pass.trim()))
            secureStorage.saveToken(response.token)
            secureStorage.saveUserJson(json.encodeToString(User.serializer(), response.user))
            localDataStore.saveCurrentUser(response.user, response.token)
            Result.success(response.user)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    fun getCurrentUser(): User? {
        val jsonStr = secureStorage.getUserJson()
        if (jsonStr != null) {
            try {
                return json.decodeFromString(User.serializer(), jsonStr)
            } catch (ignored: Exception) {}
        }
        return localDataStore.getCachedUser()
    }

    fun logout() {
        secureStorage.clear()
        localDataStore.clearUser()
    }

    // ---------------- SUBJECTS (Offline-first) ----------------
    fun getSubjectsFlow(userId: Long, role: Role): Flow<List<Subject>> = flow {
        // Emit cached data immediately
        val cached = localDataStore.getCachedSubjects()
        if (cached.isNotEmpty()) {
            emit(cached)
        }

        // Fetch fresh from network
        try {
            val fresh = if (role == Role.INSTRUCTOR) {
                api.getSubjectsForInstructor(userId)
            } else {
                api.getSubjectsForStudent(userId)
            }
            localDataStore.saveSubjects(fresh)
            emit(fresh)
        } catch (e: Exception) {
            // If offline, cached emission remains
            if (cached.isEmpty()) throw e
        }
    }

    suspend fun createSubject(name: String, code: String, batch: String?, desc: String?, instructorId: Long): Result<Subject> {
        return try {
            val res = api.createSubject(CreateSubjectRequest(name, code, batch, desc), instructorId)
            Result.success(res)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    // ---------------- MILESTONES WITH PROGRESSION LOCKING ----------------
    fun getStudentMilestonesFlow(subjectId: Long, studentId: Long): Flow<List<MilestoneUI>> = flow {
        // Fetch milestones and submissions concurrently
        val milestones = api.getMilestonesBySubject(subjectId)
        localDataStore.saveMilestones(subjectId, milestones)

        val submissions = try {
            api.getSubmissionsByStudent(studentId)
        } catch (e: Exception) {
            emptyList()
        }

        val submissionMap = submissions.associateBy { it.milestoneId }

        // Sequential progression lock rule:
        // Milestone i > 0 is LOCKED if Milestone i-1 does not exist or status != APPROVED
        val uiList = milestones.mapIndexed { index, m ->
            val sub = submissionMap[m.id]
            val isLocked = if (index == 0) {
                false
            } else {
                val prevMilestone = milestones[index - 1]
                val prevSub = submissionMap[prevMilestone.id]
                prevSub == null || prevSub.status != SubmissionStatus.APPROVED
            }

            val deliverables = parseDeliverables(m.requiredDeliverables)

            MilestoneUI(
                milestone = m,
                isLocked = isLocked,
                submission = sub,
                daysRemainingText = formatDeadline(m.deadline),
                isDueSoon = false,
                isOverdue = false,
                deliverablesList = deliverables
            )
        }

        emit(uiList)
    }

    suspend fun getTeacherMilestones(subjectId: Long): List<Milestone> {
        val list = api.getMilestonesBySubject(subjectId)
        localDataStore.saveMilestones(subjectId, list)
        return list
    }

    suspend fun createMilestone(request: CreateMilestoneRequest): Result<Milestone> {
        return try {
            val m = api.createMilestone(request)
            Result.success(m)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    // ---------------- SUBMISSIONS & ROSTER ----------------
    suspend fun submitDeliverable(
        milestoneId: Long,
        studentId: Long,
        link: String?,
        fileBytes: ByteArray?,
        fileName: String?,
        comments: String?
    ): Result<Submission> {
        return try {
            val res = api.uploadSubmission(milestoneId, studentId, link, fileBytes, fileName, comments)
            Result.success(res)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getMilestoneRoster(milestoneId: Long): Result<List<MilestoneRosterEntry>> {
        return try {
            Result.success(api.getMilestoneRoster(milestoneId))
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun reviewSubmission(
        submissionId: Long,
        status: SubmissionStatus,
        qualityRating: Int?,
        obtainedMarks: Double?,
        marksLocked: Boolean,
        feedback: String?
    ): Result<Submission> {
        return try {
            val req = ReviewSubmissionRequest(
                status = status,
                qualityRating = qualityRating,
                obtainedMarks = obtainedMarks,
                marksLocked = marksLocked,
                feedback = feedback
            )
            val res = api.reviewSubmission(submissionId, req)
            Result.success(res)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    // ---------------- LEADERBOARD ----------------
    fun getLeaderboardFlow(subjectId: Long): Flow<List<LeaderboardEntry>> = flow {
        val cached = localDataStore.getCachedLeaderboard(subjectId)
        if (cached.isNotEmpty()) emit(cached)

        try {
            val fresh = api.getLeaderboard(subjectId)
            localDataStore.saveLeaderboard(subjectId, fresh)
            emit(fresh)
        } catch (e: Exception) {
            if (cached.isEmpty()) throw e
        }
    }

    private fun parseDeliverables(jsonString: String?): List<DeliverableItem> {
        if (jsonString.isNullOrBlank()) return emptyList()
        return try {
            json.decodeFromString(jsonString)
        } catch (e: Exception) {
            emptyList()
        }
    }

    private fun formatDeadline(isoDateTime: String): String {
        return try {
            isoDateTime.replace("T", " ").take(16)
        } catch (e: Exception) {
            isoDateTime
        }
    }
}
