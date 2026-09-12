package com.edutrack.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val DarkColorScheme = darkColorScheme(
    primary = EduBluePrimary,
    onPrimary = Color.White,
    primaryContainer = EduBlueDark,
    secondary = EduCyan,
    background = DarkBackground,
    surface = DarkSurface,
    surfaceVariant = DarkSurfaceCard,
    outline = DarkBorder,
    error = EduDanger
)

private val LightColorScheme = lightColorScheme(
    primary = EduBluePrimary,
    onPrimary = Color.White,
    primaryContainer = EduBlueLight,
    secondary = EduCyan,
    background = LightBackground,
    surface = LightSurface,
    surfaceVariant = LightSurfaceCard,
    outline = LightBorder,
    error = EduDanger
)

@Composable
fun EduTrackTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    val colorScheme = if (darkTheme) DarkColorScheme else LightColorScheme

    MaterialTheme(
        colorScheme = colorScheme,
        content = content
    )
}
