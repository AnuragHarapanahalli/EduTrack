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
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(
            UserRepository userRepository,
            SubjectRepository subjectRepository,
            MilestoneRepository milestoneRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.subjectRepository = subjectRepository;
        this.milestoneRepository = milestoneRepository;
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

        // 2. Create Subjects for Prof. Sharma
        // Subject 1: PBL3
        Subject pblSubject = new Subject(
                "CSE20140 - Project Based Learning III",
                "CSE20140-PBL3",
                profSharma,
                "Hands-on fullstack application development lab focusing on software architecture, design patterns, and deployment."
        );
        pblSubject.getEnrolledStudents().addAll(Set.of(studentAnurag, studentPriya));
        pblSubject = subjectRepository.save(pblSubject);

        // Subject 2: DBMS
        Subject dbmsSubject = new Subject(
                "CSE20120 - Database Management Systems",
                "CSE20120-DBMS",
                profSharma,
                "Fundamentals of relational databases, SQL programming, normalization, transaction management, and indexing techniques."
        );
        dbmsSubject.getEnrolledStudents().addAll(Set.of(studentAnurag, studentPriya));
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
        milestoneRepository.save(new Milestone(
                pblSubject,
                "Milestone 1: Project Topic Selection & Problem Statement",
                "Submit project proposal including domain, problem statement, team roles, and initial feature list.",
                LocalDateTime.now().minusDays(2),
                100.0,
                "[{\"title\":\"Proposal PDF\",\"isMandatory\":true},{\"title\":\"Problem Statement Doc\",\"isMandatory\":true}]",
                true
        ));

        // Milestone 2: ON-TIME UPCOMING DEADLINE (7 Days in Future)
        milestoneRepository.save(new Milestone(
                pblSubject,
                "Milestone 2: Software Requirements Specification (SRS)",
                "Complete IEEE 830 formatted SRS document detailing functional and non-functional requirements.",
                LocalDateTime.now().plusDays(7),
                150.0,
                "[{\"title\":\"SRS Document (.docx or .pdf)\",\"isMandatory\":true}]",
                true
        ));

        milestoneRepository.save(new Milestone(
                pblSubject,
                "Milestone 3: Database Schema & REST API Architecture",
                "Provide ER diagram, relational schema, and Swagger/REST endpoint specifications.",
                LocalDateTime.now().plusDays(14),
                200.0,
                "[{\"title\":\"ER Diagram PNG\",\"isMandatory\":true},{\"title\":\"OpenAPI Spec YAML\",\"isMandatory\":true},{\"title\":\"GitHub Link\",\"isMandatory\":false}]",
                true
        ));


        // 5. Create Milestones for DBMS
        milestoneRepository.save(new Milestone(
                dbmsSubject,
                "Milestone 1: ER Modelling & Relational Diagram",
                "Design the Entity-Relationship model for the assigned project domain and construct relational schemas.",
                LocalDateTime.now().plusDays(5),
                100.0,
                "[{\"title\":\"ER Diagram PDF\",\"isMandatory\":true}]",
                true
        ));

        milestoneRepository.save(new Milestone(
                dbmsSubject,
                "Milestone 2: Schema Normalization & SQL DDL Scripts",
                "Normalize schemas up to 3NF/BCNF and write SQL DDL scripts to build the relational structure.",
                LocalDateTime.now().plusDays(12),
                150.0,
                "[{\"title\":\"SQL DDL Script (.sql)\",\"isMandatory\":true},{\"title\":\"Normalization Report\",\"isMandatory\":false}]",
                true
        ));


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

        System.out.println("✅ EduTrack Demo Seed Data Initialized Successfully!");
    }
}
