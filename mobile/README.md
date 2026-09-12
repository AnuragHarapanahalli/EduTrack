# 📱 EduTrack Mobile (Kotlin Multiplatform & Compose Multiplatform)

**EduTrack Mobile** is the cross-platform mobile companion for the EduTrack Project-Based Learning (PBL) monitoring system, built using **Kotlin Multiplatform (KMP)** and **Compose Multiplatform**.

A single shared codebase powers both **Android** and **iOS**, featuring **dynamic role-based segregation** upon login for **Students** and **Faculty/Teachers**.

---

## 🚀 Tech Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Core Architecture** | **Kotlin Multiplatform (KMP)** | Shared business logic, models, networking, database & DI across platforms |
| **Cross-Platform UI** | **Compose Multiplatform** | 100% shared UI layout, animations, and Dark/Light glassmorphism design system |
| **Networking** | **Ktor Client** | Asynchronous HTTP client with JSON serialization, JWT Bearer auth & multipart file uploads |
| **Local Cache / DB** | **SQLDelight** | Typesafe SQLite local database for offline lab resilience |
| **Async Operations** | **Kotlin Coroutines & Flow** | Reactive unidirectional state streams |
| **Dependency Injection**| **Koin Multiplatform** | Unified DI container across commonMain, Android, and iOS |
| **Platform Bridges** | `expect` / `actual` | Native secure token storage, document picker, and SQLite drivers |
| **Testing** | `kotlin.test` & JUnit | Multiplatform unit tests for PBL points formula and milestone lock validation |
| **CI / CD** | **GitHub Actions** | Automated testing, Android APK compilation, and iOS XCFramework bundling |

---

## 🎯 Role-Based Segregation in One App

The app automatically detects the user's role upon login and routes them to their dedicated experience:

### 👩‍🎓 Student Experience (`Role.STUDENT`)
* **Enrolled Classes Carousel**: Easily switch between enrolled PBL lab subjects.
* **Hero Milestone Card**: Highlights the nearest active deadline with a live countdown.
* **Sequential Progression Locks**: Automatically gates Milestone $N+1$ until Milestone $N$ has been evaluated and marked `APPROVED` by the instructor.
* **Deliverable Upload Sheet**: Submit documents, files, or external repository links (GitHub/Figma) with private notes.
* **Live Subject Leaderboard**: View rankings, completion percentage, and 🥇🥈🥉 podium badges with automatic tie handling.

### 👨‍🏫 Teacher / Faculty Experience (`Role.INSTRUCTOR`)
* **Subject Portfolio**: Access all lab subjects taught by the faculty member.
* **Milestone Management**: View and create new milestones with deadline, base points, max marks, and deliverable rules.
* **Submissions Review Roster**: Inspect submitted deliverables, repository links, and student notes.
* **Grading Interface**:
  * Set status (`APPROVED` vs `NEEDS_REVISION`).
  * Enter obtained marks (or 1–5 star quality rating).
  * Add private constructive feedback.
  * **Marks Locked Switch**: Controls whether marks are published to students and counted toward the live leaderboard.

---

## 📂 Project Structure

```text
mobile/
├── androidApp/                         # Android application shell
│   ├── build.gradle.kts
│   └── src/main/
│       ├── AndroidManifest.xml
│       └── java/com/edutrack/android/
│           ├── EduTrackApp.kt          # Koin initialization with Android Context
│           └── MainActivity.kt         # Entry Activity hosting Compose App()
├── shared/                             # Shared Kotlin Multiplatform module
│   ├── build.gradle.kts
│   └── src/
│       ├── commonMain/
│       │   ├── sqldelight/             # SQLDelight database queries & schema
│       │   └── kotlin/com/edutrack/
│       │       ├── data/
│       │       │   ├── model/          # User, Subject, Milestone, Submission, Leaderboard
│       │       │   ├── remote/         # Ktor API service, Bearer Auth & Multipart
│       │       │   ├── local/          # SQLDelight LocalDataStore caching
│       │       │   └── repository/     # Offline-first repository
│       │       ├── di/                 # Koin DI module & init functions
│       │       ├── platform/           # expect declarations (Storage, Driver)
│       │       └── ui/
│       │           ├── App.kt          # Root composable with role-based routing
│       │           ├── theme/          # Color system, Glassmorphism & Typography
│       │           ├── components/     # TopBar, StatusBadge, PodiumHeader
│       │           ├── screens/
│       │           │   ├── auth/       # Login screen with quick demo pills
│       │           │   ├── student/    # Student dashboard, milestones & upload sheet
│       │           │   ├── teacher/    # Teacher dashboard, roster & grading sheet
│       │           │   └── common/     # Gamified leaderboard with podium
│       │           └── viewmodel/      # Auth, Student, Teacher & Leaderboard ViewModels
│       ├── commonTest/                 # Unit tests (Points formula & Lock validation)
│       ├── androidMain/                # actual implementations (Android SharedPreferences & SQLite)
│       └── iosMain/                    # actual implementations (iOS NSUserDefaults & Native SQLite)
└── iosApp/                             # iOS native SwiftUI shell
    ├── iOSApp.swift                    # Calls initKoinIos and sets ComposeView
    └── ContentView.swift               # UIViewControllerRepresentable bridging Compose
```

---

## 🧪 Testing Multiplatform Logic

Run multiplatform tests across shared modules:

```bash
cd mobile
./gradlew :shared:allTests
```

Tests cover:
1. **PBL Gamification Formula**:
   $$\text{Final Points} = \text{Base Points} \times \text{Timeliness Multiplier} \times \left(\frac{\text{Obtained Marks}}{\text{Max Marks}}\right)$$
   * Early submission ($\ge 24\text{ hours}$ before deadline) $\to 1.2\times$ (+20% bonus).
   * On-time submission $\to 1.0\times$.
   * Late submission $\to 0.5\times$ (-50% penalty).
2. **Prerequisite Gating**: Validates that Milestone $N+1$ unlocks **only** when Milestone $N$ status is `APPROVED`.

---

## 🏃‍♂️ How to Run

### Prerequisites
* **Java JDK 17+**
* **Android Studio Iguana / Jellyfish / Koala** with Android SDK 34
* **Xcode 15+** (for running the iOS target on macOS)

### 1. Start the Backend Server
Make sure the EduTrack Spring Boot backend is running:
```bash
cd backend
mvn spring-boot:run
```
*(Backend runs on `http://localhost:8080`)*

### 2. Run Android Application
1. Open the `/mobile` directory in **Android Studio**.
2. Select the `androidApp` configuration.
3. Pick an Android Emulator (API 30+) or a connected device.
4. Click **Run** (`Shift + F10`).
*(Note: Android emulators connect to your local backend via `10.0.2.2:8080`, which is pre-configured in `KtorClientFactory.kt`)*.

### 3. Run iOS Application
1. In terminal, assemble the shared XCFramework:
   ```bash
   cd mobile
   ./gradlew :shared:assembleXCFramework
   ```
2. Open `mobile/iosApp` in **Xcode**.
3. Select an iOS Simulator (e.g. iPhone 15 Pro) and press **Cmd + R**.

---

## 🔑 Pre-Seeded Demo Credentials

| Role | Email | Password | Primary Experience |
| :--- | :--- | :--- | :--- |
| 👨‍🎓 **Student** | `anurag@edutrack.edu` | `student123` | Classwork progression, upload deliverables, view score & feedback, check leaderboard |
| 👨‍🏫 **Faculty** | `sharma@edutrack.edu` | `prof123` | Create milestones, review student roster, grade with stars/marks, lock & publish grades |
