# 🎙️ EduTrack: Final Project Presentation Script
### *Project-Based Learning III (SEM-PBL3) — Presentation & Live Demonstration Script*

**Project Title:** EduTrack – Enterprise Gamified Milestone & Assessment Platform  
**Target Duration:** 10 – 12 Minutes (+ Q&A)  
**Presenters & Roles:**
1. **Anurag Harapanahalli** — Fullstack Lead & System Architect *(Host, Intro, Architecture & Live Demo Lead)*
2. **Harshad Pardhi** — Frontend UI/UX Engineer *(User Interface, Student & Instructor Experience, Document Preview)*
3. **Aaryan Kumbhare** — Backend & Database Systems Engineer *(Data Modeling, Security/JWT, Gamification Scoring Engine)*
4. **Nayna Sharma** — QA & Systems Governance Engineer *(Admin Governance, CSV Conflict Resolution, Selenium Automation & SDLC Metrics)*

---

## ⏱️ Presentation Timeline & Structure

```
00:00 - 02:30 | Part 1: Introduction, Problem Statement & System Architecture  (Anurag)
02:30 - 05:00 | Part 2: Frontend Engineering, Student Journey & In-Browser Preview (Harshad)
05:00 - 07:30 | Part 3: Backend Architecture, Timeliness Multiplier & Leaderboard (Aaryan)
07:30 - 10:00 | Part 4: Admin Governance, Bulk CSV, Selenium Automation & Metrics (Nayna)
10:00 - 12:00 | Part 5: Live Demonstration & Seamless Handover to Q&A (All)
```

---

## 🎬 Act 1: Introduction, Problem Statement & Architecture
**Speaker:** **Anurag Harapanahalli** *(Fullstack Lead & System Architect)*  
**Time:** 00:00 – 02:30 (2.5 mins)

---

### 🗣️ Script:

**[Slide 1: Title Slide & Team Introduction]**

> *"Good morning, respected professors, panel members, and fellow classmates.*  
> *I am **Anurag Harapanahalli**, and together with my teammates **Aaryan Kumbhare**, **Harshad Pardhi**, and **Nayna Sharma**, we are proud to present our Project-Based Learning III capstone: **EduTrack — an Enterprise Gamified Milestone & Assessment Platform**."*

**[Slide 2: The Core Problem in Academic Labs]**

> *"In higher engineering education, Project-Based Learning is where theory meets reality. However, modern lab management is plagued by three persistent pain points:*
> 1. ***Fragmented Submissions:*** *Students submit across scattered emails, Google Drives, and chat links, resulting in missing artifacts and zero auditability.*
> 2. ***Delayed & Opaque Feedback:*** *Instructors drown in manual file downloads, grading bottlenecks, and arbitrary evaluation criteria.*
> 3. ***Chronic Procrastination:*** *Without milestone visibility or engaging feedback loops, students submit at the 11th hour, sacrificing quality.*
>
> *We built **EduTrack** to solve this end-to-end."*

**[Slide 3: High-Level Architecture & Tech Stack]**

> *"As the System Architect, I established a decoupled, enterprise-grade architecture:*
> - *On the client, we built an **Angular 18 Single Page Application** utilizing modern **Standalone Components**, **Signals**, and reactive RxJS streams.*
> - *On the server, we engineered a high-throughput **Spring Boot 3.2** backend secured with stateless **JWT tokens (HMAC-SHA256)** and Spring Security 6.*
> - *For data integrity, we deployed **Spring Data JPA** with automatic DDL generation, running on an in-memory H2 runtime with seamless PostgreSQL portability.*
> - *And to guarantee zero-regression delivery, we engineered an end-to-end **Selenium 4 WebDriver** automation suite.*
>
> *I will now hand over to **Harshad**, who designed our frontend experience and student workflows."*

---

## 🎨 Act 2: Frontend Engineering, Student Experience & Document Preview
**Speaker:** **Harshad Pardhi** *(Frontend UI/UX Engineer)*  
**Time:** 02:30 – 05:00 (2.5 mins)

---

### 🗣️ Script:

