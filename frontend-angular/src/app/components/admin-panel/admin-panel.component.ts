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
  AdminBatch,
  CreateBatchRequest,
  SystemStats
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
  isLoadingBatches = false;
  isLoadingStats = false;
  isLoadingSubjects = false;

  // Data
  users: AdminUser[] = [];
  batches: AdminBatch[] = [];
  subjects: Subject[] = [];
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
    batchId: number | null;
    password?: string;
    active?: boolean;
  } = {
    fullName: '',
    email: '',
    role: 'STUDENT',
    batchId: null,
    password: '',
    active: true
  };

  userFormError = '';
  isSavingUser = false;
  showFormPassword = false;

  // Batch Creation
  showCreateBatchModal = false;
  newBatchName = '';
  newBatchAcademicYear = '';
  batchFormError = '';
  isSavingBatch = false;

  // Class / Course Creation by Admin
  showCreateClassModal = false;
  newClassForm = {
    name: '',
    code: '',
    instructorId: 0,
    batchId: 0,
    description: '',
    autoEnrollBatchStudents: true
  };
  classFormError = '';
  isSavingClass = false;

  // Batch Mapping Tab State
  selectedBatchFilter: number | 'ALL' | 'UNASSIGNED' = 'ALL';
  selectedStudentIdsForBatch: Set<number> = new Set<number>();
  targetBatchIdForBulk: number | null = null;
  isBulkAssigningBatch = false;

  // Subject Enrollment Tab State
  selectedSubjectId: number | null = null;
  selectedSubject: Subject | null = null;
  enrolledStudentsInSubject: AdminUser[] = [];
  availableStudentsForSubject: AdminUser[] = [];
  selectedStudentIdsForEnrollment: Set<number> = new Set<number>();
  isEnrolling = false;

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
    this.loadBatches();
    this.loadSubjects();
    this.loadStats();
  }

  setTab(tab: AdminTab): void {
    this.viewStateService.setAdminTab(tab);
    if (tab === 'STATS') {
      this.loadStats();
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
        if (this.selectedSubjectId) {
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
      batchId: this.batches.length > 0 ? this.batches[0].id : null,
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
      batchId: user.batchId || null,
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
        batchId: this.userForm.role === 'STUDENT' ? (this.userForm.batchId || 0) : 0,
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
        role: this.userForm.role,
        batchId: this.userForm.role === 'STUDENT' ? (this.userForm.batchId || undefined) : undefined
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
          this.loadBatches();
          this.loadStats();
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
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.showToast(err.error?.message || 'Failed to change status', 'error');
      }
    });
  }

  // ==========================================
  // BATCHES
  // ==========================================

  loadBatches(): void {
    this.isLoadingBatches = true;
    this.apiService.getAdminBatches().subscribe({
      next: (data) => {
        this.batches = data;
        this.isLoadingBatches = false;
        if (!this.targetBatchIdForBulk && this.batches.length > 0) {
          this.targetBatchIdForBulk = this.batches[0].id;
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoadingBatches = false;
        this.showToast(err.error?.message || 'Failed to load batches', 'error');
        this.cdr.detectChanges();
      }
    });
  }

  openCreateBatchModal(): void {
    this.newBatchName = '';
    this.newBatchAcademicYear = '';
    this.batchFormError = '';
    this.showCreateBatchModal = true;
    this.cdr.detectChanges();
  }

  closeCreateBatchModal(): void {
    this.showCreateBatchModal = false;
    this.cdr.detectChanges();
  }

  saveBatch(): void {
    if (!this.newBatchName || !this.newBatchName.trim()) {
      this.batchFormError = 'Batch name is required.';
      return;
    }

    this.isSavingBatch = true;
    this.batchFormError = '';

    const payload: CreateBatchRequest = {
      name: this.newBatchName.trim(),
      academicYear: this.newBatchAcademicYear ? this.newBatchAcademicYear.trim() : undefined
    };

    this.apiService.createAdminBatch(payload).subscribe({
      next: (created) => {
        this.isSavingBatch = false;
        this.closeCreateBatchModal();
        this.showToast(`Batch "${created.name}" created successfully!`);
        this.loadBatches();
        this.loadStats();
      },
      error: (err) => {
        this.isSavingBatch = false;
        this.batchFormError = err.error?.message || 'Failed to create batch.';
        this.cdr.detectChanges();
      }
    });
  }

  // ==========================================
  // BATCH MAPPINGS
  // ==========================================

  get instructorUsers(): AdminUser[] {
    return this.users.filter(u => u.role === 'INSTRUCTOR');
  }

  get studentUsers(): AdminUser[] {
    return this.users.filter(u => u.role === 'STUDENT');
  }

  openCreateClassModal(): void {
    const defaultInstructorId = this.instructorUsers.length > 0 ? this.instructorUsers[0].id : 0;
    const defaultBatchId = this.batches.length > 0 ? this.batches[0].id : 0;

    this.newClassForm = {
      name: '',
      code: '',
      instructorId: defaultInstructorId,
      batchId: defaultBatchId,
      description: '',
      autoEnrollBatchStudents: true
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
      this.classFormError = 'Course name must be at least 3 characters long.';
      return;
    }
    if (!this.newClassForm.code || this.newClassForm.code.trim().length < 3) {
      this.classFormError = 'Course code must be at least 3 characters long.';
      return;
    }
    if (!this.newClassForm.instructorId) {
      this.classFormError = 'Please select a faculty instructor.';
      return;
    }
    if (!this.newClassForm.batchId) {
      this.classFormError = 'Please select a target batch.';
      return;
    }

    this.isSavingClass = true;
    this.classFormError = '';

    this.apiService.createAdminSubject(this.newClassForm).subscribe({
      next: (created) => {
        this.isSavingClass = false;
        this.closeCreateClassModal();
        this.showToast(`Class "${created.name}" created and assigned to ${created.batchName}!`);
        this.loadSubjects();
        this.loadUsers();
        this.loadBatches();
        this.loadStats();
      },
      error: (err) => {
        this.isSavingClass = false;
        this.classFormError = err.error?.message || 'Failed to create class.';
        this.cdr.detectChanges();
      }
    });
  }

  onQuickSubjectBatchChange(subject: Subject, event: Event): void {
    const select = event.target as HTMLSelectElement;
    const newBatchId = Number(select.value);
    if (!newBatchId) return;

    this.apiService.assignSubjectToBatch(subject.id, newBatchId, true).subscribe({
      next: (updated) => {
        subject.batchId = updated.batchId;
        subject.batchName = updated.batchName;
        this.showToast(`Reassigned "${subject.name}" to ${updated.batchName} & synced batch students!`);
        this.loadBatches();
        this.loadUsers();
        if (this.selectedSubjectId === subject.id) {
          this.selectedSubject = updated;
          this.refreshSubjectEnrollmentLists();
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.showToast(err.error?.message || 'Failed to assign class to batch', 'error');
        this.loadSubjects();
      }
    });
  }

  autoEnrollBatchStudentsForSubject(subject: Subject): void {
    this.apiService.autoEnrollBatchStudents(subject.id).subscribe({
      next: (updated) => {
        this.showToast(`Auto-enrolled all students from ${subject.batchName} into "${subject.name}"!`);
        this.loadUsers();
        if (this.selectedSubjectId === subject.id) {
          this.selectedSubject = updated;
          this.refreshSubjectEnrollmentLists();
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.showToast(err.error?.message || 'Failed to auto-enroll batch students', 'error');
      }
    });
  }

  get filteredStudentsForBatchMapping(): AdminUser[] {
    return this.studentUsers.filter(s => {
      if (this.selectedBatchFilter === 'ALL') return true;
      if (this.selectedBatchFilter === 'UNASSIGNED') return !s.batchId;
      return s.batchId === this.selectedBatchFilter;
    });
  }

  toggleStudentSelection(studentId: number): void {
    if (this.selectedStudentIdsForBatch.has(studentId)) {
      this.selectedStudentIdsForBatch.delete(studentId);
    } else {
      this.selectedStudentIdsForBatch.add(studentId);
    }
  }

  toggleSelectAllStudents(): void {
    const list = this.filteredStudentsForBatchMapping;
    if (this.selectedStudentIdsForBatch.size === list.length && list.length > 0) {
      this.selectedStudentIdsForBatch.clear();
    } else {
      this.selectedStudentIdsForBatch = new Set(list.map(s => s.id));
    }
  }

  isAllStudentsSelected(): boolean {
    const list = this.filteredStudentsForBatchMapping;
    return list.length > 0 && this.selectedStudentIdsForBatch.size === list.length;
  }

  onQuickBatchChange(student: AdminUser, event: Event): void {
    const select = event.target as HTMLSelectElement;
    const newBatchId = select.value ? Number(select.value) : null;

    this.apiService.assignStudentBatch(student.id, newBatchId).subscribe({
      next: (updated) => {
        student.batchId = updated.batchId;
        student.batchName = updated.batchName;
        this.showToast(`Updated batch for ${student.fullName}`);
        this.loadBatches();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.showToast(err.error?.message || 'Failed to assign batch', 'error');
        this.loadUsers();
      }
    });
  }

  executeBulkBatchAssign(): void {
    if (this.selectedStudentIdsForBatch.size === 0) {
      this.showToast('Please select at least one student.', 'error');
      return;
    }

    const ids = Array.from(this.selectedStudentIdsForBatch);
    this.isBulkAssigningBatch = true;

    this.apiService.bulkAssignStudentBatch(ids, this.targetBatchIdForBulk).subscribe({
      next: () => {
        this.isBulkAssigningBatch = false;
        this.showToast(`Successfully assigned ${ids.length} students to batch!`);
        this.selectedStudentIdsForBatch.clear();
        this.loadUsers();
        this.loadBatches();
      },
      error: (err) => {
        this.isBulkAssigningBatch = false;
        this.showToast(err.error?.message || 'Failed to bulk assign batch', 'error');
      }
    });
  }

  // ==========================================
  // SUBJECT ENROLLMENT MAPPING
  // ==========================================

  loadSubjects(): void {
    this.isLoadingSubjects = true;
    this.apiService.getAllSubjects().subscribe({
      next: (data) => {
        this.subjects = data;
        this.isLoadingSubjects = false;
        if (!this.selectedSubjectId && this.subjects.length > 0) {
          this.onSelectSubject(this.subjects[0]);
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoadingSubjects = false;
        this.showToast(err.error?.message || 'Failed to load subjects', 'error');
        this.cdr.detectChanges();
      }
    });
  }

  onSelectSubject(subject: Subject): void {
    this.selectedSubjectId = subject.id;
    this.selectedSubject = subject;
    this.refreshSubjectEnrollmentLists();
  }

  refreshSubjectEnrollmentLists(): void {
    if (!this.selectedSubjectId) return;

    this.apiService.getEnrolledStudents(this.selectedSubjectId).subscribe({
      next: (enrolled) => {
        const enrolledIds = new Set(enrolled.map(e => e.id));
        this.enrolledStudentsInSubject = this.studentUsers.filter(u => enrolledIds.has(u.id));
        this.availableStudentsForSubject = this.studentUsers.filter(u => !enrolledIds.has(u.id));
        this.selectedStudentIdsForEnrollment.clear();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.showToast(err.error?.message || 'Failed to load subject enrollments', 'error');
      }
    });
  }

  enrollStudent(studentId: number): void {
    if (!this.selectedSubjectId) return;
    this.isEnrolling = true;

    this.apiService.enrollStudentInSubject(this.selectedSubjectId, studentId).subscribe({
      next: () => {
        this.isEnrolling = false;
        this.showToast('Student enrolled successfully!');
        this.refreshSubjectEnrollmentLists();
        this.loadUsers();
      },
      error: (err) => {
        this.isEnrolling = false;
        this.showToast(err.error?.message || 'Failed to enroll student', 'error');
      }
    });
  }

  unenrollStudent(studentId: number): void {
    if (!this.selectedSubjectId) return;
    this.isEnrolling = true;

    this.apiService.unenrollStudentFromSubject(this.selectedSubjectId, studentId).subscribe({
      next: () => {
        this.isEnrolling = false;
        this.showToast('Student removed from subject.');
        this.refreshSubjectEnrollmentLists();
        this.loadUsers();
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
    if (!this.selectedSubjectId || this.selectedStudentIdsForEnrollment.size === 0) return;
    const ids = Array.from(this.selectedStudentIdsForEnrollment);
    this.isEnrolling = true;

    this.apiService.bulkEnrollStudentsInSubject(this.selectedSubjectId, ids).subscribe({
      next: () => {
        this.isEnrolling = false;
        this.showToast(`Enrolled ${ids.length} students in ${this.selectedSubject?.name}`);
        this.refreshSubjectEnrollmentLists();
        this.loadUsers();
      },
      error: (err) => {
        this.isEnrolling = false;
        this.showToast(err.error?.message || 'Failed to bulk enroll students', 'error');
      }
    });
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
