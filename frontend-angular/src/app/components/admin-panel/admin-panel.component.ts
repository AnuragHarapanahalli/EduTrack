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
  AuditLog,
  BulkRowIssue,
  BulkUploadValidationResponse
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
  allInstructors: AdminUser[] = [];
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
    panel?: string;
    batch?: string;
    assignedBatches?: string[];
  } = {
    fullName: '',
    email: '',
    role: 'STUDENT',
    password: '',
    active: true,
    panel: '',
    batch: '',
    assignedBatches: []
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

  // Issue Resolution Modal State (Large Popup Window)
  showIssueModal = false;
  bulkValidationResult: BulkUploadValidationResponse | null = null;
  bulkIssues: BulkRowIssue[] = [];
  bulkValidRows: CreateAdminUserRequest[] = [];
  isImportingProcessed = false;
  issueFilter: 'ALL' | 'UNRESOLVED' | 'FIXED' | 'IGNORED' = 'ALL';

  // Audit Logs Pagination State
  logPage = 0;
  hasMoreLogs = true;

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
    this.loadInstructors();
    this.loadStats();
    this.loadSubjects();
    this.loadLogs();
  }

  loadInstructors(): void {
    this.apiService.getAdminUsers(undefined, 'INSTRUCTOR', true).subscribe({
      next: (data) => {
        this.allInstructors = data;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load instructors', err);
      }
    });
  }

  setTab(tab: AdminTab): void {
    this.viewStateService.setAdminTab(tab);
    if (tab === 'STATS') {
      this.loadStats();
    } else if (tab === 'LOGS') {
      this.loadLogs();
    } else if (tab === 'CLASSES') {
      this.loadSubjects();
      this.loadInstructors();
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
      active: true,
      panel: '',
      batch: '',
      assignedBatches: []
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
      active: user.active,
      panel: user.panel || '',
      batch: user.batch || '',
      assignedBatches: user.assignedBatches ? [...user.assignedBatches] : []
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
    const limits = this.viewStateService.validationLimits();
    const minNameLen = limits?.userFullnameMin || 2;
    const maxNameLen = limits?.userFullnameMax || 50;
    const maxEmailLen = limits?.userEmailMax || 100;

    if (!this.userForm.fullName || this.userForm.fullName.trim().length < minNameLen) {
      this.userFormError = `Full name must be at least ${minNameLen} characters long.`;
      return;
    }
    if (this.userForm.fullName.trim().length > maxNameLen) {
      this.userFormError = `Full name cannot exceed ${maxNameLen} characters.`;
      return;
    }
    if (!this.userForm.email || !this.userForm.email.trim().includes('@')) {
      this.userFormError = 'A valid email address is required.';
      return;
    }
    if (this.userForm.email.trim().length > maxEmailLen) {
      this.userFormError = `Email address cannot exceed ${maxEmailLen} characters.`;
      return;
    }

    if (!this.isEditingUser && this.userForm.password && this.userForm.password.trim()) {
      const minPassLen = limits?.userPasswordMin || 6;
      const maxPassLen = limits?.userPasswordMax || 100;
      if (this.userForm.password.trim().length < minPassLen) {
        this.userFormError = `Password must be at least ${minPassLen} characters long.`;
        return;
      }
      if (this.userForm.password.trim().length > maxPassLen) {
        this.userFormError = `Password cannot exceed ${maxPassLen} characters.`;
        return;
      }
    }

    this.isSavingUser = true;
    this.userFormError = '';

    if (this.isEditingUser && this.selectedUserForEdit) {
      const payload: UpdateAdminUserRequest = {
        fullName: this.userForm.fullName.trim(),
        email: this.userForm.email.trim(),
        role: this.userForm.role,
        active: this.userForm.active,
        panel: this.userForm.role === 'STUDENT' ? (this.userForm.panel?.trim() || undefined) : undefined,
        batch: this.userForm.role === 'STUDENT' ? (this.userForm.batch?.trim() || undefined) : undefined,
        assignedBatches: this.userForm.role === 'INSTRUCTOR' ? this.userForm.assignedBatches : undefined
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
        role: this.userForm.role,
        panel: this.userForm.role === 'STUDENT' ? (this.userForm.panel?.trim() || undefined) : undefined,
        batch: this.userForm.role === 'STUDENT' ? (this.userForm.batch?.trim() || undefined) : undefined,
        assignedBatches: this.userForm.role === 'INSTRUCTOR' ? this.userForm.assignedBatches : undefined
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
    const headers = 'fullName,email,role,panel,batch,assignedBatches\n';
    const row = this.csvUploadRole === 'STUDENT' 
      ? '"Rahul Sharma","rahul@edutrack.edu","STUDENT","A","A2",""\n"Priya Patel","priya@edutrack.edu","STUDENT","A","A1",""\n'
      : '"Prof. Rajesh Sharma","sharma@edutrack.edu","INSTRUCTOR","","","A1;B1"\n"Dr. Amit Verma","verma@edutrack.edu","INSTRUCTOR","","","A2;B2"\n';
    
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

    this.apiService.validateUsersCsv(this.selectedCsvFile, this.csvUploadRole).subscribe({
      next: (result) => {
        this.isUploadingCsv = false;
        if (!result.issues || result.issues.length === 0) {
          this.importValidAccounts(result.validRows);
        } else {
          this.closeCsvModal();
          this.bulkValidationResult = result;
          this.bulkValidRows = [...result.validRows];
          this.bulkIssues = result.issues.map(iss => ({
            ...iss,
            fixed: false,
            ignored: false
          }));
          this.showIssueModal = true;
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        this.isUploadingCsv = false;
        this.csvFormError = err.error?.message || 'Failed to parse or validate CSV file.';
        this.cdr.detectChanges();
      }
    });
  }

  importValidAccounts(validRows: CreateAdminUserRequest[]): void {
    if (!validRows || validRows.length === 0) {
      this.csvFormError = 'No valid rows found in the CSV file.';
      this.cdr.detectChanges();
      return;
    }

    this.isUploadingCsv = true;
    this.cdr.detectChanges();

    this.apiService.importProcessedUsers(validRows).subscribe({
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
        this.csvFormError = err.error?.message || 'Failed to import accounts.';
        this.cdr.detectChanges();
      }
    });
  }

  closeIssueModal(): void {
    this.showIssueModal = false;
    this.bulkValidationResult = null;
    this.bulkIssues = [];
    this.bulkValidRows = [];
    this.isImportingProcessed = false;
    this.cdr.detectChanges();
  }

  downloadIssuesCsv(): void {
    if (!this.bulkIssues || this.bulkIssues.length === 0) return;

    const rowMap = new Map<number, { row: BulkRowIssue; reasons: string[] }>();
    for (const issue of this.bulkIssues) {
      if (!rowMap.has(issue.rowNumber)) {
        rowMap.set(issue.rowNumber, { row: issue, reasons: [issue.errorMessage] });
      } else {
        rowMap.get(issue.rowNumber)!.reasons.push(issue.errorMessage);
      }
    }

    const headers = 'fullName,email,role,panel,batch,assignedBatches,issue_notes\n';
    let csvContent = headers;

    rowMap.forEach(({ row, reasons }) => {
      const escape = (str?: string) => `"${(str || '').replace(/"/g, '""')}"`;
      const line = [
        escape(row.fullName),
        escape(row.email),
        escape(row.role || this.csvUploadRole),
        escape(row.panel),
        escape(row.batch),
        escape(row.assignedBatches),
        escape(reasons.join('; '))
      ].join(',');
      csvContent += line + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${this.csvUploadRole.toLowerCase()}_import_issues.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  onCorrectedCsvSelected(event: any): void {
    const file = event.target.files?.[0];
    if (!file) return;

    this.isUploadingCsv = true;
    this.cdr.detectChanges();

    this.apiService.validateUsersCsv(file, this.csvUploadRole).subscribe({
      next: (result) => {
        this.isUploadingCsv = false;
        if (!result.issues || result.issues.length === 0) {
          this.showToast('Corrected CSV has no issues! Importing now...');
          this.importValidAccounts(result.validRows);
          this.closeIssueModal();
        } else {
          this.bulkValidationResult = result;
          this.bulkValidRows = [...result.validRows];
          this.bulkIssues = result.issues.map(iss => ({ ...iss, fixed: false, ignored: false }));
          this.showToast(`Analyzed corrected file: ${result.validCount} valid, ${result.issueCount} remaining issues.`);
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        this.isUploadingCsv = false;
        this.showToast(err.error?.message || 'Failed to validate corrected CSV file.', 'error');
        this.cdr.detectChanges();
      }
    });
  }

  onIssueValueChange(issue: BulkRowIssue): void {
    const val = (issue.currentValue || '').trim();

    if (issue.column === 'email') {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (val.length > 0 && val.length <= 100 && emailRegex.test(val)) {
        issue.fixed = true;
        issue.email = val.toLowerCase();
        this.bulkIssues
          .filter(i => i.rowNumber === issue.rowNumber)
          .forEach(i => i.email = val.toLowerCase());
      } else {
        issue.fixed = false;
      }
    } else if (issue.column === 'fullName') {
      if (val.length >= 2 && val.length <= 100) {
        issue.fixed = true;
        issue.fullName = val;
        this.bulkIssues
          .filter(i => i.rowNumber === issue.rowNumber)
          .forEach(i => i.fullName = val);
      } else {
        issue.fixed = false;
      }
    } else if (issue.column === 'role') {
      const upper = val.toUpperCase();
      if (upper === 'STUDENT' || upper === 'INSTRUCTOR' || upper === 'ADMIN') {
        issue.fixed = true;
        issue.role = upper;
        this.bulkIssues
          .filter(i => i.rowNumber === issue.rowNumber)
          .forEach(i => i.role = upper);
      } else {
        issue.fixed = false;
      }
    } else {
      if (val.length > 0) {
        issue.fixed = true;
        if (issue.column === 'batch') {
          issue.batch = val;
          this.bulkIssues.filter(i => i.rowNumber === issue.rowNumber).forEach(i => i.batch = val);
        } else if (issue.column === 'assignedBatches') {
          issue.assignedBatches = val;
          this.bulkIssues.filter(i => i.rowNumber === issue.rowNumber).forEach(i => i.assignedBatches = val);
        }
      } else {
        issue.fixed = false;
      }
    }
  }

  toggleIgnoreIssue(issue: BulkRowIssue): void {
    issue.ignored = !issue.ignored;
  }

  getFilteredIssues(): BulkRowIssue[] {
    if (this.issueFilter === 'UNRESOLVED') {
      return this.bulkIssues.filter(i => !i.fixed && !i.ignored);
    }
    if (this.issueFilter === 'FIXED') {
      return this.bulkIssues.filter(i => i.fixed && !i.ignored);
    }
    if (this.issueFilter === 'IGNORED') {
      return this.bulkIssues.filter(i => i.ignored);
    }
    return this.bulkIssues;
  }

  getUnresolvedIssuesCount(): number {
    return this.bulkIssues.filter(i => !i.fixed && !i.ignored).length;
  }

  getFixedIssuesCount(): number {
    return this.bulkIssues.filter(i => i.fixed && !i.ignored).length;
  }

  getIgnoredIssuesCount(): number {
    return this.bulkIssues.filter(i => i.ignored).length;
  }

  getReadyToImportCount(): number {
    let count = this.bulkValidRows.length;
    const rowMap = new Map<number, BulkRowIssue[]>();
    for (const iss of this.bulkIssues) {
      if (!rowMap.has(iss.rowNumber)) rowMap.set(iss.rowNumber, []);
      rowMap.get(iss.rowNumber)!.push(iss);
    }
    rowMap.forEach(issues => {
      if (!issues.some(i => i.ignored) && issues.every(i => i.fixed)) {
        count++;
      }
    });
    return count;
  }

  applyFixesAndImport(): void {
    const toImport: CreateAdminUserRequest[] = [...this.bulkValidRows];

    const rowMap = new Map<number, BulkRowIssue[]>();
    for (const iss of this.bulkIssues) {
      if (!rowMap.has(iss.rowNumber)) {
        rowMap.set(iss.rowNumber, []);
      }
      rowMap.get(iss.rowNumber)!.push(iss);
    }

    let fixedCount = 0;
    let ignoredCount = 0;

    rowMap.forEach((issues) => {
      if (issues.some(i => i.ignored)) {
        ignoredCount++;
        return;
      }

      const allFixed = issues.every(i => i.fixed);
      if (allFixed) {
        fixedCount++;
        const sample = issues[0];
        const req: CreateAdminUserRequest = {
          fullName: sample.fullName || sample.currentValue,
          email: (sample.email || sample.currentValue).toLowerCase().trim(),
          role: (sample.role?.toUpperCase() as any) || (this.csvUploadRole as any),
          panel: sample.panel,
          batch: sample.batch,
          assignedBatches: sample.assignedBatches ? sample.assignedBatches.split(';').map(s => s.trim()) : undefined
        };
        toImport.push(req);
      }
    });

    if (toImport.length === 0) {
      this.showToast('No valid accounts to import. Please fix or restore issues.', 'error');
      return;
    }

    this.isImportingProcessed = true;
    this.cdr.detectChanges();

    this.apiService.importProcessedUsers(toImport).subscribe({
      next: (imported) => {
        this.isImportingProcessed = false;
        this.closeIssueModal();
        const roleLabel = this.csvUploadRole === 'STUDENT' ? 'Students' : 'Teachers';
        this.showToast(`Imported ${imported.length} ${roleLabel} accounts successfully (${fixedCount} fixed, ${ignoredCount} skipped)!`);
        this.loadUsers();
        this.loadStats();
        this.loadLogs();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isImportingProcessed = false;
        this.showToast(err.error?.message || 'Failed to import accounts.', 'error');
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

  changeInstructor(subject: Subject, eventOrId: any): void {
    const rawVal = (eventOrId && eventOrId.target) ? eventOrId.target.value : eventOrId;
    const instructorId = Number(rawVal);
    if (!instructorId || instructorId === subject.instructorId) return;

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
    const limits = this.viewStateService.validationLimits();
    const minNameLen = limits?.subjectNameMin || 3;
    const maxNameLen = limits?.subjectNameMax || 100;
    const minCodeLen = limits?.subjectCodeMin || 3;
    const maxCodeLen = limits?.subjectCodeMax || 20;
    const maxDescLen = limits?.subjectDescriptionMax || 1000;

    if (!this.newClassForm.name || this.newClassForm.name.trim().length < minNameLen) {
      this.classFormError = `Class name must be at least ${minNameLen} characters.`;
      return;
    }
    if (this.newClassForm.name.trim().length > maxNameLen) {
      this.classFormError = `Class name cannot exceed ${maxNameLen} characters.`;
      return;
    }
    if (!this.newClassForm.code || this.newClassForm.code.trim().length < minCodeLen) {
      this.classFormError = `Course code must be at least ${minCodeLen} characters.`;
      return;
    }
    if (this.newClassForm.code.trim().length > maxCodeLen) {
      this.classFormError = `Course code cannot exceed ${maxCodeLen} characters.`;
      return;
    }
    if (this.newClassForm.description && this.newClassForm.description.trim().length > maxDescLen) {
      this.classFormError = `Course description cannot exceed ${maxDescLen} characters.`;
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
    this.logPage = 0;
    this.hasMoreLogs = true;
    this.apiService.getAuditLogs(this.logPage, 50).subscribe({
      next: (data) => {
        this.auditLogs = data;
        this.isLoadingLogs = false;
        if (data.length < 50) {
          this.hasMoreLogs = false;
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoadingLogs = false;
        this.showToast(err.error?.message || 'Failed to load system audit logs', 'error');
        this.cdr.detectChanges();
      }
    });
  }

  loadMoreLogs(): void {
    this.logPage++;
    this.apiService.getAuditLogs(this.logPage, 50).subscribe({
      next: (data) => {
        if (data.length < 50) {
          this.hasMoreLogs = false;
        }
        this.auditLogs = [...this.auditLogs, ...data];
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.showToast(err.error?.message || 'Failed to load older logs', 'error');
        this.cdr.detectChanges();
      }
    });
  }

  // ==========================================
  // HELPERS
  // ==========================================

  get instructorUsers(): AdminUser[] {
    if (this.allInstructors && this.allInstructors.length > 0) {
      return this.allInstructors;
    }
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
