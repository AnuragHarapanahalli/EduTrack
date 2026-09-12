package com.edutrack.platform

import app.cash.sqldelight.db.SqlDriver
import app.cash.sqldelight.driver.native.NativeSqliteDriver
import com.edutrack.database.EduTrackDatabase

actual class DatabaseDriverFactory {
    actual fun createDriver(): SqlDriver {
        return NativeSqliteDriver(EduTrackDatabase.Schema, "edutrack.db")
    }
}
