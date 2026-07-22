package com.edutrack.model;

import jakarta.persistence.*;

@Entity
@Table(name = "batches")
public class

Batch {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name; // e.g. "B.Tech CSE 2026 Batch A"

    private String academicYear;

    public Batch() {}

    public Batch(String name, String academicYear) {
        this.name = name;
        this.academicYear = academicYear;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getAcademicYear() { return academicYear; }
    public void setAcademicYear(String academicYear) { this.academicYear = academicYear; }
}
