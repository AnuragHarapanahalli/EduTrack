import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { ViewStateService, AdminTab } from '../../services/view-state.service';
import { ThemeService } from '../../services/theme.service';
import {
  AdminUser,
  CreateAdminUserRequest,
  UpdateAdminUserRequest,
  SystemStats,
  AuditLog
} from '../../models/admin.model';
import { Subject } from '../../models/subject.model';
import { Role } from '../../models/auth.model';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-panel.component.html',
  styleUrl: './admin-panel.component.css'
})
export class AdminPanelComponent implements OnInit {

  // State
  isLoadingUsers = false;
  isLoadingStats = false;
  isLoadingSubjects = false;
  isLoadingLogs = false;

  // Data
  users: AdminUser[] = [];
  subjects: Subject[] = [];
  auditLogs: AuditLog[] = [];
  stats: SystemStats | null = null;

  // User Filter & Search
  searchQuery = '';
  roleFilter: string = 'ALL';
  statusFilter: string = 'ALL';

  // Create / Edit User Modal
  showUserModal = false;
  isEditingUser = false;
  selectedUserForEdit: AdminUser | null = null;

  userForm: {
    fullName: string;
    email: string;
    role: Role;
    password?: string;
    active?: boolean;
  } = {
    fullName: '',
    email: '',
    role: 'STUDENT',
    password: '',
    active: true
  };

  userFormError = '';
  isSavingUser = false;
  showFormPassword = false;

  // Subject Edit Instructor State
  updatingInstructorSubjectId: number | null = null;

  // Class Roster Management Modal
  showRosterModal = false;
  selectedSubjectForRoster: Subject | null = null;
  enrolledStudentsInSubject: AdminUser[] = [];
  availableStudentsForSubject: AdminUser[] = [];
  selectedStudentIdsForEnrollment: Set<number> = new Set<number>();
  isEnrolling = false;

  // Create Class Modal State
  showCreateClassModal = false;
  newClassForm = {
    name: '',
    code: '',
    instructorId: 0,
    description: ''
  };
  classFormError = '';
  isSavingClass = false;

  // Bulk Import Users (CSV) State
  showCsvModal = false;
  selectedCsvFile: File | null = null;
  isUploadingCsv = false;
  csvFormError = '';
  csvUploadRole: 'STUDENT' | 'INSTRUCTOR' = 'STUDENT';

  // Notification Toast
  toastMessage = '';
  toastType: 'success' | 'error' = 'success';
  toastTimeout: any = null;

  constructor(
    public viewStateService: ViewStateService,
    public authService: AuthService,
    public themeService: ThemeService,
    private apiService: ApiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadAllData();
  }

  loadAllData(): void {
    this.loadUsers();
    this.loadStats();
    this.loadSubjects();
    this.loadLogs();
  }

  setTab(tab: AdminTab): void {
    this.viewStateService.setAdminTab(tab);
    if (tab === 'STATS') {
      this.loadStats();
    } else if (tab === 'LOGS') {
      this.loadLogs();
    } else if (tab === 'CLASSES') {
      this.loadSubjects();
    }
  }

  showToast(message: string, type: 'success' | 'error' = 'success'): void {
    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
    }
    this.toastMessage = message;
    this.toastType = type;
    this.cdr.detectChanges();

