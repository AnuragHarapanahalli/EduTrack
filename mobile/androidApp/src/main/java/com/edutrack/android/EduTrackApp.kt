package com.edutrack.android

import android.app.Application
import com.edutrack.di.initKoin
import com.edutrack.platform.DatabaseDriverFactory
import com.edutrack.platform.SecureStorage
import org.koin.android.ext.koin.androidContext
import org.koin.dsl.module

class EduTrackApp : Application() {
    override fun onCreate() {
        super.onCreate()

        initKoin {
            androidContext(this@EduTrackApp)
            modules(
                module {
                    single { SecureStorage(this@EduTrackApp) }
                    single { DatabaseDriverFactory(this@EduTrackApp) }
                }
            )
        }
    }
}
