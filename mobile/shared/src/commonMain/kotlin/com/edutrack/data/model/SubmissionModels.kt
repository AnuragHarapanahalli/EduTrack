package com.edutrack.data.model

import kotlinx.serialization.Serializable

@Serializable
enum class SubmissionStatus {
    SUBMITTED,
    APPROVED,
    NEEDS_REVISION,
    OVERDUE
}

@Serializable
data class Submission(
    val id: Long,
    val milestoneId: Long,
    val studentId: Long,
    val studentName: String? = null,
    val fileUrl: String? = null,
    val submissionLink: String? = null,
    val comments: String? = null,
    val submittedAt: String,
    val status: SubmissionStatus,
    val qualityRating: Int? = null,
    val timelinessMultiplier: Double? = null,
    val finalPoints: Double? = null,
    val obtainedMarks: Double? = null,
    val marksLocked: Boolean = false,
    val instructorFeedback: String? = null
)

@Serializable
data class ReviewSubmissionRequest(
    val status: SubmissionStatus,
    val qualityRating: Int? = null,
    val obtainedMarks: Double? = null,
    val marksLocked: Boolean? = true,
    val feedback: String? = null
)

@Serializable
data class MilestoneRosterEntry(
    val studentId: Long,
    val studentName: String,
    val studentEmail: String,
    val submissionId: Long? = null,
    val fileUrl: String? = null,
    val submissionLink: String? = null,
    val comments: String? = null,
    val submittedAt: String? = null,
    val status: SubmissionStatus? = null,
    val qualityRating: Int? = null,
    val timelinessMultiplier: Double? = null,
    val finalPoints: Double? = null,
    val obtainedMarks: Double? = null,
    val marksLocked: Boolean = false,
    val instructorFeedback: String? = null
)
