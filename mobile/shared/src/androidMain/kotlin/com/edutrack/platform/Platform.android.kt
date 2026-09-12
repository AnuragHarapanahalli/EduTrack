package com.edutrack.platform

import androidx.compose.runtime.Composable
import androidx.compose.ui.platform.LocalUriHandler
import androidx.compose.ui.platform.UriHandler

actual val platformName: String = "Android " + android.os.Build.VERSION.RELEASE

@Composable
actual fun providePlatformUriHandler(): UriHandler {
    return LocalUriHandler.current
}
