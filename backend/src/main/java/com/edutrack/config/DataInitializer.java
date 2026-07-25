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
    private final BatchRepository batchRepository;
    private final SubjectRepository subjectRepository;
    private final MilestoneRepository milestoneRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(
            UserRepository userRepository,
            BatchRepository batchRepository,
            SubjectRepository subjectRepository,
            MilestoneRepository milestoneRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.batchRepository = batchRepository;
        this.subjectRepository = subjectRepository;
        this.milestoneRepository = milestoneRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() > 0) return;

        System.out.println("🌱 Initializing EduTrack Demo Seed Data...");

        // 1. Create Batches
        Batch batchA = batchRepository.save(new Batch("B.Tech CSE 2026 - Batch A", "2025-2026"));
        Batch batchB = batchRepository.save(new Batch("B.Tech CSE 2026 - Batch B", "2025-2026"));

        // 2. Create Users (Admin, Instructors, Students)
        User admin = userRepository.save(new User("admin@edutrack.edu", passwordEncoder.encode("admin123"), "System Administrator", Role.ADMIN, null));
        User profSharma = userRepository.save(new User("sharma@edutrack.edu", passwordEncoder.encode("prof123"), "Prof. Rajesh Sharma", Role.INSTRUCTOR, null));
        User profVerma = userRepository.save(new User("prof.verma@edutrack.edu", passwordEncoder.encode("prof123"), "Dr. Vikram Verma", Role.INSTRUCTOR, null));

        User studentAnurag = userRepository.save(new User("anurag@edutrack.edu", passwordEncoder.encode("student123"), "Anurag Harapanahalli", Role.STUDENT, batchA));
        User studentPriya = userRepository.save(new User("priya@edutrack.edu", passwordEncoder.encode("student123"), "Priya Patel", Role.STUDENT, batchA));
        User studentRahul = userRepository.save(new User("rahul@edutrack.edu", passwordEncoder.encode("student123"), "Rahul Sharma", Role.STUDENT, batchB));

        // 3. Create Subject 1: PBL3 (Prof. Sharma)
        Subject pblSubject = new Subject(
                "CSE20140 - Project Based Learning III",
                "CSE20140-PBL3",
                profSharma,
                batchA,
                "Hands-on fullstack application development lab focusing on software architecture, design patterns, and deployment."
        );
        pblSubject.getEnrolledStudents().addAll(Set.of(studentAnurag, studentPriya));
        pblSubject = subjectRepository.save(pblSubject);

        // 4. Create Subject 2: Fullstack Web Dev (Dr. Verma)
        Subject webDevSubject = new Subject(
                "CSE30110 - Fullstack Web Development",
                "CSE30110-WEB",
                profVerma,
                batchB,
                "Advanced web engineering covering RESTful services, frontend frameworks, and cloud deployment."
        );
        webDevSubject.getEnrolledStudents().addAll(Set.of(studentAnurag, studentRahul));
        webDevSubject = subjectRepository.save(webDevSubject);

        // 5. Create Milestones for PBL3
        milestoneRepository.save(new Milestone(
                pblSubject,
                "Milestone 1: Project Topic Selection & Problem Statement",
                "Submit project proposal including domain, problem statement, team roles, and initial feature list.",
                LocalDateTime.now().plusDays(2),
                100.0,
                "Proposal PDF, Problem Statement Doc",
                true
        ));

        milestoneRepository.save(new Milestone(
                pblSubject,
                "Milestone 2: Software Requirements Specification (SRS)",
                "Complete IEEE 830 formatted SRS document detailing functional and non-functional requirements.",
                LocalDateTime.now().plusDays(7),
                150.0,
                "SRS Document (.docx or .pdf)",
                true
        ));

        milestoneRepository.save(new Milestone(
                pblSubject,
                "Milestone 3: Database Schema & REST API Architecture",
                "Provide ER diagram, relational schema, and Swagger/REST endpoint specifications.",
                LocalDateTime.now().plusDays(14),
                200.0,
                "ER Diagram PNG, OpenAPI Spec YAML, GitHub Link",
                true
        ));

        // 6. Create Milestones for Fullstack Web Dev
        milestoneRepository.save(new Milestone(
                webDevSubject,
                "Milestone 1: HTML5/CSS3 Responsive Layout Design",
                "Create responsive landing page and dashboard components adhering to UI design guidelines.",
                LocalDateTime.now().plusDays(4),
                100.0,
                "GitHub Repo URL, Live Demo Link",
                true
        ));

        System.out.println("✅ EduTrack Demo Seed Data Initialized Successfully!");
    }
}
