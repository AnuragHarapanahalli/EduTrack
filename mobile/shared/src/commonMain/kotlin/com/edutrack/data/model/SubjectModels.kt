package com.edutrack.data.model

import kotlinx.serialization.Serializable

@Serializable
data class Subject(
    val id: Long,
    val name: String,
    val code: String,
    val instructorName: String? = null,
    val instructorId: Long? = null,
    val batch: String? = null,
    val description: String? = null,
    val totalMilestones: Int = 0,
    val enrolledStudentsCount: Int = 0
)

@Serializable
data class CreateSubjectRequest(
    val name: String,
    val code: String,
    val batch: String? = null,
    val description: String? = null
)