**[Slide 4: UI/UX Philosophy — Netflix Meets Google Classroom]**

> *"Thank you, Anurag. Respected panel, one of our primary design goals was to eliminate the boring, utilitarian feel of traditional LMS software.*
>
> *We implemented a custom design system inspired by a **Netflix-meets-Google Classroom** aesthetic. Instead of drab text lists, students are greeted by a dynamic, horizontal **Milestone Roadmap Carousel**.*
> *Each milestone card provides:*
> - *Real-time percentage progress indicators.*
> - *Prerequisite path arrows that visually direct the student along the semester's learning curve.*
> - *Visual urgency badges—flagging upcoming deadlines, overdue tasks, or completed milestones.*
> - *A seamless dark and light glassmorphic theme that persists in browser storage."*

**[Slide 5: Frictionless Turn-In & In-Browser Universal Document Preview]**

> *"For deliverable submissions, we replaced native, clunky file dialogs with an interactive drag-and-drop upload modal that accepts local project archives, report documents, Git repository URLs, and private notes to the instructor.*
>
> *One of our proudest frontend engineering achievements is the **Universal In-Browser Document Previewer**:*
> - *Historically, professors had to download hundreds of student files to their local disk to evaluate them.*
> - *In EduTrack, using **Mammoth.js** for Microsoft Word `.docx` documents and **PDF.js** for PDFs, instructors can click 'Preview' and review formatted deliverables directly inside an interactive modal window in real time.*
>
> *I will now pass the presentation to **Aaryan**, who will explain our relational data architecture and the mathematical engine powering our gamification."*

---

## ⚙️ Act 3: Relational Modeling, Timeliness Multiplier & Leaderboard Engine
**Speaker:** **Aaryan Kumbhare** *(Backend & Database Systems Engineer)*  
**Time:** 05:00 – 07:30 (2.5 mins)

---

### 🗣️ Script:

**[Slide 6: Relational Domain Modeling & Security]**

> *"Thank you, Harshad. As the backend and database engineer, my objective was to construct a robust, performant data model capable of scaling across multiple departments, lab courses, and student cohorts.*
>
> *Our domain layer encompasses five primary JPA entities:*
> 1. ***User:*** *Encapsulates role-based access for Students, Instructors, and Admins, bound to academic panels and batches.*
> 2. ***Subject:*** *Represents lab classrooms, course codes, and instructor ownership.*
> 3. ***Milestone:*** *Defines deliverable deadlines, weightages, and maximum score caps.*
> 4. ***Submission:*** *Tracks artifact URLs, submission timestamps, evaluated grades, and qualitative feedback.*
> 5. ***AuditLog:*** *An append-only security ledger capturing user actions, IP addresses, and timestamps for accountability.*
>
> *All REST endpoints are shielded by a custom **JwtAuthenticationFilter** that validates bearer tokens and guarantees strict class and roster isolation."*

**[Slide 7: Gamification Formula & Leaderboard Recalculation]**

> *"Now, let's talk about the heart of EduTrack's motivation loop: our **Gamified Scoring Algorithm**.*
>
> *Traditional grading only evaluates quality, ignoring procrastination. EduTrack introduces a mathematical **Timeliness Multiplier** calculated automatically on submission:*
>
> $$\text{Final Points} = \text{Base Points} \times \text{Timeliness Multiplier} \times \left(\frac{\text{Quality Rating}}{5}\right)$$
>
> *The rules are strict and transparent:*
> - *Submitting $\ge 24\text{ hours}$ before the deadline earns an **Early Bird Bonus of $1.2\times$**.*
> - *Submitting on-time earns the standard **$1.0\times$**.*
> - *Late submissions face a penalty multiplier of **$0.5\times$**.*
> - *Faculty assign a qualitative **1 to 5 Star Rating**, and once approved, the marks lock permanently to prevent tampering.*
>
> *Upon grading, our **LeaderboardService** dynamically recomputes cohort rankings, updating student ranks and badges in sub-second time.*
>
> *I now invite **Nayna** to cover Admin Governance, our Selenium 4 automated testing suite, and our software engineering metrics."*

---

