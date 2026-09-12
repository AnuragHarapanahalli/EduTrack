package com.edutrack.util

fun parseErrorMessage(throwable: Throwable): String {
    val raw = throwable.message ?: return "An unexpected error occurred. Please try again."

    // 1. Try to extract JSON "message": "..." from backend response
    val messageRegex = """"message"\s*:\s*"([^"]+)"""".toRegex()
    val match = messageRegex.find(raw)
    if (match != null) {
        val extracted = match.groupValues[1].replace("\\\"", "\"").trim()
        if (extracted.isNotBlank()) {
            if (extracted.equals("Bad credentials", ignoreCase = true)) {
                return "Invalid email or password."
            }
            return extracted
        }
    }

    // 2. Try to extract JSON "error": "..."
    val errorRegex = """"error"\s*:\s*"([^"]+)"""".toRegex()
    val errMatch = errorRegex.find(raw)
    if (errMatch != null) {
        val extracted = errMatch.groupValues[1].replace("\\\"", "\"").trim()
        if (extracted.isNotBlank()) {
            if (extracted.equals("Unauthorized", ignoreCase = true)) {
                return "Invalid email or password."
            }
            return extracted
        }
    }

    // 3. Network & connection failures
    if (raw.contains("timeout", ignoreCase = true)) {
        return "Connection timed out. Please check your network connection and server settings."
    }
    if (raw.contains("ConnectException", ignoreCase = true) ||
        raw.contains("Failed to connect", ignoreCase = true) ||
        raw.contains("Connection refused", ignoreCase = true) ||
        raw.contains("UnresolvedAddressException", ignoreCase = true) ||
        raw.contains("Network is unreachable", ignoreCase = true)) {
        return "Unable to connect to the EduTrack server. Please check your network and verify the backend is running."
    }

    // 4. HTTP status code heuristics
    if (raw.contains("401 Unauthorized", ignoreCase = true) || raw.contains("401", ignoreCase = true)) {
        return "Invalid email or password. Please verify your credentials and try again."
    }
    if (raw.contains("403 Forbidden", ignoreCase = true)) {
        return "Access denied. You do not have permission for this action."
    }
    if (raw.contains("404 Not Found", ignoreCase = true)) {
        return "The requested information could not be found."
    }
    if (raw.contains("409 Conflict", ignoreCase = true)) {
        return "A conflict occurred with the existing data. Please check your input."
    }
    if (raw.contains("500 Internal Server Error", ignoreCase = true)) {
        return "Internal server error. Please try again later."
    }

    // 5. If it's a short, readable custom message without URL/stack trace, return it
    if (!raw.contains("http://") && !raw.contains("https://") && !raw.contains("Exception") && raw.length < 120) {
        return raw
    }

    return "An error occurred while processing your request. Please try again."
}
