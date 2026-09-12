package com.edutrack.data.remote

import com.edutrack.platform.SecureStorage
import com.edutrack.platform.platformName
import io.ktor.client.HttpClient
import io.ktor.client.plugins.DefaultRequest
import io.ktor.client.plugins.HttpTimeout
import io.ktor.client.plugins.auth.Auth
import io.ktor.client.plugins.auth.providers.BearerTokens
import io.ktor.client.plugins.auth.providers.bearer
import io.ktor.client.plugins.contentnegotiation.ContentNegotiation
import io.ktor.client.plugins.logging.LogLevel
import io.ktor.client.plugins.logging.Logging
import io.ktor.client.plugins.logging.Logger
import io.ktor.client.request.header
import io.ktor.http.ContentType
import io.ktor.http.HttpHeaders
import io.ktor.serialization.kotlinx.json.json
import kotlinx.serialization.json.Json

object KtorClientFactory {

    // On iOS Simulator: Mac host is reached via 127.0.0.1
    // On Android Emulator: Mac host is reached via 10.0.2.2
    // On Physical Device (Wi-Fi): Mac host is reached via local Wi-Fi IP (e.g. 192.168.1.137)
    var defaultHost: String = if (platformName.contains("Android", ignoreCase = true)) {
        "10.0.2.2"
    } else {
        "127.0.0.1"
    }

    var baseUrl: String = "http://$defaultHost:8080/api"

    fun updateHost(newHost: String) {
        val clean = newHost.trim().removePrefix("http://").removePrefix("https://").substringBefore(":")
        defaultHost = clean
        baseUrl = "http://$defaultHost:8080/api"
    }

    fun create(secureStorage: SecureStorage): HttpClient {
        return HttpClient {
            install(HttpTimeout) {
                requestTimeoutMillis = 20000
                connectTimeoutMillis = 10000
                socketTimeoutMillis = 20000
            }

            install(ContentNegotiation) {
                json(Json {
                    ignoreUnknownKeys = true
                    prettyPrint = true
                    isLenient = true
                    encodeDefaults = true
                })
            }

            install(Logging) {
                level = LogLevel.INFO
                logger = object : Logger {
                    override fun log(message: String) {
                        println("[KtorClient] $message")
                    }
                }
            }

            install(Auth) {
                bearer {
                    loadTokens {
                        val token = secureStorage.getToken()
                        if (token != null) {
                            BearerTokens(token, "")
                        } else null
                    }
                }
            }

            install(DefaultRequest) {
                header(HttpHeaders.ContentType, ContentType.Application.Json)
            }
        }
    }
}
