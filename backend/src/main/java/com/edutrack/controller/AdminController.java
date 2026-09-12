package com.edutrack.controller;

import com.edutrack.dto.AdminDto;
import com.edutrack.dto.SubjectDto;
import com.edutrack.model.AuditLog;
import com.edutrack.model.Role;
import com.edutrack.service.AdminService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    // ==========================================
    // USER MANAGEMENT
    // ==========================================

    @GetMapping("/users")
    public ResponseEntity<List<AdminDto.AdminUserResponse>> getAllUsers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Role role,
            @RequestParam(required = false) Boolean active
    ) {
        return ResponseEntity.ok(adminService.getAllUsers(search, role, active));
    }

    @PostMapping("/users")
    public ResponseEntity<AdminDto.AdminUserResponse> createUser(@RequestBody AdminDto.CreateUserRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(adminService.createUser(request));
    }

    @PostMapping(value = "/users/bulk", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<List<AdminDto.AdminUserResponse>> bulkUploadUsers(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "role", defaultValue = "STUDENT") Role role
    ) {
        return ResponseEntity.ok(adminService.bulkUploadUsers(file, role));
    }

    @PostMapping(value = "/users/bulk/validate", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<AdminDto.BulkUploadValidationResponse> validateBulkUpload(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "role", defaultValue = "STUDENT") Role role
    ) {
        return ResponseEntity.ok(adminService.validateBulkUpload(file, role));
    }

    @PostMapping("/users/bulk/import-processed")
    public ResponseEntity<List<AdminDto.AdminUserResponse>> importProcessedUsers(
            @RequestBody AdminDto.BulkImportProcessedRequest request
    ) {
        return ResponseEntity.ok(adminService.importProcessedUsers(request.getUsers()));
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<AdminDto.AdminUserResponse> updateUser(
            @PathVariable Long id,
            @RequestBody AdminDto.UpdateUserRequest request
    ) {
        return ResponseEntity.ok(adminService.updateUser(id, request));
    }

    @PatchMapping("/users/{id}/status")
    public ResponseEntity<AdminDto.AdminUserResponse> toggleUserStatus(
            @PathVariable Long id,
            @RequestBody AdminDto.ToggleStatusRequest request
    ) {
        return ResponseEntity.ok(adminService.toggleUserStatus(id, request.isActive()));
    }

    // ==========================================
    // SUBJECT ENROLLMENT & CREATION
    // ==========================================

    @PostMapping("/subjects/{subjectId}/students/{studentId}")
    public ResponseEntity<Void> enrollStudentInSubject(
            @PathVariable Long subjectId,
            @PathVariable Long studentId
    ) {
        adminService.enrollStudentInSubject(subjectId, studentId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/subjects/{subjectId}/students/{studentId}")
    public ResponseEntity<Void> unenrollStudentFromSubject(
            @PathVariable Long subjectId,
            @PathVariable Long studentId
    ) {
        adminService.unenrollStudentFromSubject(subjectId, studentId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/subjects/{subjectId}/students/bulk")
    public ResponseEntity<Void> bulkEnrollStudentsInSubject(
            @PathVariable Long subjectId,
            @RequestBody AdminDto.BulkSubjectEnrollmentRequest request
    ) {
        adminService.bulkEnrollStudentsInSubject(subjectId, request.getStudentIds());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/subjects")
    public ResponseEntity<com.edutrack.dto.SubjectDto.SubjectResponse> createSubjectByAdmin(
            @RequestBody AdminDto.CreateSubjectAdminRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(adminService.createSubjectByAdmin(request));
    }

    @PutMapping("/subjects/{subjectId}/instructor/{instructorId}")
    public ResponseEntity<com.edutrack.dto.SubjectDto.SubjectResponse> changeSubjectInstructor(
            @PathVariable Long subjectId,
            @PathVariable Long instructorId
    ) {
        return ResponseEntity.ok(adminService.changeSubjectInstructor(subjectId, instructorId));
    }

    // ==========================================
    // SYSTEM STATS, AUDIT LOGS & REPORTS
    // ==========================================

    @GetMapping("/stats")
    public ResponseEntity<AdminDto.SystemStatsResponse> getSystemStats() {
        return ResponseEntity.ok(adminService.getSystemStats());
    }

    @GetMapping("/logs")
    public ResponseEntity<List<AuditLog>> getAuditLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size
    ) {
        return ResponseEntity.ok(adminService.getAuditLogs(page, size));
    }
}
