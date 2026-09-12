package com.edutrack.platform

import androidx.compose.runtime.Composable
import androidx.compose.ui.platform.UriHandler
import platform.Foundation.NSURL
import platform.UIKit.UIApplication
import platform.UIKit.UIDevice

actual val platformName: String = UIDevice.currentDevice.systemName() + " " + UIDevice.currentDevice.systemVersion

object IosUriHandler : UriHandler {
    override fun openUri(uri: String) {
        val nsUrl = NSURL.URLWithString(uri) ?: return
        UIApplication.sharedApplication.openURL(
            url = nsUrl,
            options = emptyMap<Any?, Any>(),
            completionHandler = null
        )
    }
}

@Composable
actual fun providePlatformUriHandler(): UriHandler = IosUriHandler
