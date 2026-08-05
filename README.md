# 🛠️ Recent Changes & Updates

Here is a summary of the latest improvements implemented in the project:
* **Student Landing Page**: Students now land directly on the Netflix-style path overview showing the countdown hero card and subjects rows.
* **Roster & Leaderboard Isolation**: Leaderboards and classmate rosters are now fully isolated class-by-class (showing only enrolled students).
* **"Needs Revision" Status**: Added a new orange status color (`gc-badge-orange`) for milestones needing revision, and automatically disable/set the Quality Rating stars dropdown to "Not Applicable".
* **Submissions Auto-Update**: Modal closes immediately trigger reactive updates in student views to show the yellow "Under Review" state and upload time.
* **Card & Row Spacing**: Refined padding buffers on pages and form elements to make them premium, spacious, and responsive.
* **Upload Lockouts**: Click prompts are blocked on already approved milestone cards.
* **Teacher Page Accordion**: Toggled detection triggers and turned off default first-card pre-expansion.

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
