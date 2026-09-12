package com.edutrack.ui.viewmodel

import com.edutrack.data.model.Role
import com.edutrack.data.model.User
import com.edutrack.data.repository.EduTrackRepository
import com.edutrack.util.parseErrorMessage
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

sealed class AuthUiState {
    data object Idle : AuthUiState()
    data object Loading : AuthUiState()
    data class Authenticated(val user: User) : AuthUiState()
    data class Error(val message: String) : AuthUiState()
}

class AuthViewModel(private val repository: EduTrackRepository) {
    private val scope = CoroutineScope(Dispatchers.Main)

    private val _uiState = MutableStateFlow<AuthUiState>(AuthUiState.Idle)
    val uiState: StateFlow<AuthUiState> = _uiState.asStateFlow()

    init {
        checkExistingSession()
    }

    fun checkExistingSession() {
        val user = repository.getCurrentUser()
        if (user != null) {
            _uiState.value = AuthUiState.Authenticated(user)
        } else {
            _uiState.value = AuthUiState.Idle
        }
    }

    fun login(email: String, pass: String) {
        if (email.isBlank() || pass.isBlank()) {
            _uiState.value = AuthUiState.Error("Please enter your email and password.")
            return
        }

        _uiState.value = AuthUiState.Loading
        scope.launch {
            val res = repository.login(email, pass)
            res.fold(
                onSuccess = { user ->
                    _uiState.value = AuthUiState.Authenticated(user)
                },
                onFailure = { e ->
                    _uiState.value = AuthUiState.Error(parseErrorMessage(e))
                }
            )
        }
    }

    fun logout() {
        repository.logout()
        _uiState.value = AuthUiState.Idle
    }
}
