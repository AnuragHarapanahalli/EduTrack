package com.edutrack.platform

import androidx.compose.runtime.Composable
import androidx.compose.ui.platform.UriHandler

expect val platformName: String

@Composable
expect fun providePlatformUriHandler(): UriHandler