## 🛡️ Act 4: Admin Governance, Selenium 4 E2E Testing & SDLC Metrics
**Speaker:** **Nayna Sharma** *(QA & Systems Governance Engineer)*  
**Time:** 07:30 – 10:00 (2.5 mins)

---

### 🗣️ Script:

**[Slide 8: Enterprise Admin Governance & Bulk CSV Onboarding]**

> *"Thank you, Aaryan. Respected panel, managing a college cohort manually is impractical. In EduTrack's Admin Governance Portal, we engineered a high-volume **Bulk CSV User Onboarding Subsystem**.*
>
> *Instead of crashing on flawed CSV files, our parser features:*
> - *Intelligent column alias detection for names, emails, roles, and batches.*
> - *Instant pre-validation that isolates duplicate emails or malformed records.*
> - *A dedicated **Issue Resolution Popup Modal** that lets administrators fix invalid entries, skip faulty rows, or override duplicates inline without having to re-upload.*
> - *We also implemented **Soft Deletes**, ensuring deactivated accounts cannot authenticate, while preserving historical grades and submission integrity."*

**[Slide 9: Quality Assurance & Selenium 4 Automated Testing (100% Pass Rate)]**

> *"To guarantee production stability, I architected our end-to-end automated test suite using **Selenium 4** and **JUnit 5**, strictly implementing the **Page Object Model (POM)** pattern.*
>
> *We implemented **14 Comprehensive Automated Test Cases** covering:*
> - ***AuthenticationSuite (7 tests):*** *Demo role buttons, credential authentication, error banners, theme toggling, and session logout.*
> - ***AdminPanelSuite (3 tests):*** *Tab navigation, dynamic user table email search, and automated student account creation.*
> - ***InstructorSuite (2 tests):*** *Classroom creation and Stream, Classwork, People, and Leaderboard tab navigation.*
> - ***StudentSuite (2 tests):*** *Milestone cards inspection and live leaderboard rank verification.*
>
> *All 14 tests execute cleanly in both headless CI mode and visual browser mode with a **100% pass rate**."*

**[Slide 10: Software Estimation: FPA, COCOMO II, and CPM/PERT]**

> *"Finally, we analyzed EduTrack through rigorous software engineering estimation models based on our actual codebase of **109 files and 21,995 physical lines of code** (~15.2 KSLOC):*
> 1. ***Function Point Analysis (IFPUG):*** *Identified 123 Unadjusted FPs and a Value Adjustment Factor of 1.13, yielding **139 Adjusted Function Points (AFP)**.*
> 2. ***COCOMO II Post-Architecture:*** *Estimated effort of **23.01 Person-Months**, accurately projecting a 4-month semester delivery for our **4 core engineers**.*
> 3. ***Critical Path Method (CPM):*** *Analyzed 12 project activities from Requirements to Deployment, identifying the critical path: $A \rightarrow B \rightarrow D \rightarrow G \rightarrow H \rightarrow I \rightarrow J \rightarrow K \rightarrow L$ spanning exactly **50 Working Days (10 Weeks)**.*
> 4. ***PERT Analysis:*** *Calculated a critical path variance of 1.565, establishing a **94.5% statistical confidence** of project completion within 52 working days.*
>
> *I will now hand back to **Anurag** to lead our live demonstration."*

---

## 💻 Act 5: Live Demonstration & Seamless Handover
**Lead:** **Anurag Harapanahalli** *(Supported by Harshad, Aaryan & Nayna)*  
**Time:** 10:00 – 12:00 (2 mins)

---

### 🗣️ Script:

**[Live System Action: Open Browser to `http://localhost:4200`]**

