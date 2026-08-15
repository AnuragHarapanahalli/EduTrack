package com.edutrack.controller;

import com.edutrack.dto.AdminDto;
import com.edutrack.model.Role;
import com.edutrack.service.AdminService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
    // BATCH & SUBJECT MAPPINGS
    // ==========================================

    @GetMapping("/batches")
    public ResponseEntity<List<AdminDto.BatchResponse>> getAllBatches() {
        return ResponseEntity.ok(adminService.getAllBatches());
    }

    @PostMapping("/batches")
    public ResponseEntity<AdminDto.BatchResponse> createBatch(@RequestBody AdminDto.CreateBatchRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(adminService.createBatch(request));
    }

    @PostMapping("/batches/assign")
    public ResponseEntity<AdminDto.AdminUserResponse> assignStudentToBatch(@RequestBody AdminDto.AssignBatchRequest request) {
        return ResponseEntity.ok(adminService.assignStudentToBatch(request.getStudentId(), request.getBatchId()));
    }

    @PostMapping("/batches/bulk-assign")
    public ResponseEntity<Void> bulkAssignStudentsToBatch(@RequestBody AdminDto.BulkAssignBatchRequest request) {
        adminService.bulkAssignStudentsToBatch(request);
        return ResponseEntity.ok().build();
    }

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

    @PutMapping("/subjects/{subjectId}/batch/{batchId}")
    public ResponseEntity<com.edutrack.dto.SubjectDto.SubjectResponse> assignSubjectToBatch(
            @PathVariable Long subjectId,
            @PathVariable Long batchId,
            @RequestParam(defaultValue = "true") boolean autoEnroll
    ) {
        return ResponseEntity.ok(adminService.assignSubjectToBatch(subjectId, batchId, autoEnroll));
    }

    @PostMapping("/subjects/{subjectId}/auto-enroll-batch")
    public ResponseEntity<com.edutrack.dto.SubjectDto.SubjectResponse> autoEnrollBatchStudents(
            @PathVariable Long subjectId
    ) {
        return ResponseEntity.ok(adminService.autoEnrollBatchStudentsInSubject(subjectId));
    }

    // ==========================================
    // SYSTEM STATS & REPORTS
    // ==========================================

    @GetMapping("/stats")
    public ResponseEntity<AdminDto.SystemStatsResponse> getSystemStats() {
        return ResponseEntity.ok(adminService.getSystemStats());
    }
}
