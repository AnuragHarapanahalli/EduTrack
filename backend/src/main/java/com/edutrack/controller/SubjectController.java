package com.edutrack.controller;

import com.edutrack.dto.SubjectDto;
import com.edutrack.service.SubjectService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/subjects")
@CrossOrigin(origins = "*")
public class SubjectController {

    private final SubjectService subjectService;

    public SubjectController(SubjectService subjectService) {
        this.subjectService = subjectService;
    }

    @PostMapping
    public ResponseEntity<SubjectDto.SubjectResponse> createSubject(
            @RequestBody SubjectDto.CreateSubjectRequest request,
            @RequestParam Long instructorId
    ) {
        return ResponseEntity.ok(subjectService.createSubject(request, instructorId));
    }

    @GetMapping
    public ResponseEntity<List<SubjectDto.SubjectResponse>> getAllSubjects() {
        return ResponseEntity.ok(subjectService.getAllSubjects());
    }

    @GetMapping("/instructor/{instructorId}")
    public ResponseEntity<List<SubjectDto.SubjectResponse>> getSubjectsByInstructor(@PathVariable Long instructorId) {
        return ResponseEntity.ok(subjectService.getSubjectsByInstructor(instructorId));
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<SubjectDto.SubjectResponse>> getSubjectsForStudent(@PathVariable Long studentId) {
        return ResponseEntity.ok(subjectService.getSubjectsForStudentBatch(studentId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<SubjectDto.SubjectResponse> getSubjectById(@PathVariable Long id) {
        return ResponseEntity.ok(subjectService.getSubjectById(id));
    }

    @PostMapping("/{id}/students/manual")
    public ResponseEntity<com.edutrack.dto.AuthDto.UserDto> addStudentToSubject(
            @PathVariable Long id,
            @RequestParam String fullName,
            @RequestParam String email
    ) {
        return ResponseEntity.ok(subjectService.addStudentToSubject(id, fullName, email));
    }

    @GetMapping("/{id}/students")
    public ResponseEntity<List<com.edutrack.dto.AuthDto.UserDto>> getStudentsBySubject(@PathVariable Long id) {
        return ResponseEntity.ok(subjectService.getStudentsBySubject(id));
    }

    @GetMapping("/{id}/marks/export")
    public ResponseEntity<byte[]> exportSubjectMarksCsv(@PathVariable Long id) {
        byte[] csvBytes = subjectService.exportSubjectMarksCsv(id);
        return org.springframework.http.ResponseEntity.ok()
                .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"subject-" + id + "-marks.csv\"")
                .contentType(org.springframework.http.MediaType.parseMediaType("text/csv"))
                .body(csvBytes);
    }
}