    this.toastTimeout = setTimeout(() => {
      this.toastMessage = '';
      this.cdr.detectChanges();
    }, 4000);
  }

  // ==========================================
  // USERS
  // ==========================================

  loadUsers(): void {
    this.isLoadingUsers = true;
    const roleParam = this.roleFilter !== 'ALL' ? this.roleFilter : undefined;
    const activeParam = this.statusFilter === 'ACTIVE' ? true : (this.statusFilter === 'INACTIVE' ? false : undefined);

    this.apiService.getAdminUsers(this.searchQuery, roleParam, activeParam).subscribe({
      next: (data) => {
        this.users = data;
        this.isLoadingUsers = false;
        if (this.showRosterModal && this.selectedSubjectForRoster) {
          this.refreshSubjectEnrollmentLists();
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoadingUsers = false;
        this.showToast(err.error?.message || 'Failed to load users', 'error');
        this.cdr.detectChanges();
      }
    });
  }

  onSearchChange(): void {
    this.loadUsers();
  }

  onFilterChange(): void {
    this.loadUsers();
  }

  openCreateUserModal(): void {
    this.isEditingUser = false;
    this.selectedUserForEdit = null;
    this.userForm = {
      fullName: '',
      email: '',
      role: 'STUDENT',
      password: '',
      active: true
    };
    this.userFormError = '';
    this.showUserModal = true;
    this.cdr.detectChanges();
  }

  openEditUserModal(user: AdminUser): void {
    this.isEditingUser = true;
    this.selectedUserForEdit = user;
    this.userForm = {
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      password: '',
      active: user.active
    };
    this.userFormError = '';
    this.showUserModal = true;
    this.cdr.detectChanges();
  }

  closeUserModal(): void {
    this.showUserModal = false;
    this.selectedUserForEdit = null;
    this.cdr.detectChanges();
  }

  saveUser(): void {
    if (!this.userForm.fullName || this.userForm.fullName.trim().length < 2) {
      this.userFormError = 'Full name must be at least 2 characters long.';
      return;
    }
    if (!this.userForm.email || !this.userForm.email.trim().includes('@')) {
      this.userFormError = 'A valid email address is required.';
      return;
    }

    this.isSavingUser = true;
    this.userFormError = '';

    if (this.isEditingUser && this.selectedUserForEdit) {
      const payload: UpdateAdminUserRequest = {
        fullName: this.userForm.fullName.trim(),
        email: this.userForm.email.trim(),
        role: this.userForm.role,
        active: this.userForm.active
      };
      if (this.userForm.password && this.userForm.password.trim()) {
        payload.password = this.userForm.password.trim();
      }

      this.apiService.updateAdminUser(this.selectedUserForEdit.id, payload).subscribe({
        next: () => {
          this.isSavingUser = false;
          this.closeUserModal();
          this.showToast('User updated successfully!');
          this.loadUsers();
          this.loadStats();
          this.loadLogs();
        },
        error: (err) => {
          this.isSavingUser = false;
          this.userFormError = err.error?.message || 'Failed to update user.';
          this.cdr.detectChanges();
        }
      });
    } else {
      const payload: CreateAdminUserRequest = {
        fullName: this.userForm.fullName.trim(),
        email: this.userForm.email.trim(),
        role: this.userForm.role
      };
      if (this.userForm.password && this.userForm.password.trim()) {
        payload.password = this.userForm.password.trim();
      }

      this.apiService.createAdminUser(payload).subscribe({
        next: () => {
          this.isSavingUser = false;
          this.closeUserModal();
          this.showToast('User created successfully!');
          this.loadUsers();
          this.loadStats();
          this.loadLogs();
        },
        error: (err) => {
          this.isSavingUser = false;
          this.userFormError = err.error?.message || 'Failed to create user.';
          this.cdr.detectChanges();
        }
      });
    }
  }

  toggleUserStatus(user: AdminUser, event?: MouseEvent): void {
    if (event) {
      event.stopPropagation();
    }
    const newStatus = !user.active;
    this.apiService.toggleUserStatus(user.id, newStatus).subscribe({
      next: (updated) => {
        user.active = updated.active;
        this.showToast(`User ${user.fullName} is now ${user.active ? 'Active' : 'Deactivated'}.`);
        this.loadStats();
        this.loadLogs();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.showToast(err.error?.message || 'Failed to change status', 'error');
      }
    });
  }

  // ==========================================
  // BULK IMPORT USER (CSV)
  // ==========================================

  openCsvModal(role: 'STUDENT' | 'INSTRUCTOR'): void {
    this.csvUploadRole = role;
    this.selectedCsvFile = null;
    this.csvFormError = '';
    this.showCsvModal = true;
    this.cdr.detectChanges();
  }

  closeCsvModal(): void {
    this.showCsvModal = false;
    this.cdr.detectChanges();
  }

  onCsvFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedCsvFile = file;
    }
  }

  downloadTemplate(): void {
    const headers = 'fullName,email\n';
    const row = this.csvUploadRole === 'STUDENT' 
      ? '"Rahul Sharma","rahul@edutrack.edu"\n"Priya Patel","priya@edutrack.edu"\n'
      : '"Prof. Rajesh Sharma","sharma@edutrack.edu"\n"Dr. Amit Verma","verma@edutrack.edu"\n';
    
    const blob = new Blob([headers + row], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${this.csvUploadRole.toLowerCase()}_import_template.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  uploadCsv(): void {
    if (!this.selectedCsvFile) {
      this.csvFormError = 'Please select a CSV file to upload.';
      return;
    }

    this.isUploadingCsv = true;
    this.csvFormError = '';
    this.cdr.detectChanges();

    this.apiService.uploadUsersCsv(this.selectedCsvFile, this.csvUploadRole).subscribe({
      next: (imported) => {
        this.isUploadingCsv = false;
        this.closeCsvModal();
        const roleLabel = this.csvUploadRole === 'STUDENT' ? 'Student' : 'Instructor';
        this.showToast(`Imported ${imported.length} ${roleLabel} accounts successfully!`);
        this.loadUsers();
        this.loadStats();
        this.loadLogs();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isUploadingCsv = false;
        this.csvFormError = err.error?.message || 'Failed to parse or upload CSV file.';
        this.cdr.detectChanges();
      }
    });
  }

  // ==========================================
  // SUBJECTS & INSTRUCTORS
  // ==========================================

  loadSubjects(): void {
    this.isLoadingSubjects = true;
    this.apiService.getAllSubjects().subscribe({
      next: (data) => {
        this.subjects = data;
        this.isLoadingSubjects = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoadingSubjects = false;
        this.showToast(err.error?.message || 'Failed to load lab classes', 'error');
        this.cdr.detectChanges();
      }
    });
  }

  changeInstructor(subject: Subject, event: any): void {
    const instructorId = +event.target.value;
    if (!instructorId) return;

    this.updatingInstructorSubjectId = subject.id;
    this.apiService.changeSubjectInstructor(subject.id, instructorId).subscribe({
      next: (updatedSubject) => {
        this.updatingInstructorSubjectId = null;
        subject.instructorId = updatedSubject.instructorId;
        subject.instructorName = updatedSubject.instructorName;
        this.showToast(`Instructor for "${subject.name}" updated successfully!`);
        this.loadLogs(); // Refresh logs to capture this action
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.updatingInstructorSubjectId = null;
        this.showToast(err.error?.message || 'Failed to update class instructor', 'error');
        this.cdr.detectChanges();
      }
    });
  }

  // ==========================================
  // STUDENT ENROLLMENTS (ROSTER MODAL)
  // ==========================================

  openRosterModal(subject: Subject): void {
    this.selectedSubjectForRoster = subject;
    this.refreshSubjectEnrollmentLists();
    this.showRosterModal = true;
    this.cdr.detectChanges();
  }

  closeRosterModal(): void {
    this.showRosterModal = false;
    this.selectedSubjectForRoster = null;
    this.enrolledStudentsInSubject = [];
    this.availableStudentsForSubject = [];
    this.selectedStudentIdsForEnrollment.clear();
    this.cdr.detectChanges();
  }

  refreshSubjectEnrollmentLists(): void {
    if (!this.selectedSubjectForRoster) return;

    this.apiService.getEnrolledStudents(this.selectedSubjectForRoster.id).subscribe({
      next: (enrolled) => {
        const enrolledIds = new Set(enrolled.map(e => e.id));
        this.enrolledStudentsInSubject = this.studentUsers.filter(u => enrolledIds.has(u.id));
        this.availableStudentsForSubject = this.studentUsers.filter(u => !enrolledIds.has(u.id));
        this.selectedStudentIdsForEnrollment.clear();

        // Sync local subject student count
        if (this.selectedSubjectForRoster) {
          this.selectedSubjectForRoster.enrolledStudentsCount = this.enrolledStudentsInSubject.length;
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.showToast(err.error?.message || 'Failed to load subject enrollments', 'error');
      }
    });
  }

  enrollStudent(studentId: number): void {
    if (!this.selectedSubjectForRoster) return;
    this.isEnrolling = true;

    this.apiService.enrollStudentInSubject(this.selectedSubjectForRoster.id, studentId).subscribe({
      next: () => {
        this.isEnrolling = false;
        this.showToast('Student enrolled successfully!');
        this.refreshSubjectEnrollmentLists();
        this.loadLogs();
      },
      error: (err) => {
        this.isEnrolling = false;
        this.showToast(err.error?.message || 'Failed to enroll student', 'error');
      }
    });
  }

  unenrollStudent(studentId: number): void {
    if (!this.selectedSubjectForRoster) return;
    this.isEnrolling = true;

    this.apiService.unenrollStudentFromSubject(this.selectedSubjectForRoster.id, studentId).subscribe({
      next: () => {
        this.isEnrolling = false;
        this.showToast('Student removed from subject.');
        this.refreshSubjectEnrollmentLists();
        this.loadLogs();
      },
      error: (err) => {
        this.isEnrolling = false;
        this.showToast(err.error?.message || 'Failed to unenroll student', 'error');
      }
    });
  }

  toggleEnrollmentSelection(studentId: number): void {
    if (this.selectedStudentIdsForEnrollment.has(studentId)) {
      this.selectedStudentIdsForEnrollment.delete(studentId);
    } else {
      this.selectedStudentIdsForEnrollment.add(studentId);
    }
  }

  bulkEnrollSelectedStudents(): void {
    if (!this.selectedSubjectForRoster || this.selectedStudentIdsForEnrollment.size === 0) return;
    const ids = Array.from(this.selectedStudentIdsForEnrollment);
    this.isEnrolling = true;

    this.apiService.bulkEnrollStudentsInSubject(this.selectedSubjectForRoster.id, ids).subscribe({
      next: () => {
        this.isEnrolling = false;
        this.showToast(`Enrolled ${ids.length} students into class.`);
        this.refreshSubjectEnrollmentLists();
        this.loadLogs();
      },
      error: (err) => {
        this.isEnrolling = false;
        this.showToast(err.error?.message || 'Failed to bulk enroll students', 'error');
      }
    });
  }

  // ==========================================
  // CREATE CLASS / LAB SUBJECT
  // ==========================================

  openCreateClassModal(): void {
    this.newClassForm = {
      name: '',
      code: '',
      instructorId: this.instructorUsers.length > 0 ? this.instructorUsers[0].id : 0,
      description: ''
    };
    this.classFormError = '';
    this.showCreateClassModal = true;
    this.cdr.detectChanges();
  }

  closeCreateClassModal(): void {
    this.showCreateClassModal = false;
    this.cdr.detectChanges();
  }

  saveClass(): void {
    if (!this.newClassForm.name || this.newClassForm.name.trim().length < 3) {
      this.classFormError = 'Class name must be at least 3 characters.';
      return;
    }
    if (!this.newClassForm.code || this.newClassForm.code.trim().length < 3) {
      this.classFormError = 'Course code must be at least 3 characters.';
      return;
    }
    if (!this.newClassForm.instructorId) {
      this.classFormError = 'Please assign an instructor/faculty member.';
      return;
    }

    this.isSavingClass = true;
    this.classFormError = '';
    this.cdr.detectChanges();

    const payload = {
      name: this.newClassForm.name.trim(),
      code: this.newClassForm.code.trim(),
      instructorId: +this.newClassForm.instructorId,
      description: this.newClassForm.description ? this.newClassForm.description.trim() : ''
    };

    this.apiService.createAdminSubject(payload).subscribe({
      next: () => {
        this.isSavingClass = false;
        this.closeCreateClassModal();
        this.showToast('Lab Class created successfully!');
        this.loadSubjects();
        this.loadStats();
        this.loadLogs();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isSavingClass = false;
        this.classFormError = err.error?.message || 'Failed to create lab class.';
        this.cdr.detectChanges();
      }
    });
  }

  // ==========================================
  // AUDIT LOGS
  // ==========================================

  loadLogs(): void {
    this.isLoadingLogs = true;
    this.apiService.getAuditLogs().subscribe({
      next: (data) => {
        this.auditLogs = data;
        this.isLoadingLogs = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoadingLogs = false;
        this.showToast(err.error?.message || 'Failed to load system audit logs', 'error');
        this.cdr.detectChanges();
      }
    });
  }

  // ==========================================
  // HELPERS
  // ==========================================

  get instructorUsers(): AdminUser[] {
    return this.users.filter(u => u.role === 'INSTRUCTOR');
  }

  get studentUsers(): AdminUser[] {
    return this.users.filter(u => u.role === 'STUDENT');
  }

  // ==========================================
  // SYSTEM STATS
  // ==========================================

  loadStats(): void {
    this.isLoadingStats = true;
    this.apiService.getAdminStats().subscribe({
      next: (data) => {
        this.stats = data;
        this.isLoadingStats = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoadingStats = false;
        console.error('Failed to load system stats', err);
        this.cdr.detectChanges();
      }
    });
  }

  getInitials(name: string): string {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }

  getRoleBadgeClass(role: Role): string {
    switch (role) {
      case 'ADMIN': return 'badge-role-admin';
      case 'INSTRUCTOR': return 'badge-role-instructor';
      case 'STUDENT': return 'badge-role-student';
      default: return '';
    }
  }
}
