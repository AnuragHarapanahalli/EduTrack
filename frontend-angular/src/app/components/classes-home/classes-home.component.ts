import { Component, Output, EventEmitter, effect, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { ViewStateService } from '../../services/view-state.service';
import { Subject as SubjectModel } from '../../models/subject.model';

@Component({
  selector: 'app-classes-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './classes-home.component.html',
  styleUrl: './classes-home.component.css'
})
export class ClassesHomeComponent {
  @Output() openCreateSubjectModal = new EventEmitter<void>();

  constructor(
    private apiService: ApiService,
    public authService: AuthService,
    public viewStateService: ViewStateService,
    private cdr: ChangeDetectorRef
  ) {
    effect(() => {
      const user = this.authService.currentUser();
      const currentView = this.viewStateService.currentView();
      if (user && currentView === 'CLASSES_HOME') {
        this.loadSubjects(user.id, user.role);
      }
    });
  }

  loadSubjects(userId: number, role: string) {
    const stream = (role === 'INSTRUCTOR')
      ? this.apiService.getSubjectsForInstructor(userId)
      : this.apiService.getSubjectsForStudent(userId);

    stream.subscribe({
      next: (subjects) => {
        this.viewStateService.setUserSubjects(subjects);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading subjects:', err);
        this.cdr.detectChanges();
      }
    });
  }

  selectClass(subj: SubjectModel) {
    this.viewStateService.selectSubject(subj);
  }

  triggerCreateClass() {
    this.openCreateSubjectModal.emit();
  }

  getBannerGradient(index: number): string {
    const gradients = [
      'linear-gradient(135deg, #1e88e5 0%, #1565c0 100%)', // Blue Math
      'linear-gradient(135deg, #00897b 0%, #004d40 100%)', // Teal Science
      'linear-gradient(135deg, #5e35b1 0%, #311b92 100%)', // Indigo CS
      'linear-gradient(135deg, #d81b60 0%, #880e4f 100%)', // Pink Art
      'linear-gradient(135deg, #fb8c00 0%, #e65100 100%)'  // Amber Engineering
    ];
    return gradients[index % gradients.length];
  }
}
