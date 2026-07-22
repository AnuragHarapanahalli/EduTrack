# EduTrack - Milestone & Progress Monitoring System for PBL Labs

**EduTrack** is a web-based platform built for Project-Based Learning (PBL) lab milestone tracking, submission management, instructor evaluation, and real-time gamified leaderboards.

---

## 🏗️ Architecture Overview

```
SEM-PBL3/
├── frontend/                 # Single Page Application (HTML5, Vanilla CSS3, JS ES6+)
│   ├── index.html            # Main UI Dashboard & Auth Views
│   ├── css/styles.css        # Glassmorphism Design System & Responsive Layout
│   └── js/
│       ├── api.js            # REST API Client wrapper with JWT handling
│       └── app.js            # Router, State Management, and Interactive Modals
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
└── EduTrack_SRS (1).docx     # Software Requirements Specification Document
```

---

## ⚙️ Core System Features & SRS Rules

### 1. User Roles & Authentication
- **Student**: View enrolled subject milestones, upload deliverable files/links, check evaluation status, view personal progress %, check subject leaderboard.
- **Instructor**: Create subjects, assign to batches, define milestones with deadlines & base points, review submissions, assign quality rating (1–5), give feedback.
- **Admin**: System configuration and batch mapping.

### 2. Gamified Points Formula (SRS Section 4.4 & 5.5)
$$\text{Final Points} = \text{Base Points} \times \text{Timeliness Multiplier} \times \frac{\text{Quality Rating}}{5}$$

* **Timeliness Multiplier**:
  * **Early** ($\ge 24\text{ hours}$ before deadline): **$1.2\times$**
  * **On-Time** (before deadline): **$1.0\times$**
  * **Late** (after deadline): **$0.5\times$**
* **Quality Rating**: $1$ to $5$ stars awarded by Instructor upon approval.
* **Points Rule**: Points are awarded **only** when status is `APPROVED`. `NEEDS_REVISION` earns $0$ points until resubmitted and approved.

### 3. File Storage
- Deliverables uploaded by students are automatically saved locally inside the [`uploads/`](file:///D:/CollegeTB/Projects/SEM-PBL3/uploads) folder on the machine.

---

## 🗄️ Database Configurations

### 1. Active Development Profile (H2 In-Memory DB)
The project defaults to H2 for zero-configuration local testing.
- **H2 Console**: `http://localhost:8080/h2-console`
- **JDBC URL**: `jdbc:h2:mem:edutrackdb`
- **Username**: `sa` | **Password**: *(leave blank)*

### 2. PostgreSQL Production Profile
To switch to PostgreSQL:
1. Update `application.yml` profile active setting to `postgres` (or run with `-Dspring.profiles.active=postgres`).
2. Ensure PostgreSQL is running locally on port `5432` with database `edutrackdb`.

---

## 🚀 How to Run

### Running the Frontend
Simply open [`frontend/index.html`](file:///D:/CollegeTB/Projects/SEM-PBL3/frontend/index.html) in any web browser (Chrome, Edge, Firefox, Safari) or serve it using any HTTP server.

### Running the Backend
With Java 17+ installed:
```bash
cd backend
mvn spring-boot:run
```
*(Or import the `backend` folder into IntelliJ IDEA / Eclipse / VS Code as a Maven project).*

---

## 🔑 Quick Demo Credentials

| Role | Email | Password |
|---|---|---|
| **Student** | `anurag@edutrack.edu` | `student123` |
| **Faculty / Instructor** | `sharma@edutrack.edu` | `prof123` |
| **Admin** | `admin@edutrack.edu` | `admin123` |
