# EduTrack - System Entities & REST API Endpoint Specifications

This document provides a comprehensive reference of all **Database Entities**, **Data Models (DTOs)**, and **REST API Endpoints** for the **EduTrack Project-Based Learning (PBL) System**.

---

## 📑 Table of Contents
1. [Domain Data Models & Entities](#1-domain-data-models--entities)
   - [User Entity](#11-user-entity)
   - [Role Enum](#12-role-enum)
   - [Batch Entity](#13-batch-entity)
   - [Subject Entity](#14-subject-entity)
   - [Milestone Entity](#15-milestone-entity)
   - [Submission Entity](#16-submission-entity)
   - [SubmissionStatus Enum](#17-submissionstatus-enum)
2. [Data Transfer Objects (DTOs)](#2-data-transfer-objects-dtos)
3. [REST API Endpoint Documentation](#3-rest-api-endpoint-documentation)
   - [Authentication APIs (`/api/auth`)](#31-authentication-apis-apiauth)
   - [Subject & Enrollment APIs (`/api/subjects`)](#32-subject--enrollment-apis-apisubjects)
   - [Milestone APIs (`/api/milestones`)](#33-milestone-apis-apimilestones)
   - [Submission & Evaluation APIs (`/api/submissions`)](#34-submission--evaluation-apis-apisubmissions)
   - [Leaderboard APIs (`/api/leaderboard`)](#35-leaderboard-apis-apileaderboard)

---

## 1. Domain Data Models & Entities

### 1.1 User Entity
- **Table Name**: `users`
- **Description**: Represents user accounts across all roles (Student, Instructor/Faculty, Admin).

| Field Name | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `Long` | Primary Key, Auto-increment | Unique identifier for the user |
| `email` | `String` | Unique, Not Null | Account email address used for sign-in |
| `password` | `String` | Not Null | BCrypt hashed password string |
| `fullName` | `String` | Not Null | Full legal or display name of the user |
| `role` | `Role` | Enum (String), Not Null | Role assignment: `STUDENT`, `INSTRUCTOR`, or `ADMIN` |
| `batch` | `Batch` | ManyToOne, Nullable | Enrolled academic batch (primarily for students) |
| `createdAt` | `LocalDateTime` | Not Null | Timestamp of account registration |

---

### 1.2 Role Enum
- **Package**: `com.edutrack.model.Role`

```java
public enum Role {
    STUDENT,
    INSTRUCTOR,
    ADMIN
}
```

---

### 1.3 Batch Entity
- **Table Name**: `batches`
- **Description**: Groups students into academic cohorts/sections (e.g., *B.Tech CSE 2026 - Batch A*).

| Field Name | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `Long` | Primary Key, Auto-increment | Unique identifier for the batch |
| `name` | `String` | Not Null, Unique | Name of the batch/section |
| `academicYear` | `String` | Nullable | Academic session year (e.g., `2025-2026`) |
| `createdAt` | `LocalDateTime` | Not Null | Record creation timestamp |

---

### 1.4 Subject Entity
- **Table Name**: `subjects`
- **Description**: Academic lab course created by a faculty member.

| Field Name | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `Long` | Primary Key, Auto-increment | Unique subject identifier |
| `name` | `String` | Not Null | Full subject title (e.g. *CSE20140 - Project Based Learning III*) |
| `code` | `String` | Not Null, Unique | Course code (e.g. *CSE20140-PBL3*) |
| `instructor` | `User` | ManyToOne, Not Null | Faculty member managing the subject |
| `batch` | `Batch` | ManyToOne, Not Null | Assigned default batch |
| `description` | `String` | Text | Course overview and lab objectives |
| `enrolledStudents` | `Set<User>` | ManyToMany (`subject_enrolled_students`) | Students explicitly enrolled in this subject |

---

### 1.5 Milestone Entity
- **Table Name**: `milestones`
- **Description**: Sequential lab deliverable milestone set by faculty.

| Field Name | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `Long` | Primary Key, Auto-increment | Unique milestone identifier |
| `subject` | `Subject` | ManyToOne, Not Null | Parent subject |
| `title` | `String` | Not Null | Milestone heading (e.g., *Milestone 1: SRS Document*) |
| `description` | `String` | Text (2000 chars) | Instructions and deliverables description |
| `deadline` | `LocalDateTime` | Not Null | Due date and time |
| `basePoints` | `Double` | Not Null | Base points allocatable upon approval (e.g. `100.0`) |
| `requiredDeliverables` | `String` | Text | JSON array string of deliverable items & formats |
| `isMandatory` | `Boolean` | Default `true` | Indicates if milestone is mandatory for completion |
| `createdAt` | `LocalDateTime` | Not Null | Creation timestamp |

---

### 1.6 Submission Entity
- **Table Name**: `submissions`
- **Description**: Deliverables submitted by a student for a specific milestone.

| Field Name | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `Long` | Primary Key, Auto-increment | Unique submission record ID |
| `milestone` | `Milestone` | ManyToOne, Not Null | Target milestone |
| `student` | `User` | ManyToOne, Not Null | Submitting student |
| `fileUrl` | `String` | Nullable | Path to locally stored deliverable file (`/uploads/...`) |
| `submissionLink` | `String` | Nullable | External repository URL or live demo link |
| `comments` | `String` | Text | Student comments or notes |
| `submittedAt` | `LocalDateTime` | Not Null | Date & time when deliverables were uploaded |
| `status` | `SubmissionStatus` | Enum (String), Not Null | `SUBMITTED`, `APPROVED`, `NEEDS_REVISION`, `OVERDUE` |
| `qualityRating` | `Integer` | Nullable (1 to 5) | Faculty evaluation rating (1 = Poor, 5 = Exceptional) |
| `timelinessMultiplier` | `Double` | Nullable | Calculated multiplier: `1.2` (Early), `1.0` (On-Time), `0.5` (Late) |
| `finalPoints` | `Double` | Nullable | $\text{Final Points} = \text{Base Points} \times \text{Timeliness} \times \frac{\text{Quality}}{5}$ |
| `instructorFeedback` | `String` | Text | Constructive review comments from faculty |
| `reviewedAt` | `LocalDateTime` | Nullable | Evaluation timestamp |

---

### 1.7 SubmissionStatus Enum
- **Package**: `com.edutrack.model.SubmissionStatus`

```java
public enum SubmissionStatus {
    SUBMITTED,
    APPROVED,
    NEEDS_REVISION,
    OVERDUE
}
```

---

## 2. Data Transfer Objects (DTOs)

### AuthDto
- `RegisterRequest`: `{ fullName, email, password, role, batchId }`
- `LoginRequest`: `{ email, password }`
- `AuthResponse`: `{ token, type = "Bearer", user: UserDto }`
- `UserDto`: `{ id, email, fullName, role, batchId, batchName }`

### SubjectDto
- `CreateSubjectRequest`: `{ name, code, batchId, description }`
- `SubjectResponse`: `{ id, name, code, instructorName, instructorId, batchName, batchId, description, totalMilestones }`

### MilestoneDto
- `CreateMilestoneRequest`: `{ subjectId, title, description, deadline, basePoints, requiredDeliverables, isMandatory }`
- `MilestoneResponse`: `{ id, subjectId, subjectName, title, description, deadline, basePoints, requiredDeliverables, isMandatory, isOverdue }`

### SubmissionDto
- `ReviewSubmissionRequest`: `{ status, qualityRating, feedback }`
- `SubmissionResponse`: `{ id, milestoneId, milestoneTitle, studentId, studentName, studentEmail, fileUrl, submissionLink, comments, submittedAt, status, qualityRating, timelinessMultiplier, finalPoints, instructorFeedback, reviewedAt }`
- `MilestoneRosterResponse`: `{ studentId, studentName, studentEmail, submissionId, status, submittedAt, timelinessLabel, timelinessMultiplier, fileUrl, submissionLink, comments, qualityRating, finalPoints, instructorFeedback }`

### LeaderboardDto
- `LeaderboardEntryResponse`: `{ studentId, studentName, studentEmail, totalPoints, approvedMilestonesCount, totalSubjectMilestonesCount, completionPercentage, rank }`

---

## 3. REST API Endpoint Documentation

Base API URL: `http://localhost:8080/api`

---

### 3.1 Authentication APIs (`/api/auth`)

#### `POST /api/auth/register`
- **Description**: Registers a new user account (Student, Instructor, or Admin).
- **Request Body**:
```json
{
  "fullName": "Anurag Harapanahalli",
  "email": "anurag@edutrack.edu",
  "password": "student123",
  "role": "STUDENT",
  "batchId": 1
}
```
- **Response** (`200 OK`):
```json
{
  "token": "eyJhbGciOiJIUzUxMiJ9...",
  "type": "Bearer",
  "user": {
    "id": 1,
    "email": "anurag@edutrack.edu",
    "fullName": "Anurag Harapanahalli",
    "role": "STUDENT",
    "batchId": 1,
    "batchName": "B.Tech CSE 2026 - Batch A"
  }
}
```

---

#### `POST /api/auth/login`
- **Description**: Authenticates an existing user and generates a JWT bearer token.
- **Request Body**:
```json
{
  "email": "sharma@edutrack.edu",
  "password": "prof123"
}
```
- **Response** (`200 OK`):
```json
{
  "token": "eyJhbGciOiJIUzUxMiJ9...",
  "type": "Bearer",
  "user": {
    "id": 2,
    "email": "sharma@edutrack.edu",
    "fullName": "Prof. Rajesh Sharma",
    "role": "INSTRUCTOR",
    "batchId": null,
    "batchName": null
  }
}
```

---

#### `GET /api/auth/users/{id}`
- **Description**: Retrieves profile info for a specific user ID.
- **Headers**: `Authorization: Bearer <token>`
- **Response** (`200 OK`): `UserDto` JSON object.

---

### 3.2 Subject & Enrollment APIs (`/api/subjects`)

#### `POST /api/subjects?instructorId={instructorId}`
- **Description**: Faculty creates a new subject course.
- **Headers**: `Authorization: Bearer <token>`
- **Query Parameter**: `instructorId` (`Long`)
- **Request Body**:
```json
{
  "name": "CSE20140 - Project Based Learning III",
  "code": "CSE20140-PBL3",
  "batchId": 1,
  "description": "Fullstack web application development lab focusing on software architecture."
}
```
- **Response** (`200 OK`):
```json
{
  "id": 1,
  "name": "CSE20140 - Project Based Learning III",
  "code": "CSE20140-PBL3",
  "instructorName": "Prof. Rajesh Sharma",
  "instructorId": 2,
  "batchName": "B.Tech CSE 2026 - Batch A",
  "batchId": 1,
  "description": "Fullstack web application development lab focusing on software architecture.",
  "totalMilestones": 0
}
```

---

#### `GET /api/subjects`
- **Description**: Fetches all subjects in the system.
- **Response** (`200 OK`): Array of `SubjectResponse`.

---

#### `GET /api/subjects/instructor/{instructorId}`
- **Description**: Fetches subjects created by a specific faculty member.
- **Response** (`200 OK`): Array of `SubjectResponse`.

---

#### `GET /api/subjects/student/{studentId}`
- **Description**: Fetches subjects strictly enrolled by a specific student ID.
- **Response** (`200 OK`): Array of `SubjectResponse`.

---

#### `GET /api/subjects/{id}`
- **Description**: Fetches subject details by subject ID.
- **Response** (`200 OK`): `SubjectResponse`.

---

#### `POST /api/subjects/{id}/students/manual?fullName={fullName}&email={email}`
- **Description**: Faculty manually enrolls a student into a subject. Automatically registers a student account if they don't exist yet.
- **Headers**: `Authorization: Bearer <token>`
- **Path Parameter**: `id` (`Long` - Subject ID)
- **Query Parameters**: `fullName` (`String`), `email` (`String`)
- **Response** (`200 OK`): Enrolled `UserDto`.

---

#### `GET /api/subjects/{id}/students`
- **Description**: Retrieves the list of all students enrolled in a subject.
- **Response** (`200 OK`): Array of `UserDto`.

---

### 3.3 Milestone APIs (`/api/milestones`)

#### `POST /api/milestones`
- **Description**: Faculty creates a new milestone with multi-deliverable requirements and mandatory flags.
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
```json
{
  "subjectId": 1,
  "title": "Milestone 2: Software Requirements Specification (SRS)",
  "description": "Submit IEEE 830 formatted SRS document detailing functional requirements.",
  "deadline": "2026-08-15T23:59:00",
  "basePoints": 150.0,
  "requiredDeliverables": "[{\"title\":\"SRS PDF Document\",\"isMandatory\":true},{\"title\":\"GitHub Repo URL\",\"isMandatory\":true}]",
  "isMandatory": true
}
```
- **Response** (`200 OK`):
```json
{
  "id": 2,
  "subjectId": 1,
  "subjectName": "CSE20140 - Project Based Learning III",
  "title": "Milestone 2: Software Requirements Specification (SRS)",
  "description": "Submit IEEE 830 formatted SRS document detailing functional requirements.",
  "deadline": "2026-08-15T23:59:00",
  "basePoints": 150.0,
  "requiredDeliverables": "[{\"title\":\"SRS PDF Document\",\"isMandatory\":true},{\"title\":\"GitHub Repo URL\",\"isMandatory\":true}]",
  "isMandatory": true,
  "isOverdue": false
}
```

---

#### `GET /api/milestones/subject/{subjectId}`
- **Description**: Retrieves all milestones for a subject ordered by deadline ascending.
- **Response** (`200 OK`): Array of `MilestoneResponse`.

---

#### `GET /api/milestones/{id}`
- **Description**: Fetches milestone details by ID.
- **Response** (`200 OK`): `MilestoneResponse`.

---

#### `DELETE /api/milestones/{id}`
- **Description**: Deletes a milestone by ID.
- **Response** (`204 No Content`).

---

### 3.4 Submission & Evaluation APIs (`/api/submissions`)

#### `POST /api/submissions/upload`
- **Description**: Uploads deliverable file and/or repository link for a milestone. Automatically calculates the timeliness multiplier (1.2x early, 1.0x on-time, 0.5x late).
- **Headers**: `Content-Type: multipart/form-data`
- **Form Data Parameters**:
  - `milestoneId`: `Long` (required)
  - `studentId`: `Long` (required)
  - `file`: `MultipartFile` (optional deliverable file stored in `/uploads/`)
  - `submissionLink`: `String` (optional repository or live demo link)
  - `comments`: `String` (optional submission notes)
- **Response** (`200 OK`):
```json
{
  "id": 10,
  "milestoneId": 2,
  "milestoneTitle": "Milestone 2: Software Requirements Specification (SRS)",
  "studentId": 1,
  "studentName": "Anurag Harapanahalli",
  "studentEmail": "anurag@edutrack.edu",
  "fileUrl": "/uploads/1721915432100_srs_report.pdf",
  "submissionLink": "https://github.com/AnuragHarapanahalli/sem-project",
  "comments": "Completed SRS document following IEEE 830 standards.",
  "submittedAt": "2026-07-29T09:30:00",
  "status": "SUBMITTED",
  "qualityRating": null,
  "timelinessMultiplier": 1.2,
  "finalPoints": 0.0,
  "instructorFeedback": null,
  "reviewedAt": null
}
```

---

#### `PUT /api/submissions/{id}/review`
- **Description**: Faculty grades and evaluates a student submission using SRS points formula:
  $$\text{Final Points} = \text{Base Points} \times \text{Timeliness Multiplier} \times \frac{\text{Quality Rating}}{5}$$
- **Request Body**:
```json
{
  "status": "APPROVED",
  "qualityRating": 5,
  "feedback": "Outstanding specification work and architecture diagram!"
}
```
- **Response** (`200 OK`):
```json
{
  "id": 10,
  "status": "APPROVED",
  "qualityRating": 5,
  "timelinessMultiplier": 1.2,
  "finalPoints": 180.0,
  "instructorFeedback": "Outstanding specification work and architecture diagram!",
  "reviewedAt": "2026-07-29T10:00:00"
}
```

---

#### `GET /api/submissions/milestone/{milestoneId}/roster`
- **Description**: Retrieves complete student roster for a milestone, detailing submission status, date & time, and timeliness label (*Early +1.2x*, *On-Time 1.0x*, *Delayed 0.5x*, *Overdue*).
- **Response** (`200 OK`):
```json
[
  {
    "studentId": 1,
    "studentName": "Anurag Harapanahalli",
    "studentEmail": "anurag@edutrack.edu",
    "submissionId": 10,
    "status": "APPROVED",
    "submittedAt": "2026-07-29T09:30:00",
    "timelinessLabel": "Early (+1.2x)",
    "timelinessMultiplier": 1.2,
    "fileUrl": "/uploads/1721915432100_srs_report.pdf",
    "submissionLink": "https://github.com/AnuragHarapanahalli/sem-project",
    "comments": "Completed SRS document",
    "qualityRating": 5,
    "finalPoints": 180.0,
    "instructorFeedback": "Outstanding work!"
  },
  {
    "studentId": 3,
    "studentName": "Priya Patel",
    "studentEmail": "priya@edutrack.edu",
    "submissionId": null,
    "status": "OVERDUE",
    "submittedAt": null,
    "timelinessLabel": "Pending Submission",
    "timelinessMultiplier": null,
    "fileUrl": null,
    "submissionLink": null,
    "comments": null,
    "qualityRating": null,
    "finalPoints": null,
    "instructorFeedback": null
  }
]
```

---

#### `GET /api/submissions/student/{studentId}`
- **Description**: Fetches all submissions submitted by a specific student.
- **Response** (`200 OK`): Array of `SubmissionResponse`.

---

#### `GET /api/submissions/milestone/{milestoneId}/student/{studentId}`
- **Description**: Fetches a single submission for a specific milestone and student.
- **Response** (`200 OK`): `SubmissionResponse` or `404 Not Found`.

---

### 3.5 Leaderboard APIs (`/api/leaderboard`)

#### `GET /api/leaderboard/subject/{subjectId}`
- **Description**: Calculates and returns real-time leaderboard rankings for a subject sorted by total points descending.
- **Response** (`200 OK`):
```json
[
  {
    "studentId": 1,
    "studentName": "Anurag Harapanahalli",
    "studentEmail": "anurag@edutrack.edu",
    "totalPoints": 480.0,
    "approvedMilestonesCount": 3,
    "totalSubjectMilestonesCount": 4,
    "completionPercentage": 75,
    "rank": 1
  },
  {
    "studentId": 3,
    "studentName": "Priya Patel",
    "studentEmail": "priya@edutrack.edu",
    "totalPoints": 150.0,
    "approvedMilestonesCount": 1,
    "totalSubjectMilestonesCount": 4,
    "completionPercentage": 25,
    "rank": 2
  }
]
```
