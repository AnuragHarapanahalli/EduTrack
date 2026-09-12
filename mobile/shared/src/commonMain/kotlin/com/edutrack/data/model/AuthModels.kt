package com.edutrack.data.model

import kotlinx.serialization.Serializable

@Serializable
enum class Role {
    STUDENT,
    INSTRUCTOR,
    ADMIN
}

@Serializable
data class User(
    val id: Long,
    val email: String,
    val fullName: String,
    val role: Role,
    val panel: String? = null,
    val batch: String? = null,
    val assignedBatches: Set<String> = emptySet(),
    val needsPasswordReset: Boolean = false,
    val active: Boolean = true
)

@Serializable
data class LoginRequest(
    val email: String,
    val password: String
)

@Serializable
data class AuthResponse(
    val token: String,
    val type: String = "Bearer",
    val user: User
)
