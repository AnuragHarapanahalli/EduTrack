package com.edutrack.ui.viewmodel

import com.edutrack.data.model.LeaderboardEntry
import com.edutrack.data.repository.EduTrackRepository
import com.edutrack.util.parseErrorMessage
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.catch
import kotlinx.coroutines.launch

sealed class LeaderboardUiState {
    data object Loading : LeaderboardUiState()
    data class Success(val entries: List<LeaderboardEntry>) : LeaderboardUiState()
    data class Error(val message: String) : LeaderboardUiState()
}

class LeaderboardViewModel(private val repository: EduTrackRepository) {
    private val scope = CoroutineScope(Dispatchers.Main)

    private val _uiState = MutableStateFlow<LeaderboardUiState>(LeaderboardUiState.Loading)
    val uiState: StateFlow<LeaderboardUiState> = _uiState.asStateFlow()

    fun loadLeaderboard(subjectId: Long) {
        _uiState.value = LeaderboardUiState.Loading
        scope.launch {
            repository.getLeaderboardFlow(subjectId)
                .catch { e -> _uiState.value = LeaderboardUiState.Error(parseErrorMessage(e)) }
                .collect { entries ->
                    _uiState.value = LeaderboardUiState.Success(entries)
                }
        }
    }
}
