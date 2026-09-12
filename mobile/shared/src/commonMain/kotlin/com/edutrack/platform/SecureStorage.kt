package com.edutrack.platform

expect class SecureStorage {
    fun saveToken(token: String)
    fun getToken(): String?
    fun saveUserJson(userJson: String)
    fun getUserJson(): String?
    fun clear()
}
