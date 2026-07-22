package com.edutrack.config;

import com.edutrack.model.*;
import com.edutrack.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

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
        User profGupta = userRepository.save(new User("gupta@edutrack.edu", passwordEncoder.encode("prof123"), "Dr. Anita Gupta", Role.INSTRUCTOR, null));

        User student1 = userRepository.save(new User("anurag@edutrack.edu", passwordEncoder.encode("student123"), "Anurag Harapanahalli", Role.STUDENT, batchA));
        User student2 = userRepository.save(new User("priya@edutrack.edu", passwordEncoder.encode("student123"), "Priya Patel", Role.STUDENT, batchA));
        User student3 = userRepository.save(new User("rohit@edutrack.edu", passwordEncoder.encode("student123"), "Rohit Verma", Role.STUDENT, batchA));
        User student4 = userRepository.save(new User("sneha@edutrack.edu", passwordEncoder.encode("student123"), "Sneha Kulkarni", Role.STUDENT, batchA));

        // 3. Create Subject
        Subject pblSubject = subjectRepository.save(new Subject(
                "CSE20140 - Project Based Learning III",
                "CSE20140-PBL3",
                profSharma,
                batchA,
                "Hands-on fullstack application development lab focusing on software architecture, design patterns, and deployment."
        ));

        // 4. Create Sample Milestones
        Milestone m1 = milestoneRepository.save(new Milestone(
                pblSubject,
                "Milestone 1: Project Topic Selection & Problem Statement",
                "Submit project proposal including domain, problem statement, team roles, and initial feature list.",
                LocalDateTime.now().plusDays(2),
                100.0,
                "Proposal PDF, Problem Statement Doc"
        ));

        Milestone m2 = milestoneRepository.save(new Milestone(
                pblSubject,
                "Milestone 2: Software Requirements Specification (SRS)",
                "Complete IEEE 830 formatted SRS document detailing functional and non-functional requirements.",
                LocalDateTime.now().plusDays(7),
                150.0,
                "SRS Document (.docx or .pdf)"
        ));

        Milestone m3 = milestoneRepository.save(new Milestone(
                pblSubject,
                "Milestone 3: Database Schema & REST API Architecture",
                "Provide ER diagram, relational schema, and Swagger/REST endpoint specifications.",
                LocalDateTime.now().plusDays(14),
                200.0,
                "ER Diagram PNG, OpenAPI Spec YAML, GitHub Link"
        ));

        Milestone m4 = milestoneRepository.save(new Milestone(
                pblSubject,
                "Milestone 4: Final Working Prototype & PBL Lab Viva",
                "Demonstrate complete working web application with frontend, backend, database integration, and test suite.",
                LocalDateTime.now().plusDays(21),
                300.0,
                "GitHub Repository URL, Live Demo Video, Project Report"
        ));

        System.out.println("✅ EduTrack Demo Seed Data Initialized Successfully!");
    }
}
