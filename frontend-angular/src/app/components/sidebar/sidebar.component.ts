import { Component, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { ViewStateService } from '../../services/view-state.service';
import { Subject as SubjectModel } from '../../models/subject.model';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  @Output() openCreateSubjectModal = new EventEmitter<void>();
  @Output() openAddStudentsModal = new EventEmitter<void>();

  constructor(
    public authService: AuthService,
    public viewStateService: ViewStateService,
    private cdr: ChangeDetectorRef
  ) {}

  onHomeClick() {
    this.viewStateService.setView('CLASSES_HOME');
    this.viewStateService.closeSidebar();
    this.cdr.detectChanges();
  }

  onSelectClass(subj: SubjectModel) {
    this.viewStateService.selectSubject(subj);
    this.viewStateService.closeSidebar();
    this.cdr.detectChanges();
  }

  logout() {
    this.authService.logout();
    this.viewStateService.setView('AUTH');
    this.viewStateService.closeSidebar();
    this.cdr.detectChanges();
  }

  triggerCreateSubject() {
    this.openCreateSubjectModal.emit();
    this.viewStateService.closeSidebar();
    this.cdr.detectChanges();
  }

  triggerAddStudents() {
    this.openAddStudentsModal.emit();
    this.viewStateService.closeSidebar();
    this.cdr.detectChanges();
  }
}
