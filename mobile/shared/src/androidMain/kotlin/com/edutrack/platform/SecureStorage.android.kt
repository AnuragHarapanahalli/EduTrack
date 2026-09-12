package com.edutrack.platform

import android.content.Context
import android.content.SharedPreferences

actual class SecureStorage(context: Context) {
    private val prefs: SharedPreferences = context.getSharedPreferences("edutrack_secure_prefs", Context.MODE_PRIVATE)

    actual fun saveToken(token: String) {
        prefs.edit().putString("jwt_token", token).apply()
    }

    actual fun getToken(): String? {
        return prefs.getString("jwt_token", null)
    }

    actual fun saveUserJson(userJson: String) {
        prefs.edit().putString("user_json", userJson).apply()
    }

    actual fun getUserJson(): String? {
        return prefs.getString("user_json", null)
    }

    actual fun clear() {
        prefs.edit().clear().apply()
    }
}
