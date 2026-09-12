package com.edutrack.ui

import androidx.compose.runtime.*
import androidx.compose.ui.platform.LocalUriHandler
import com.edutrack.data.model.Role
import com.edutrack.platform.providePlatformUriHandler
import com.edutrack.ui.screens.auth.LoginScreen
import com.edutrack.ui.screens.student.StudentHomeScreen
import com.edutrack.ui.screens.teacher.TeacherHomeScreen
import com.edutrack.ui.theme.EduTrackTheme
import com.edutrack.ui.viewmodel.*
import org.koin.compose.koinInject

@Composable
fun App() {
    EduTrackTheme {
        CompositionLocalProvider(LocalUriHandler provides providePlatformUriHandler()) {
            val authViewModel: AuthViewModel = koinInject()
        val studentViewModel: StudentViewModel = koinInject()
        val teacherViewModel: TeacherViewModel = koinInject()
        val leaderboardViewModel: LeaderboardViewModel = koinInject()

        val authState by authViewModel.uiState.collectAsState()

        when (val state = authState) {
            is AuthUiState.Authenticated -> {
                val user = state.user
                when (user.role) {
                    Role.STUDENT -> {
                        StudentHomeScreen(
                            student = user,
                            studentViewModel = studentViewModel,
                            leaderboardViewModel = leaderboardViewModel,
                            onLogout = { authViewModel.logout() }
                        )
                    }
                    Role.INSTRUCTOR, Role.ADMIN -> {
                        TeacherHomeScreen(
                            instructor = user,
                            teacherViewModel = teacherViewModel,
                            onLogout = { authViewModel.logout() }
                        )
                    }
                }
            }
            else -> {
                LoginScreen(viewModel = authViewModel)
            }
        }
    }
}
}

