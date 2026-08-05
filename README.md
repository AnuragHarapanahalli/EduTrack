# 🛠️ Recent Changes & Updates

Here is a summary of the latest improvements implemented in the project:

| Feature / Change Category | Detailed Description | Affected Files | Visual & UX Impact |
| :--- | :--- | :--- | :--- |
| **Milestone Form Styling & Spacing** | Redesigned milestone forms to match the modern CSS design system. Aligned cards, point badges, Edit/Delete action buttons, and expand chevrons. | [create-milestone-modal.component.ts](file:///D:/CollegeTB/Projects/SEM-PBL3/frontend-angular/src/app/components/modals/create-milestone-modal.component.ts), [classwork.component.css](file:///D:/CollegeTB/Projects/SEM-PBL3/frontend-angular/src/app/components/class-detail/classwork/classwork.component.css) | Milestone modal spacing is clean and unified; cards are well-spaced and properly aligned. |
| **Student Landing Navigation** | Bypassed default pre-selection of first subject on login. Routed student landing to the dashboard. | [view-state.service.ts](file:///D:/CollegeTB/Projects/SEM-PBL3/frontend-angular/src/app/services/view-state.service.ts), [app.html](file:///D:/CollegeTB/Projects/SEM-PBL3/frontend-angular/src/app/app.html) | Students arrive directly on the Netflix-style global progress pathway row view rather than a single class detail page. |
| **Interactive Subject Titles** | Made Netflix subject headers clickable and added custom hover states. | [classwork.component.html](file:///D:/CollegeTB/Projects/SEM-PBL3/frontend-angular/src/app/components/class-detail/classwork/classwork.component.html), [classwork.component.css](file:///D:/CollegeTB/Projects/SEM-PBL3/frontend-angular/src/app/components/class-detail/classwork/classwork.component.css) | Clicking a subject title opens that class's detailed view (defaulting to the Classwork tab and hiding the Stream tab for students). Hovering turns text indigo and slides it right. |
| **Roster & Leaderboard Isolation** | Removed batch-wide enrollment fallbacks. Restricted student roster queries and leaderboard lists. | [SubjectService.java](file:///D:/CollegeTB/Projects/SEM-PBL3/backend/src/main/java/com/edutrack/service/SubjectService.java), [LeaderboardService.java](file:///D:/CollegeTB/Projects/SEM-PBL3/backend/src/main/java/com/edutrack/service/LeaderboardService.java) | Leaderboards, classmate rosters, and course lists are unique to each class. Students only see and compete in classrooms they are explicitly enrolled in. |
| **Needs Revision Color & Logic** | Added orange badges (`gc-badge-orange`) and orange card outlines (`needs-revision`) for submissions. Toggled "Quality Rating" dropdown to "Not Applicable" and disabled it. | [review-roster-modal.component.ts](file:///D:/CollegeTB/Projects/SEM-PBL3/frontend-angular/src/app/components/modals/review-roster-modal.component.ts), [classwork.component.html](file:///D:/CollegeTB/Projects/SEM-PBL3/frontend-angular/src/app/components/class-detail/classwork/classwork.component.html), [classwork.component.css](file:///D:/CollegeTB/Projects/SEM-PBL3/frontend-angular/src/app/components/class-detail/classwork/classwork.component.css), [styles.css](file:///D:/CollegeTB/Projects/SEM-PBL3/frontend-angular/src/styles.css) | Submissions requiring corrections stand out in orange. Faculty cannot assign quality ratings or score approved points until the student resubmits. |
| **Upload Lockouts** | Blocked upload popup triggers. | [classwork.component.html](file:///D:/CollegeTB/Projects/SEM-PBL3/frontend-angular/src/app/components/class-detail/classwork/classwork.component.html) | Students are locked out from clicking or uploading work to milestones that have already been marked as APPROVED. |
| **Roster Auto-Refresh** | Bound reactive signals `refreshTrigger` to the Classwork effect. Added local student addition refresh triggers. | [view-state.service.ts](file:///D:/CollegeTB/Projects/SEM-PBL3/frontend-angular/src/app/services/view-state.service.ts), [classwork.component.ts](file:///D:/CollegeTB/Projects/SEM-PBL3/frontend-angular/src/app/components/class-detail/classwork/classwork.component.ts), [people.component.ts](file:///D:/CollegeTB/Projects/SEM-PBL3/frontend-angular/src/app/components/class-detail/people/people.component.ts), [app.ts](file:///D:/CollegeTB/Projects/SEM-PBL3/frontend-angular/src/app/app.ts) | Adding students or turning in milestone work immediately refreshes the UI list and updates badge status to "Under Review" (in yellow) with submission timestamps. |
| **Layout Padding & Input Gaps** | Added margins to the main content body. Reduced input field left paddings inside form boxes. | [app.css](file:///D:/CollegeTB/Projects/SEM-PBL3/frontend-angular/src/app/app.css), [create-subject-modal.component.ts](file:///D:/CollegeTB/Projects/SEM-PBL3/frontend-angular/src/app/components/modals/create-subject-modal.component.ts), [create-milestone-modal.component.ts](file:///D:/CollegeTB/Projects/SEM-PBL3/frontend-angular/src/app/components/modals/create-milestone-modal.component.ts) | Content doesn't touch the screen borders. Icons sit closer to inputs for a premium and polished visual look. |
| **Teacher Accordion Fixes** | Removed default pre-expansion of first card in milestone list. Triggered Angular change detection explicitly. | [classwork.component.ts](file:///D:/CollegeTB/Projects/SEM-PBL3/frontend-angular/src/app/components/class-detail/classwork/classwork.component.ts) | The teacher milestone list cards are closed by default, and opening/closing them is immediate upon clicking. |
| **Expanded Seed Data** | Added DBMS (Batch A) and Cloud Computing (Batch B) courses. Seeding deliverables as structured JSON arrays. | [DataInitializer.java](file:///D:/CollegeTB/Projects/SEM-PBL3/backend/src/main/java/com/edutrack/config/DataInitializer.java) | The application initializes with 4 classes and pre-mapped JSON milestones for a more complete dashboard demo. |
| **Git Configuration** | Updated `.gitignore` to ignore local ZIP backups, HAR capture logs, and build nodes dynamically. | [.gitignore](file:///D:/CollegeTB/Projects/SEM-PBL3/.gitignore) | Keeps the Git commits clean, preventing bulky and unnecessary dependencies from leaking into the repository. |


# EduTrack - Milestone & Progress Monitoring System for PBL Labs

**EduTrack** is a web-based platform built for Project-Based Learning (PBL) lab milestone tracking, submission management, instructor evaluation, and real-time gamified leaderboards.

---

## 📖 First-Time Setup & Beginner Step-by-Step Guide

Follow these steps if you are running this project for the very first time on your computer.

### 📋 Step 1: Check Prerequisites
Make sure you have the following installed on your machine:
* **Java JDK 17 or higher** (Verify in terminal: `java -version`)
* **Git** (Verify in terminal: `git --version`)
* **Web Browser** (Google Chrome, Microsoft Edge, Firefox, or Safari)
* **Maven** (Optional if using terminal `mvn spring-boot:run` or an IDE like IntelliJ IDEA / Eclipse / VS Code).

---

### 📥 Step 2: Clone the Project
Open terminal / command prompt and run:
```bash
git clone https://github.com/AnuragHarapanahalli/sem-project.git
cd sem-project
```

---

### ⚙️ Step 3: Run the Backend Server

#### Method A: Using Command Line (Maven)
Navigate into the `backend` folder and start the server:
```bash
cd backend
mvn spring-boot:run
```

#### Method B: Using an IDE (IntelliJ IDEA / VS Code / Eclipse)
1. Open your IDE.
2. Select **Open Project** and pick the `backend` folder.
3. Allow the IDE to import Maven dependencies automatically.
4. Navigate to `src/main/java/com/edutrack/EduTrackApplication.java`.
5. Right-click `EduTrackApplication.java` and click **Run**.

> 🟢 **Backend URL**: Runs on `http://localhost:8080`.
> 📊 **H2 Database Console**: Accessible at `http://localhost:8080/h2-console` (JDBC URL: `jdbc:h2:mem:edutrackdb`, Username: `sa`, Password: leave blank).

---

### 🌐 Step 4: Open the Frontend Application
Simply open `frontend/index.html` in your web browser.

* **Windows PowerShell**:
  ```powershell
  Start-Process "frontend/index.html"
  ```
* **Or via Python HTTP Server (Optional)**:
  ```bash
  cd frontend
  python -m http.server 3000
  ```
  Then visit `http://localhost:3000` in your browser.

---

### 🔑 Step 5: Test Pre-Seeded Accounts

The system automatically initializes demo users, subjects, and milestones on startup. You can click the quick demo buttons on the login screen or enter:

| Role | Email | Password | Features Accessible |
|---|---|---|---|
| 👨‍🎓 **Student** | `anurag@edutrack.edu` | `student123` | Upload deliverables, view progress %, check subject leaderboard rank |
| 👨‍🏫 **Faculty / Instructor** | `sharma@edutrack.edu` | `prof123` | Create milestones, review student deliverables, assign 1-5 star quality ratings & feedback |
| 🛠️ **Admin** | `admin@edutrack.edu` | `admin123` | System setup & user management |

---

### 🧪 Step 6: End-to-End Test Walkthrough

1. **Log in as Student** (`anurag@edutrack.edu` / `student123`).
2. Click **Upload Submission** on *Milestone 1*, select a file or repository link, and submit.
3. Log out, then **Log in as Faculty** (`sharma@edutrack.edu` / `prof123`).
4. Click the **Submissions Review** tab and click **Evaluate Work** on the uploaded deliverable.
5. Select **APPROVED**, set Quality Rating to **5 Stars**, enter feedback, and submit.
6. Switch to the **Subject Leaderboard** tab to view the live updated student rank and points!

---

## 🏗️ Architecture & Folder Structure

```
sem-project/
├── frontend/                 # Single Page Application (HTML5, Vanilla CSS3, JS ES6+)
│   ├── index.html            # Main UI Dashboard & Auth Views
│   ├── css/styles.css        # Glassmorphism Design System & Dark Theme
│   └── js/
│       ├── api.js            # REST API Client wrapper with JWT authorization headers
│       └── app.js            # View Router & Interface Event Handlers
│
├── backend/                  # Java Spring Boot 3.2 REST API Server
│   ├── pom.xml               # Maven Dependencies (Spring Web, Data JPA, Security, JWT, H2, Postgres)
│   └── src/main/java/com/edutrack/
│       ├── config/           # Security, JWT Token Provider, Data Initializer
│       ├── controller/       # Auth, Subject, Milestone, Submission, Leaderboard, File Controllers
│       ├── dto/              # Request & Response Data Transfer Objects
│       ├── model/            # User, Subject, Batch, Milestone, Submission Entities & Enums
│       ├── repository/       # Spring Data JPA Repositories
│       └── service/          # Business logic, Points algorithm, File storage
│
├── uploads/                  # Local folder for student deliverable file uploads
└── README.md                  # Project Documentation & Step-by-Step Guide
```

---

## 🧮 Points & Gamification Formula (SRS Section 4.4)

$$\text{Final Points} = \text{Base Points} \times \text{Timeliness Multiplier} \times \frac{\text{Quality Rating}}{5}$$

* **Timeliness Multipliers**:
  * **Early** ($\ge 24\text{ hours}$ before deadline): **$1.2\times$**
  * **On-Time** (before deadline): **$1.0\times$**
  * **Late** (after deadline): **$0.5\times$**
* **Quality Rating**: 1 to 5 stars selected by Instructor during review.
* **Points Rule**: Points are awarded **only** when status is `APPROVED`.
