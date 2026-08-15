# EduTrack REST API Documentation

Complete specification of all REST API endpoints implemented in the EduTrack Spring Boot backend.

Base URL: `http://localhost:8080/api`

---

## 🔐 1. Authentication Endpoints

### 1.1 Register User
* **Endpoint**: `POST /api/auth/register`
* **Description**: Registers a new user account (`STUDENT`, `INSTRUCTOR`, or `ADMIN`).
* **Headers**: `Content-Type: application/json`

#### Request Body Example
```json
{
  "fullName": "Anurag Harapanahalli",
  "email": "anurag@edutrack.edu",
  "password": "student123",
  "role": "STUDENT",
  "batchId": 1
}
```

#### Response Body Example (200 OK)
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhbnVyYWdAZWR1dHJhY2suZWR1Iiwicm9sZSI6IlNUVURFTlQiLCJ1c2VySWQiOjQsImlhdCI6MTc4NDczMzYwMCwiZXhwIjoxNzg0ODE5NjAwfQ.signature_string",
  "user": {
    "id": 4,
    "email": "anurag@edutrack.edu",
    "fullName": "Anurag Harapanahalli",
    "role": "STUDENT",
    "batchId": 1,
    "batchName": "B.Tech CSE 2026 - Batch A"
  }
}
```

---

### 1.2 Login User
* **Endpoint**: `POST /api/auth/login`
* **Description**: Authenticates user credentials and returns a JWT token.
* **Headers**: `Content-Type: application/json`

#### Request Body Example
```json
{
  "email": "sharma@edutrack.edu",
  "password": "prof123"
}
```

#### Response Body Example (200 OK)
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJzaGFybWFAZWR1dHJhY2suZWR1Iiwicm9sZSI6IklOU1RSVUNUT1IiLCJ1c2VySWQiOjIsImlhdCI6MTc4NDczMzYwMCwiZXhwIjoxNzg0ODE5NjAwfQ.signature_string",
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

### 1.3 Get User Profile
* **Endpoint**: `GET /api/auth/users/{id}`
* **Description**: Fetches user profile information by user ID.
* **Headers**: `Authorization: Bearer <JWT_TOKEN>`

#### Response Body Example (200 OK)
```json
{
  "id": 4,
  "email": "anurag@edutrack.edu",
  "fullName": "Anurag Harapanahalli",
  "role": "STUDENT",
  "batchId": 1,
  "batchName": "B.Tech CSE 2026 - Batch A"
}
```

---

## 📚 2. Subject Endpoints

### 2.1 Create Subject
* **Endpoint**: `POST /api/subjects?instructorId={instructorId}`
* **Description**: Creates a new subject assigned to an instructor and student batch.
* **Headers**: `Content-Type: application/json`, `Authorization: Bearer <JWT_TOKEN>`

#### Request Body Example
```json
{
  "name": "CSE20140 - Project Based Learning III",
  "code": "CSE20140-PBL3",
  "batchId": 1,
  "description": "Hands-on fullstack web development lab focusing on software architecture and design patterns."
}
```

#### Response Body Example (200 OK)
```json
{
  "id": 1,
  "name": "CSE20140 - Project Based Learning III",
  "code": "CSE20140-PBL3",
  "instructorName": "Prof. Rajesh Sharma",
  "instructorId": 2,
  "batchName": "B.Tech CSE 2026 - Batch A",
  "batchId": 1,
  "description": "Hands-on fullstack web development lab focusing on software architecture and design patterns.",
  "totalMilestones": 4
}
```

---

### 2.2 Get Subjects for Student
* **Endpoint**: `GET /api/subjects/student/{studentId}`
* **Description**: Fetches subjects assigned to the student's enrolled batch.
* **Headers**: `Authorization: Bearer <JWT_TOKEN>`

#### Response Body Example (200 OK)
```json
[
  {
    "id": 1,
    "name": "CSE20140 - Project Based Learning III",
    "code": "CSE20140-PBL3",
    "instructorName": "Prof. Rajesh Sharma",
    "instructorId": 2,
    "batchName": "B.Tech CSE 2026 - Batch A",
    "batchId": 1,
    "description": "Hands-on fullstack web development lab focusing on software architecture and design patterns.",
    "totalMilestones": 4
  }
]
```

---

### 2.3 Get Subjects for Instructor
* **Endpoint**: `GET /api/subjects/instructor/{instructorId}`
* **Description**: Fetches subjects created or managed by an instructor.
* **Headers**: `Authorization: Bearer <JWT_TOKEN>`

#### Response Body Example (200 OK)
```json
[
  {
    "id": 1,
    "name": "CSE20140 - Project Based Learning III",
    "code": "CSE20140-PBL3",
    "instructorName": "Prof. Rajesh Sharma",
    "instructorId": 2,
    "batchName": "B.Tech CSE 2026 - Batch A",
    "batchId": 1,
    "description": "Hands-on fullstack web development lab focusing on software architecture and design patterns.",
    "totalMilestones": 4
  }
]
```

---

## 🚩 3. Milestone Endpoints

### 3.1 Create Milestone
* **Endpoint**: `POST /api/milestones`
* **Description**: Creates a new milestone checkpoint for a subject.
* **Headers**: `Content-Type: application/json`, `Authorization: Bearer <JWT_TOKEN>`

#### Request Body Example
```json
{
  "subjectId": 1,
  "title": "Milestone 1: Project Topic Selection & Problem Statement",
  "description": "Submit project proposal including domain, problem statement, team roles, and initial feature list.",
  "deadline": "2026-08-01T23:59:00",
  "basePoints": 100.0,
  "requiredDeliverables": "Proposal PDF, Problem Statement Doc"
}
```

#### Response Body Example (200 OK)
```json
{
  "id": 1,
  "subjectId": 1,
  "subjectName": "CSE20140 - Project Based Learning III",
  "title": "Milestone 1: Project Topic Selection & Problem Statement",
  "description": "Submit project proposal including domain, problem statement, team roles, and initial feature list.",
  "deadline": "2026-08-01T23:59:00",
  "basePoints": 100.0,
  "requiredDeliverables": "Proposal PDF, Problem Statement Doc",
  "isOverdue": false
}
```

---

### 3.2 Get Milestones by Subject
* **Endpoint**: `GET /api/milestones/subject/{subjectId}`
* **Description**: Fetches all milestones for a subject sorted by deadline ascending. Returns backend-computed `isOverdue` status.
* **Headers**: `Authorization: Bearer <JWT_TOKEN>`

#### Response Body Example (200 OK)
```json
[
  {
    "id": 1,
    "subjectId": 1,
    "subjectName": "CSE20140 - Project Based Learning III",
    "title": "Milestone 1: Project Topic Selection & Problem Statement",
    "description": "Submit project proposal including domain, problem statement, team roles, and initial feature list.",
    "deadline": "2026-08-01T23:59:00",
    "basePoints": 100.0,
    "requiredDeliverables": "Proposal PDF, Problem Statement Doc",
    "isOverdue": false
  },
  {
    "id": 2,
    "subjectId": 1,
    "subjectName": "CSE20140 - Project Based Learning III",
    "title": "Milestone 2: Software Requirements Specification (SRS)",
    "description": "Complete IEEE 830 formatted SRS document detailing functional and non-functional requirements.",
    "deadline": "2026-08-07T23:59:00",
    "basePoints": 150.0,
    "requiredDeliverables": "SRS Document (.docx or .pdf)",
    "isOverdue": false
  }
]
```

---

## 📤 4. Submission & Grading Endpoints

### 4.1 Upload Student Deliverable
* **Endpoint**: `POST /api/submissions/upload`
* **Description**: Uploads student deliverable file (saved to local `/uploads` directory) and/or repository URL link. Automatically calculates timeliness multiplier.
* **Headers**: `Content-Type: multipart/form-data`, `Authorization: Bearer <JWT_TOKEN>`

#### Request Form-Data Parameters
| Key | Type | Description |
|---|---|---|
| `milestoneId` | `Long` (e.g. `1`) | Target Milestone ID |
| `studentId` | `Long` (e.g. `4`) | Submitting Student User ID |
| `file` | `File` (Optional) | Binary File Upload |
| `submissionLink` | `String` (Optional) | External repository/demo URL |
| `comments` | `String` (Optional) | Notes/Comments |

#### Response Body Example (200 OK)
```json
{
  "id": 101,
  "milestoneId": 1,
  "milestoneTitle": "Milestone 1: Project Topic Selection & Problem Statement",
  "studentId": 4,
  "studentName": "Anurag Harapanahalli",
  "studentEmail": "anurag@edutrack.edu",
  "fileUrl": "/uploads/a8f92b41-3e21-4b12-98ab-9c1234567890.pdf",
  "submissionLink": "https://github.com/AnuragHarapanahalli/sem-project",
  "comments": "Submitted initial project proposal and SRS setup.",
  "submittedAt": "2026-07-22T19:15:00",
  "status": "SUBMITTED",
  "qualityRating": null,
  "timelinessMultiplier": 1.2,
  "finalPoints": 0.0,
  "instructorFeedback": null,
  "reviewedAt": null
}
```

---

### 4.2 Review & Evaluate Submission (Instructor)
* **Endpoint**: `PUT /api/submissions/{id}/review`
* **Description**: Evaluates student submission (`APPROVED` or `NEEDS_REVISION`), assigns quality score (1–5 stars), and computes final points.
* **SRS Formula**: $\text{Final Points} = \text{Base Points} \times \text{Timeliness Multiplier} \times \frac{\text{Quality Rating}}{5}$
* **Headers**: `Content-Type: application/json`, `Authorization: Bearer <JWT_TOKEN>`

#### Request Body Example
```json
{
  "status": "APPROVED",
  "qualityRating": 5,
  "feedback": "Excellent work! Clear problem statement and well-defined scope."
}
```

#### Response Body Example (200 OK)
```json
{
  "id": 101,
  "milestoneId": 1,
  "milestoneTitle": "Milestone 1: Project Topic Selection & Problem Statement",
  "studentId": 4,
  "studentName": "Anurag Harapanahalli",
  "studentEmail": "anurag@edutrack.edu",
  "fileUrl": "/uploads/a8f92b41-3e21-4b12-98ab-9c1234567890.pdf",
  "submissionLink": "https://github.com/AnuragHarapanahalli/sem-project",
  "comments": "Submitted initial project proposal and SRS setup.",
  "submittedAt": "2026-07-22T19:15:00",
  "status": "APPROVED",
  "qualityRating": 5,
  "timelinessMultiplier": 1.2,
  "finalPoints": 120.0,
  "instructorFeedback": "Excellent work! Clear problem statement and well-defined scope.",
  "reviewedAt": "2026-07-22T19:20:00"
}
```

---

### 4.3 Get Submissions by Milestone
* **Endpoint**: `GET /api/submissions/milestone/{milestoneId}`
* **Description**: Fetches all student submissions uploaded against a milestone for instructor grading.
* **Headers**: `Authorization: Bearer <JWT_TOKEN>`

#### Response Body Example (200 OK)
```json
[
  {
    "id": 101,
    "milestoneId": 1,
    "milestoneTitle": "Milestone 1: Project Topic Selection & Problem Statement",
    "studentId": 4,
    "studentName": "Anurag Harapanahalli",
    "studentEmail": "anurag@edutrack.edu",
    "fileUrl": "/uploads/a8f92b41-3e21-4b12-98ab-9c1234567890.pdf",
    "submissionLink": "https://github.com/AnuragHarapanahalli/sem-project",
    "comments": "Submitted initial project proposal and SRS setup.",
    "submittedAt": "2026-07-22T19:15:00",
    "status": "APPROVED",
    "qualityRating": 5,
    "timelinessMultiplier": 1.2,
    "finalPoints": 120.0,
    "instructorFeedback": "Excellent work!",
    "reviewedAt": "2026-07-22T19:20:00"
  }
]
```

---

## 🏆 5. Gamified Leaderboard Endpoint

### 5.1 Get Subject Leaderboard
* **Endpoint**: `GET /api/leaderboard/subject/{subjectId}`
* **Description**: Returns live subject-wise leaderboard ranked by total accumulated points and completion percentage.
* **Headers**: `Authorization: Bearer <JWT_TOKEN>`

#### Response Body Example (200 OK)
```json
[
  {
    "rank": 1,
    "studentId": 4,
    "studentName": "Anurag Harapanahalli",
    "studentEmail": "anurag@edutrack.edu",
    "totalPoints": 120.0,
    "approvedMilestonesCount": 1,
    "totalSubjectMilestonesCount": 4,
    "completionPercentage": 25.0
  },
  {
    "rank": 2,
    "studentId": 5,
    "studentName": "Priya Patel",
    "studentEmail": "priya@edutrack.edu",
    "totalPoints": 100.0,
    "approvedMilestonesCount": 1,
    "totalSubjectMilestonesCount": 4,
    "completionPercentage": 25.0
  },
  {
    "rank": 3,
    "studentId": 6,
    "studentName": "Rohit Verma",
    "studentEmail": "rohit@edutrack.edu",
    "totalPoints": 85.0,
    "approvedMilestonesCount": 1,
    "totalSubjectMilestonesCount": 4,
    "completionPercentage": 25.0
  }
]
```

---

## 📁 6. Local File Access Endpoint

### 6.1 Download Uploaded Deliverable File
* **Endpoint**: `GET /uploads/{fileName}`
* **Description**: Serves static deliverable files stored in the local machine's `/uploads` folder.
* **Headers**: None

#### Response
* **Status**: `200 OK`
* **Content-Type**: `application/octet-stream` (or `application/pdf`, `image/png`)
* **Header**: `Content-Disposition: inline; filename="a8f92b41-3e21-4b12-98ab-9c1234567890.pdf"`

---

## 🛡️ 7. Administrator Governance & Management Endpoints (`/api/admin`)

### 7.1 List & Filter Users
* **Endpoint**: `GET /api/admin/users?search={query}&role={role}&active={boolean}`
* **Description**: Retrieves a searchable, filterable list of all user accounts across all roles.

### 7.2 Create User Account
* **Endpoint**: `POST /api/admin/users`
* **Description**: Creates an Instructor, Student, or Admin user with validation and default temporary credentials.

### 7.3 Update User Account
* **Endpoint**: `PUT /api/admin/users/{id}`
* **Description**: Modifies user details, role, batch assignment, and credentials.

### 7.4 Deactivate / Reactivate User (Soft Delete)
* **Endpoint**: `PATCH /api/admin/users/{id}/status`
* **Description**: Toggles an account's active status without permanent database deletion.

### 7.5 List Academic Batches
* **Endpoint**: `GET /api/admin/batches`
* **Description**: Fetches all batches with enrolled student and subject counts.

### 7.6 Create Academic Batch
* **Endpoint**: `POST /api/admin/batches`
* **Description**: Creates a new cohort/section with academic year metadata.

### 7.7 Assign Student to Batch
* **Endpoint**: `POST /api/admin/batches/assign`
* **Description**: Updates the batch assignment for a student.

### 7.8 Bulk Assign Students to Batch
* **Endpoint**: `POST /api/admin/batches/bulk-assign`
* **Description**: Assigns multiple students to a batch in a single operation.

### 7.9 Enroll / Unenroll Student in Subject
* **Endpoint**: `POST /api/admin/subjects/{subjectId}/students/{studentId}`
* **Endpoint**: `DELETE /api/admin/subjects/{subjectId}/students/{studentId}`
* **Endpoint**: `POST /api/admin/subjects/{subjectId}/students/bulk`
* **Description**: Maps and manages student enrollments in specific lab courses.

### 7.10 System Telemetry & Statistics
* **Endpoint**: `GET /api/admin/stats`
* **Description**: Aggregates system metrics (users by role, active/inactive counts, subjects, milestones, submission status breakdown).

