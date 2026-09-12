package com.edutrack.util

object DocumentPreviewUtils {

    /**
     * Set of supported document extensions for in-app or system preview.
     */
    val SUPPORTED_EXTENSIONS = setOf(
        "pdf",
        "docx",
        "doc",
        "png",
        "jpg",
        "jpeg",
        "webp",
        "gif",
        "txt",
        "csv"
    )

    const val UNSUPPORTED_ERROR_MESSAGE = "file not supported for preview"

    fun getFileExtension(pathOrUrl: String?): String {
        if (pathOrUrl.isNullOrBlank()) return ""
        val clean = pathOrUrl.substringBefore('?').substringBefore('#')
        return clean.substringAfterLast('.', "").lowercase()
    }

    fun isPreviewSupported(pathOrUrl: String?): Boolean {
        if (pathOrUrl.isNullOrBlank()) return false
        val ext = getFileExtension(pathOrUrl)
        return ext in SUPPORTED_EXTENSIONS
    }

    fun getFileName(pathOrUrl: String?): String {
        if (pathOrUrl.isNullOrBlank()) return "Document"
        val clean = pathOrUrl.substringBefore('?').substringBefore('#')
        return clean.substringAfterLast('/')
    }

    fun getFileTypeLabel(pathOrUrl: String?): String {
        return when (getFileExtension(pathOrUrl)) {
            "pdf" -> "PDF Document"
            "docx", "doc" -> "Word Document"
            "png", "jpg", "jpeg", "webp", "gif" -> "Image"
            "txt", "csv" -> "Text File"
            else -> "Unsupported Document"
        }
    }
}
