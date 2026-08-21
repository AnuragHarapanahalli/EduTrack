package com.edutrack.config;

import com.edutrack.model.*;
import com.edutrack.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Set;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final SubjectRepository subjectRepository;
    private final MilestoneRepository milestoneRepository;
    private final SubmissionRepository submissionRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(
            UserRepository userRepository,
            SubjectRepository subjectRepository,
            MilestoneRepository milestoneRepository,
            SubmissionRepository submissionRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.subjectRepository = subjectRepository;
        this.milestoneRepository = milestoneRepository;
        this.submissionRepository = submissionRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() > 0) return;

        System.out.println("🌱 Initializing EduTrack Demo Seed Data...");

        // 1. Create Users (Admin, Instructors, Students)
        User admin = userRepository.save(new User("admin@edutrack.edu", passwordEncoder.encode("admin123"), "System Administrator", Role.ADMIN));
        User profSharma = userRepository.save(new User("sharma@edutrack.edu", passwordEncoder.encode("prof123"), "Prof. Rajesh Sharma", Role.INSTRUCTOR));
        User profVerma = userRepository.save(new User("prof.verma@edutrack.edu", passwordEncoder.encode("prof123"), "Dr. Vikram Verma", Role.INSTRUCTOR));

        User studentAnurag = userRepository.save(new User("anurag@edutrack.edu", passwordEncoder.encode("student123"), "Anurag Harapanahalli", Role.STUDENT));
        User studentPriya = userRepository.save(new User("priya@edutrack.edu", passwordEncoder.encode("student123"), "Priya Patel", Role.STUDENT));
        User studentRahul = userRepository.save(new User("rahul@edutrack.edu", passwordEncoder.encode("student123"), "Rahul Sharma", Role.STUDENT));
        User studentSneha = userRepository.save(new User("sneha@edutrack.edu", passwordEncoder.encode("student123"), "Sneha Reddy", Role.STUDENT));
        User studentAmit = userRepository.save(new User("amit@edutrack.edu", passwordEncoder.encode("student123"), "Amit Patel", Role.STUDENT));
        User studentAditi = userRepository.save(new User("aditi@edutrack.edu", passwordEncoder.encode("student123"), "Aditi Sharma", Role.STUDENT));

        // 2. Create Subjects for Prof. Sharma
        // Subject 1: PBL3
        Subject pblSubject = new Subject(
                "CSE20140 - Project Based Learning III",
                "CSE20140-PBL3",
                profSharma,
                "Hands-on fullstack application development lab focusing on software architecture, design patterns, and deployment."
        );
        pblSubject.getEnrolledStudents().addAll(Set.of(studentAnurag, studentPriya, studentSneha, studentAmit, studentAditi));
        pblSubject = subjectRepository.save(pblSubject);

        // Subject 2: DBMS
        Subject dbmsSubject = new Subject(
                "CSE20120 - Database Management Systems",
                "CSE20120-DBMS",
                profSharma,
                "Fundamentals of relational databases, SQL programming, normalization, transaction management, and indexing techniques."
        );
        dbmsSubject.getEnrolledStudents().addAll(Set.of(studentAnurag, studentPriya, studentSneha, studentAmit, studentAditi));
        dbmsSubject = subjectRepository.save(dbmsSubject);


        // 3. Create Subjects for Dr. Verma
        // Subject 1: Fullstack Web Dev
        Subject webDevSubject = new Subject(
                "CSE30110 - Fullstack Web Development",
                "CSE30110-WEB",
                profVerma,
                "Advanced web engineering covering RESTful services, frontend frameworks, and cloud deployment."
        );
        webDevSubject.getEnrolledStudents().addAll(Set.of(studentAnurag, studentRahul));
        webDevSubject = subjectRepository.save(webDevSubject);

        // Subject 2: Cloud Computing
        Subject cloudSubject = new Subject(
                "CSE30130 - Cloud Computing & Microservices",
                "CSE30130-CLOUD",
                profVerma,
                "Architecting cloud-native applications, containerization using Docker, orchestration via Kubernetes, and serverless compute paradigms."
        );
        cloudSubject.getEnrolledStudents().addAll(Set.of(studentAnurag, studentRahul));
        cloudSubject = subjectRepository.save(cloudSubject);


        // 4. Create Milestones for PBL3
        // Milestone 1: OVERDUE / LATE DEADLINE (2 Days Ago)
        Milestone milestone1 = milestoneRepository.save(new Milestone(
                pblSubject,
                "Milestone 1: Project Topic Selection & Problem Statement",
                "Submit project proposal including domain, problem statement, team roles, and initial feature list.",
                LocalDateTime.now().minusDays(2),
                100.0,
                "[{\"title\":\"Proposal PDF\",\"isMandatory\":true},{\"title\":\"Problem Statement Doc\",\"isMandatory\":true}]",
                true
        ));
        milestone1.setMaxMarks(50.0);
        milestone1 = milestoneRepository.save(milestone1);

        // Milestone 2: ON-TIME UPCOMING DEADLINE (7 Days in Future)
        Milestone milestone2 = milestoneRepository.save(new Milestone(
                pblSubject,
                "Milestone 2: Software Requirements Specification (SRS)",
                "Complete IEEE 830 formatted SRS document detailing functional and non-functional requirements.",
                LocalDateTime.now().plusDays(7),
                150.0,
                "[{\"title\":\"SRS Document (.docx or .pdf)\",\"isMandatory\":true}]",
                true
        ));
        milestone2.setMaxMarks(100.0);
        milestone2 = milestoneRepository.save(milestone2);

        Milestone milestone3 = milestoneRepository.save(new Milestone(
                pblSubject,
                "Milestone 3: Database Schema & REST API Architecture",
                "Provide ER diagram, relational schema, and Swagger/REST endpoint specifications.",
                LocalDateTime.now().plusDays(14),
                200.0,
                "[{\"title\":\"ER Diagram PNG\",\"isMandatory\":true},{\"title\":\"OpenAPI Spec YAML\",\"isMandatory\":true},{\"title\":\"GitHub Link\",\"isMandatory\":false}]",
                true
        ));
        milestone3.setMaxMarks(20.0);
        milestone3 = milestoneRepository.save(milestone3);


        // 5. Create Milestones for DBMS
        Milestone dbmsMilestone1 = milestoneRepository.save(new Milestone(
                dbmsSubject,
                "Milestone 1: ER Modelling & Relational Diagram",
                "Design the Entity-Relationship model for the assigned project domain and construct relational schemas.",
                LocalDateTime.now().minusDays(1),
                100.0,
                "[{\"title\":\"ER Diagram PDF\",\"isMandatory\":true}]",
                true
        ));
        dbmsMilestone1.setMaxMarks(50.0);
        dbmsMilestone1 = milestoneRepository.save(dbmsMilestone1);

        Milestone dbmsMilestone2 = milestoneRepository.save(new Milestone(
                dbmsSubject,
                "Milestone 2: Schema Normalization & SQL DDL Scripts",
                "Normalize schemas up to 3NF/BCNF and write SQL DDL scripts to build the relational structure.",
                LocalDateTime.now().plusDays(5),
                150.0,
                "[{\"title\":\"SQL DDL Script (.sql)\",\"isMandatory\":true},{\"title\":\"Normalization Report\",\"isMandatory\":false}]",
                true
        ));
        dbmsMilestone2.setMaxMarks(100.0);
        dbmsMilestone2 = milestoneRepository.save(dbmsMilestone2);


        // 6. Create Milestones for Fullstack Web Dev
        milestoneRepository.save(new Milestone(
                webDevSubject,
                "Milestone 1: HTML5/CSS3 Responsive Layout Design",
                "Create responsive landing page and dashboard components adhering to UI design guidelines.",
                LocalDateTime.now().plusDays(4),
                100.0,
                "[{\"title\":\"GitHub Repo URL\",\"isMandatory\":true},{\"title\":\"Live Demo Link\",\"isMandatory\":false}]",
                true
        ));


        // 7. Create Milestones for Cloud Computing & Microservices
        milestoneRepository.save(new Milestone(
                cloudSubject,
                "Milestone 1: Docker Containerization",
                "Write multi-stage Dockerfiles for application services and package them using Docker Compose.",
                LocalDateTime.now().plusDays(6),
                100.0,
                "[{\"title\":\"Dockerfile & Compose Spec\",\"isMandatory\":true}]",
                true
        ));

        milestoneRepository.save(new Milestone(
                 cloudSubject,
                 "Milestone 2: Kubernetes Orchestration & Deployments",
                 "Write K8s deployment manifests, service configurations, and setup ingress controllers for routing.",
                 LocalDateTime.now().plusDays(15),
                 200.0,
                 "[{\"title\":\"K8s YAML Manifests\",\"isMandatory\":true},{\"title\":\"Helm Chart Directory\",\"isMandatory\":false}]",
                 true
         ));

        // 8. Create Submissions & Grades
        // Student 1: Anurag - Milestone 1: Submitted early, approved, and locked.
        Submission subAnuragM1 = new Submission();
        subAnuragM1.setMilestone(milestone1);
        subAnuragM1.setStudent(studentAnurag);
        subAnuragM1.setFileUrl("/uploads/anurag-proposal.pdf");
        subAnuragM1.setSubmissionLink("https://github.com/AnuragHarapanahalli/proposal");
        subAnuragM1.setComments("Hi Professor, here is our project proposal. We are building EduTrack!");
        subAnuragM1.setSubmittedAt(LocalDateTime.now().minusDays(3)); // Submitted early (3 days ago is before 2 days ago deadline)
        subAnuragM1.setStatus(SubmissionStatus.APPROVED);
        subAnuragM1.setTimelinessMultiplier(1.2);
        subAnuragM1.setObtainedMarks(45.0); // 45 / 50 = 90% (Quality rating 5)
        subAnuragM1.setQualityRating(5);
        subAnuragM1.setMarksLocked(true); // Locked/published
        subAnuragM1.setInstructorFeedback("Excellent selection of project topic. Architecture is well planned.");
        subAnuragM1.setReviewedAt(LocalDateTime.now().minusDays(1));
        // finalPoints = basePoints (100.0) * timelinessMultiplier (1.2) * (obtainedMarks / maxMarks) (45.0 / 50.0) = 108.0
        subAnuragM1.setFinalPoints(108.0);
        submissionRepository.save(subAnuragM1);

        // Student 2: Priya - Milestone 1: Submitted late, approved, and locked.
        Submission subPriyaM1 = new Submission();
        subPriyaM1.setMilestone(milestone1);
        subPriyaM1.setStudent(studentPriya);
        subPriyaM1.setFileUrl("/uploads/priya-proposal.pdf");
        subPriyaM1.setComments("Apologies for the late submission, faced build issues.");
        subPriyaM1.setSubmittedAt(LocalDateTime.now().minusDays(1)); // Submitted late (1 day ago is after 2 days ago deadline)
        subPriyaM1.setStatus(SubmissionStatus.APPROVED);
        subPriyaM1.setTimelinessMultiplier(0.5);
        subPriyaM1.setObtainedMarks(40.0); // 40 / 50 = 80% (Quality rating 4)
        subPriyaM1.setQualityRating(4);
        subPriyaM1.setMarksLocked(true); // Locked/published
        subPriyaM1.setInstructorFeedback("Submission is solid but please plan ahead to avoid late penalties.");
        subPriyaM1.setReviewedAt(LocalDateTime.now().minusDays(1));
        // finalPoints = basePoints (100.0) * timelinessMultiplier (0.5) * (obtainedMarks / maxMarks) (40.0 / 50.0) = 40.0
        subPriyaM1.setFinalPoints(40.0);
        submissionRepository.save(subPriyaM1);

        // Student 1: Anurag - Milestone 2: Submitted, graded, but UNLOCKED (DRAFT review).
        Submission subAnuragM2 = new Submission();
        subAnuragM2.setMilestone(milestone2);
        subAnuragM2.setStudent(studentAnurag);
        subAnuragM2.setFileUrl("/uploads/anurag-srs.pdf");
        subAnuragM2.setComments("SRS draft according to IEEE guidelines.");
        subAnuragM2.setSubmittedAt(LocalDateTime.now().minusDays(2)); // Submitted on time
        subAnuragM2.setStatus(SubmissionStatus.APPROVED);
        subAnuragM2.setTimelinessMultiplier(1.0);
        subAnuragM2.setObtainedMarks(95.0); // 95 / 100 = 95%
        subAnuragM2.setQualityRating(5);
        subAnuragM2.setMarksLocked(false); // Unlocked / draft!
        subAnuragM2.setInstructorFeedback("Draft looks very professional. Will lock grades after final review.");
        subAnuragM2.setReviewedAt(LocalDateTime.now());
        // finalPoints = basePoints (100.0) * timelinessMultiplier (1.0) * (obtainedMarks / maxMarks) (95.0 / 100.0) = 95.0
        subAnuragM2.setFinalPoints(95.0);
        submissionRepository.save(subAnuragM2);

        // Student 2: Priya - Milestone 2: Submitted, pending review (Under Review).
        Submission subPriyaM2 = new Submission();
        subPriyaM2.setMilestone(milestone2);
        subPriyaM2.setStudent(studentPriya);
        subPriyaM2.setSubmissionLink("https://github.com/priya/srs-doc");
        subPriyaM2.setComments("Draft link. Will compile PDF soon.");
        subPriyaM2.setSubmittedAt(LocalDateTime.now());
        subPriyaM2.setStatus(SubmissionStatus.SUBMITTED);
        subPriyaM2.setTimelinessMultiplier(1.0);
        subPriyaM2.setMarksLocked(false);
        submissionRepository.save(subPriyaM2);

        // Student 1: Anurag - Milestone 3: Submitted, rejected/needs revision.
        Submission subAnuragM3 = new Submission();
        subAnuragM3.setMilestone(milestone3);
        subAnuragM3.setStudent(studentAnurag);
        subAnuragM3.setFileUrl("/uploads/anurag-schema.png");
        subAnuragM3.setComments("Schema drawing v1");
        subAnuragM3.setSubmittedAt(LocalDateTime.now());
        subAnuragM3.setStatus(SubmissionStatus.NEEDS_REVISION);
        subAnuragM3.setTimelinessMultiplier(1.0);
        subAnuragM3.setMarksLocked(true); // Locked revision feedback
        subAnuragM3.setInstructorFeedback("Relational mapping has transitive dependencies. Please normalize to 3NF.");
        subAnuragM3.setReviewedAt(LocalDateTime.now());
        subAnuragM3.setFinalPoints(0.0);
        submissionRepository.save(subAnuragM3);

        // --- NEW REALISTIC STUDENT SUBMISSIONS (PBL3) ---
        // Sneha Reddy: M1 (Early, Approved, Locked), M2 (Early, Approved, Locked)
        Submission subSnehaM1 = new Submission();
        subSnehaM1.setMilestone(milestone1);
        subSnehaM1.setStudent(studentSneha);
        subSnehaM1.setFileUrl("/uploads/sneha-proposal.pdf");
        subSnehaM1.setComments("Proposal PDF for full review.");
        subSnehaM1.setSubmittedAt(LocalDateTime.now().minusDays(3));
        subSnehaM1.setStatus(SubmissionStatus.APPROVED);
        subSnehaM1.setTimelinessMultiplier(1.2);
        subSnehaM1.setObtainedMarks(48.0); // 48/50 = 96%
        subSnehaM1.setQualityRating(5);
        subSnehaM1.setMarksLocked(true);
        subSnehaM1.setInstructorFeedback("Fantastic analysis, Sneha! Clean structure.");
        subSnehaM1.setReviewedAt(LocalDateTime.now().minusDays(1));
        subSnehaM1.setFinalPoints(115.2); // 100 * 1.2 * 0.96
        submissionRepository.save(subSnehaM1);

        Submission subSnehaM2 = new Submission();
        subSnehaM2.setMilestone(milestone2);
        subSnehaM2.setStudent(studentSneha);
        subSnehaM2.setFileUrl("/uploads/sneha-srs.pdf");
        subSnehaM2.setComments("IEEE SRS template matching our application layout.");
        subSnehaM2.setSubmittedAt(LocalDateTime.now().minusDays(1));
        subSnehaM2.setStatus(SubmissionStatus.APPROVED);
        subSnehaM2.setTimelinessMultiplier(1.2);
        subSnehaM2.setObtainedMarks(92.0); // 92/100 = 92%
        subSnehaM2.setQualityRating(5);
        subSnehaM2.setMarksLocked(true);
        subSnehaM2.setInstructorFeedback("Excellent IEEE SRS draft. Keep it up!");
        subSnehaM2.setReviewedAt(LocalDateTime.now());
        subSnehaM2.setFinalPoints(110.4); // 100 * 1.2 * 0.92
        submissionRepository.save(subSnehaM2);

        // Amit Patel: M1 (On-time, Approved, Locked), M2 (On-time, Submitted, Draft)
        Submission subAmitM1 = new Submission();
        subAmitM1.setMilestone(milestone1);
        subAmitM1.setStudent(studentAmit);
        subAmitM1.setFileUrl("/uploads/amit-proposal.pdf");
        subAmitM1.setSubmittedAt(LocalDateTime.now().minusDays(2));
        subAmitM1.setStatus(SubmissionStatus.APPROVED);
        subAmitM1.setTimelinessMultiplier(1.0);
        subAmitM1.setObtainedMarks(38.0); // 38/50 = 76%
        subAmitM1.setQualityRating(4);
        subAmitM1.setMarksLocked(true);
        subAmitM1.setInstructorFeedback("Good work. Some parts are brief but correct.");
        subAmitM1.setReviewedAt(LocalDateTime.now().minusDays(1));
        subAmitM1.setFinalPoints(76.0); // 100 * 1.0 * 0.76
        submissionRepository.save(subAmitM1);

        Submission subAmitM2 = new Submission();
        subAmitM2.setMilestone(milestone2);
        subAmitM2.setStudent(studentAmit);
        subAmitM2.setSubmissionLink("https://github.com/amit/srs");
        subAmitM2.setSubmittedAt(LocalDateTime.now());
        subAmitM2.setStatus(SubmissionStatus.SUBMITTED);
        subAmitM2.setTimelinessMultiplier(1.0);
        subAmitM2.setMarksLocked(false);
        submissionRepository.save(subAmitM2);

        // Aditi Sharma: M1 (Late, Approved, Locked)
        Submission subAditiM1 = new Submission();
        subAditiM1.setMilestone(milestone1);
        subAditiM1.setStudent(studentAditi);
        subAditiM1.setFileUrl("/uploads/aditi-proposal.pdf");
        subAditiM1.setSubmittedAt(LocalDateTime.now().minusDays(1)); // Late
        subAditiM1.setStatus(SubmissionStatus.APPROVED);
        subAditiM1.setTimelinessMultiplier(0.5);
        subAditiM1.setObtainedMarks(42.0); // 42/50 = 84%
        subAditiM1.setQualityRating(4);
        subAditiM1.setMarksLocked(true);
        subAditiM1.setInstructorFeedback("Well formulated, but late submission penalty applied.");
        subAditiM1.setReviewedAt(LocalDateTime.now().minusDays(1));
        subAditiM1.setFinalPoints(42.0); // 100 * 0.5 * 0.84
        submissionRepository.save(subAditiM1);

        // --- NEW REALISTIC STUDENT SUBMISSIONS (DBMS) ---
        // Anurag: M1 (Early, Approved, Locked)
        Submission subDbmsAnuragM1 = new Submission();
        subDbmsAnuragM1.setMilestone(dbmsMilestone1);
        subDbmsAnuragM1.setStudent(studentAnurag);
        subDbmsAnuragM1.setFileUrl("/uploads/anurag-db-er.pdf");
        subDbmsAnuragM1.setSubmittedAt(LocalDateTime.now().minusDays(2));
        subDbmsAnuragM1.setStatus(SubmissionStatus.APPROVED);
        subDbmsAnuragM1.setTimelinessMultiplier(1.2);
        subDbmsAnuragM1.setObtainedMarks(48.0); // 48/50 = 96%
        subDbmsAnuragM1.setQualityRating(5);
        subDbmsAnuragM1.setMarksLocked(true);
        subDbmsAnuragM1.setInstructorFeedback("Perfect relational mapping, Anurag.");
        subDbmsAnuragM1.setReviewedAt(LocalDateTime.now().minusDays(1));
        subDbmsAnuragM1.setFinalPoints(115.2);
        submissionRepository.save(subDbmsAnuragM1);

        // Sneha: M1 (On-time, Approved, Locked)
        Submission subDbmsSnehaM1 = new Submission();
        subDbmsSnehaM1.setMilestone(dbmsMilestone1);
        subDbmsSnehaM1.setStudent(studentSneha);
        subDbmsSnehaM1.setFileUrl("/uploads/sneha-db-er.pdf");
        subDbmsSnehaM1.setSubmittedAt(LocalDateTime.now().minusDays(1));
        subDbmsSnehaM1.setStatus(SubmissionStatus.APPROVED);
        subDbmsSnehaM1.setTimelinessMultiplier(1.0);
        subDbmsSnehaM1.setObtainedMarks(45.0); // 45/50 = 90%
        subDbmsSnehaM1.setQualityRating(5);
        subDbmsSnehaM1.setMarksLocked(true);
        subDbmsSnehaM1.setInstructorFeedback("Excellent diagrams, Sneha.");
        subDbmsSnehaM1.setReviewedAt(LocalDateTime.now().minusDays(1));
        subDbmsSnehaM1.setFinalPoints(90.0);
        submissionRepository.save(subDbmsSnehaM1);

        // Priya: M1 (Late, Approved, Locked)
        Submission subDbmsPriyaM1 = new Submission();
        subDbmsPriyaM1.setMilestone(dbmsMilestone1);
        subDbmsPriyaM1.setStudent(studentPriya);
        subDbmsPriyaM1.setFileUrl("/uploads/priya-db-er.pdf");
        subDbmsPriyaM1.setSubmittedAt(LocalDateTime.now()); // Late
        subDbmsPriyaM1.setStatus(SubmissionStatus.APPROVED);
        subDbmsPriyaM1.setTimelinessMultiplier(0.5);
        subDbmsPriyaM1.setObtainedMarks(40.0); // 40/50 = 80%
        subDbmsPriyaM1.setQualityRating(4);
        subDbmsPriyaM1.setMarksLocked(true);
        subDbmsPriyaM1.setInstructorFeedback("Good attempt but late.");
        subDbmsPriyaM1.setReviewedAt(LocalDateTime.now());
        subDbmsPriyaM1.setFinalPoints(40.0);
        submissionRepository.save(subDbmsPriyaM1);

        // Amit: M1 (On-time, Approved, Unlocked Draft)
        Submission subDbmsAmitM1 = new Submission();
        subDbmsAmitM1.setMilestone(dbmsMilestone1);
        subDbmsAmitM1.setStudent(studentAmit);
        subDbmsAmitM1.setFileUrl("/uploads/amit-db-er.pdf");
        subDbmsAmitM1.setSubmittedAt(LocalDateTime.now().minusDays(1));
        subDbmsAmitM1.setStatus(SubmissionStatus.APPROVED);
        subDbmsAmitM1.setTimelinessMultiplier(1.0);
        subDbmsAmitM1.setObtainedMarks(35.0); // 35/50 = 70%
        subDbmsAmitM1.setQualityRating(3);
        subDbmsAmitM1.setMarksLocked(false);
        subDbmsAmitM1.setInstructorFeedback("Draft ER review. Let's fix cardinarities.");
        subDbmsAmitM1.setReviewedAt(LocalDateTime.now());
        subDbmsAmitM1.setFinalPoints(70.0);
        submissionRepository.save(subDbmsAmitM1);

        System.out.println("✅ EduTrack Demo Seed Data Initialized Successfully!");
    }
}
