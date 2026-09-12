package com.edutrack.di

import com.edutrack.data.local.LocalDataStore
import com.edutrack.data.remote.EduTrackApiService
import com.edutrack.data.remote.KtorClientFactory
import com.edutrack.data.repository.EduTrackRepository
import com.edutrack.platform.DatabaseDriverFactory
import com.edutrack.platform.SecureStorage
import com.edutrack.ui.viewmodel.AuthViewModel
import com.edutrack.ui.viewmodel.LeaderboardViewModel
import com.edutrack.ui.viewmodel.StudentViewModel
import com.edutrack.ui.viewmodel.TeacherViewModel
import org.koin.core.context.startKoin
import org.koin.core.module.Module
import org.koin.dsl.KoinAppDeclaration
import org.koin.dsl.module

val appModule = module {
    // Platform dependencies must be registered in platform-specific setup or passed here
    single { LocalDataStore(get()) }
    single { KtorClientFactory.create(get()) }
    single { EduTrackApiService(get()) }
    single { EduTrackRepository(get(), get(), get()) }

    // ViewModels
    factory { AuthViewModel(get()) }
    factory { StudentViewModel(get()) }
    factory { TeacherViewModel(get()) }
    factory { LeaderboardViewModel(get()) }
}

fun initKoin(appDeclaration: KoinAppDeclaration = {}) =
    startKoin {
        appDeclaration()
        modules(appModule)
    }

// For iOS initialization
fun initKoinIos(secureStorage: SecureStorage, driverFactory: DatabaseDriverFactory) =
    startKoin {
        modules(
            appModule,
            module {
                single { secureStorage }
                single { driverFactory }
            }
        )
    }
