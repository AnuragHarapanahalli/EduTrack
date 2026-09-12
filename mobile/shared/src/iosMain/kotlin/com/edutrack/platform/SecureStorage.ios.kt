package com.edutrack.platform

import platform.Foundation.NSUserDefaults

actual class SecureStorage {
    private val defaults = NSUserDefaults.standardUserDefaults

    actual fun saveToken(token: String) {
        defaults.setObject(token, forKey = "jwt_token")
    }

    actual fun getToken(): String? {
        return defaults.stringForKey("jwt_token")
    }

    actual fun saveUserJson(userJson: String) {
        defaults.setObject(userJson, forKey = "user_json")
    }

    actual fun getUserJson(): String? {
        return defaults.stringForKey("user_json")
    }

    actual fun clear() {
        defaults.removeObjectForKey("jwt_token")
        defaults.removeObjectForKey("user_json")
    }
}