> *"Thank you, Nayna. Let us now see EduTrack live in action across the three user personas.*
>
> ***Step 1: Student Persona (Anurag navigates)***  
> *Notice our quick demo login buttons. I click **Student Demo** (`anurag@edutrack.edu`). We land on the horizontal Netflix-style roadmap. Here is Milestone 1 with its deadline countdown and progress bar. I open the Turn-In modal, drop a file, attach our GitHub repository, and click Submit. The status flips instantly to `SUBMITTED`.*
>
> ***Step 2: Instructor Evaluation & Live Document Preview (Harshad speaks)***  
> *(Harshad points to screen): 'Now Anurag switches to **Faculty Demo** (`sharma@edutrack.edu`). In the Classwork review modal, we see Anurag's uploaded file. Instead of downloading, we click Preview—and Mammoth.js instantly renders the document right here in the modal! Anurag rates the deliverable 5 Stars with positive feedback. Because it was submitted before the deadline, the 1.2x timeliness bonus applies, awarding maximum points.'*
>
> ***Step 3: Real-Time Leaderboard Update (Aaryan speaks)***  
> *(Aaryan points to screen): 'Now we switch to the **Leaderboard Tab**. You can see Anurag has instantly moved to Rank 1 with his newly calculated points and badge dynamically updated!'*
>
> ***Step 4: Admin Governance & Automated Testing (Nayna speaks)***  
> *(Nayna points to screen): 'Finally, logging in as **Admin**, we have our KPI widgets, user directory search, and the bulk CSV importer. And in the background, our Selenium 4 POM suite can be triggered at any time with Maven to verify this entire journey automatically in under 45 seconds.'*

**[Closing Slide: Summary & Q&A]**

**Anurag:**
> *"To conclude, EduTrack transforms chaotic lab submissions into a structured, transparent, and gamified academic ecosystem. It bridges student motivation with faculty efficiency and institutional governance.*
>
> *We thank our course coordinator, lab instructors, and panel members for your mentorship. We are now open for questions!"*

---

# 🎯 Anticipated Q&A Cheat Sheet (Who Answers What)

### Question 1: *"How does the Timeliness Multiplier prevent students from submitting junk files early just to lock in the 1.2x multiplier?"*
**Answered by: Aaryan Kumbhare**
> *"Points are strictly contingent upon faculty approval. If a student submits a placeholder or deficient artifact, the instructor selects 'Resubmission Requested'. The previous submission timestamp is invalidated, and the new timestamp recorded upon actual resubmission governs the multiplier."*

---

### Question 2: *"How do you handle Word (.docx) and PDF document previews without security risks or server-side conversion tools like LibreOffice?"*
**Answered by: Harshad Pardhi**
> *"We perform client-side rendering. For `.docx` files, we utilize **Mammoth.js**, which parses raw OOXML byte streams into sanitized HTML and injects it safely into a scoped shadow modal. For PDFs, we stream raw binary buffers through **PDF.js**. This eliminates server CPU spikes and avoids third-party document viewers."*

---

### Question 3: *"Why did you choose the Page Object Model (POM) for your Selenium automation instead of standard scripts?"*
**Answered by: Nayna Sharma**
> *"Direct scripting tightly couples element locators with test assertions, causing tests to break whenever UI classes change. With POM, pages like `LoginPage` or `AdminPanelPage` encapsulate all DOM selectors and interaction methods. When UI styling changes, we update one single line in the Page Object, and all test suites continue to pass without modification."*

---

### Question 4: *"How does your decoupled architecture handle authentication and role unauthorized access?"*
**Answered by: Anurag Harapanahalli**
> *"We utilize stateless JWT tokens signed via HMAC-SHA256 with an expiration lifecycle. Every incoming request passes through Spring Security's `JwtAuthenticationFilter`, which populates the Security Context. Endpoints are guarded with `@PreAuthorize("hasRole('ADMIN')")` or role matches. On the frontend, Angular route guards and HTTP interceptors automatically redirect expired sessions and unauthorized actions."*

---

### Question 5: *"How did you arrive at your 50-day project duration in the Critical Path Method?"*
**Answered by: Nayna Sharma / Anurag Harapanahalli**
> *"We mapped our Work Breakdown Structure into 12 interdependent activities. Running forward and backward passes revealed that the path from DB Schema (B) through Core Backend (D), Classroom Management (G), Milestones (H), Submissions (I), Leaderboard (J), and Selenium Automation (K) has zero total float. Activities like Admin Governance had 19 days of float and ran in parallel without delaying the final release."*
