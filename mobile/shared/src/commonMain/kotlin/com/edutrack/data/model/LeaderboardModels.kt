package com.edutrack.data.model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class LeaderboardEntry(
    val rank: Int,
    val studentId: Long,
    val studentName: String,
    val studentEmail: String,
    val totalPoints: Double,
    @SerialName("approvedMilestonesCount")
    val approvedMilestones: Int = 0,
    @SerialName("totalSubjectMilestonesCount")
    val totalMilestones: Int = 0,
    val completionPercentage: Double = 0.0
)
