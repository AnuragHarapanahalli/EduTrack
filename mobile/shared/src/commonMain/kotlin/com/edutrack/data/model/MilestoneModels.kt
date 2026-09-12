package com.edutrack.data.model

import kotlinx.serialization.Serializable

@Serializable
data class DeliverableItem(
    val title: String,
    val isMandatory: Boolean = true,
    val acceptsFile: Boolean = true,
    val acceptsLink: Boolean = true,
    val allowedFileExtensions: String? = null,
    val allowedLinkPatterns: String? = null
)

@Serializable
data class Milestone(
    val id: Long,
    val subjectId: Long? = null,
    val title: String,
    val description: String? = null,
    val deadline: String,
    val basePoints: Double = 100.0,
    val maxMarks: Double = 100.0,
    val requiredDeliverables: String? = null,
    val isMandatory: Boolean = true
)

@Serializable
data class CreateMilestoneRequest(
    val subjectId: Long,
    val title: String,
    val description: String? = null,
    val deadline: String,
    val basePoints: Double = 100.0,
    val maxMarks: Double = 100.0,
    val requiredDeliverables: String? = null,
    val isMandatory: Boolean = true
)

// UI representation with unlock state and submission status
data class MilestoneUI(
    val milestone: Milestone,
    val isLocked: Boolean,
    val submission: Submission? = null,
    val daysRemainingText: String = "",
    val isDueSoon: Boolean = false,
    val isOverdue: Boolean = false,
    val deliverablesList: List<DeliverableItem> = emptyList()
)
