import SwiftUI
import SharedApp

@main
struct iOSApp: App {
    init() {
        KoinKt.doInitKoinIos(
            secureStorage: SecureStorage(),
            driverFactory: DatabaseDriverFactory()
        )
    }

    var body: some Scene {
        WindowGroup {
            ContentView()
                .ignoresSafeArea(.all)
        }
    }
}
