package com.edutrack.data.remote

import com.edutrack.data.model.*
import io.ktor.client.HttpClient
import io.ktor.client.call.body
import io.ktor.client.request.forms.formData
import io.ktor.client.request.forms.submitFormWithBinaryData
import io.ktor.client.request.get
import io.ktor.client.request.parameter
import io.ktor.client.request.post
import io.ktor.client.request.put
import io.ktor.client.request.setBody
import io.ktor.http.Headers
import io.ktor.http.HttpHeaders

class EduTrackApiService(private val client: HttpClient) {

    private val base: String get() = KtorClientFactory.baseUrl

    // ---------------- AUTH ----------------
    suspend fun login(request: LoginRequest): AuthResponse {
        return client.post("$base/auth/login") {
            setBody(request)
        }.body()
    }

    // ---------------- SUBJECTS ----------------
    suspend fun getSubjectsForStudent(studentId: Long): List<Subject> {
        return client.get("$base/subjects/student/$studentId").body()
    }

    suspend fun getSubjectsForInstructor(instructorId: Long): List<Subject> {
        return client.get("$base/subjects/instructor/$instructorId").body()
    }

    suspend fun createSubject(request: CreateSubjectRequest, instructorId: Long): Subject {
        return client.post("$base/subjects") {
            parameter("instructorId", instructorId)
            setBody(request)
        }.body()
    }

    // ---------------- MILESTONES ----------------
    suspend fun getMilestonesBySubject(subjectId: Long): List<Milestone> {
        return client.get("$base/milestones/subject/$subjectId").body()
    }

    suspend fun createMilestone(request: CreateMilestoneRequest): Milestone {
        return client.post("$base/milestones") {
            setBody(request)
        }.body()
    }

    // ---------------- SUBMISSIONS ----------------
    suspend fun getSubmissionsByStudent(studentId: Long): List<Submission> {
        return client.get("$base/submissions/student/$studentId").body()
    }

    suspend fun getMilestoneRoster(milestoneId: Long): List<MilestoneRosterEntry> {
        return client.get("$base/submissions/milestone/$milestoneId/roster").body()
    }

    suspend fun reviewSubmission(submissionId: Long, request: ReviewSubmissionRequest): Submission {
        return client.put("$base/submissions/$submissionId/review") {
            setBody(request)
        }.body()
    }

    suspend fun uploadSubmission(
        milestoneId: Long,
        studentId: Long,
        link: String?,
        fileBytes: ByteArray?,
        fileName: String?,
        comments: String?
    ): Submission {
        return client.submitFormWithBinaryData(
            url = "$base/submissions/upload",
            formData = formData {
                append("milestoneId", milestoneId.toString())
                append("studentId", studentId.toString())
                if (!link.isNullOrBlank()) {
                    append("submissionLink", link.trim())
                }
                if (!comments.isNullOrBlank()) {
                    append("comments", comments.trim())
                }
                if (fileBytes != null && !fileName.isNullOrBlank()) {
                    append("file", fileBytes, Headers.build {
                        append(HttpHeaders.ContentDisposition, "filename=\"$fileName\"")
                    })
                }
            }
        ).body()
    }

    // ---------------- LEADERBOARD ----------------
    suspend fun getLeaderboard(subjectId: Long): List<LeaderboardEntry> {
        return client.get("$base/leaderboard/subject/$subjectId").body()
    }
}
