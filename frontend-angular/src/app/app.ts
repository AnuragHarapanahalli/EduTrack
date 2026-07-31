import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './components/header/header.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { AuthComponent } from './components/auth/auth.component';
import { ClassesHomeComponent } from './components/classes-home/classes-home.component';
import { StreamComponent } from './components/class-detail/stream/stream.component';
import { ClassworkComponent } from './components/class-detail/classwork/classwork.component';
import { PeopleComponent } from './components/class-detail/people/people.component';
import { LeaderboardComponent } from './components/class-detail/leaderboard/leaderboard.component';

import { CreateSubjectModalComponent } from './components/modals/create-subject-modal.component';
import { AddStudentsModalComponent } from './components/modals/add-students-modal.component';
import { CreateMilestoneModalComponent } from './components/modals/create-milestone-modal.component';
import { UploadModalComponent } from './components/modals/upload-modal.component';
import { ReviewRosterModalComponent } from './components/modals/review-roster-modal.component';

import { AuthService } from './services/auth.service';
import { ViewStateService } from './services/view-state.service';
import { ApiService } from './services/api.service';
import { Milestone } from './models/milestone.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    SidebarComponent,
    AuthComponent,
    ClassesHomeComponent,
    StreamComponent,
    ClassworkComponent,
    PeopleComponent,
    LeaderboardComponent,
    CreateSubjectModalComponent,
    AddStudentsModalComponent,
    CreateMilestoneModalComponent,
    UploadModalComponent,
    ReviewRosterModalComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent implements OnInit {
  showCreateSubjectModal = false;
  showAddStudentsModal = false;
  showCreateMilestoneModal = false;
  showUploadModal = false;
  showRosterModal = false;

  selectedMilestoneForUpload: Milestone | null = null;
  selectedMilestoneForRoster: Milestone | null = null;

  constructor(
    public authService: AuthService,
    public viewStateService: ViewStateService,
    private apiService: ApiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const user = this.authService.currentUser();
    if (user) {
      this.loadInitialSubjects(user.id, user.role);
    } else {
      this.viewStateService.setView('AUTH');
    }
  }

  loadInitialSubjects(userId: number, role: string) {
    const stream = (role === 'INSTRUCTOR')
      ? this.apiService.getSubjectsForInstructor(userId)
      : this.apiService.getSubjectsForStudent(userId);

    stream.subscribe({
      next: (subjects) => {
        this.viewStateService.setUserSubjects(subjects);
        this.viewStateService.setView('CLASSES_HOME');
        this.cdr.detectChanges();
      },
      error: () => {
        this.viewStateService.setView('CLASSES_HOME');
        this.cdr.detectChanges();
      }
    });
  }

  openUploadDialog(milestone: Milestone) {
    this.selectedMilestoneForUpload = milestone;
    this.showUploadModal = true;
    this.cdr.detectChanges();
  }

  openRosterDialog(milestone: Milestone) {
    this.selectedMilestoneForRoster = milestone;
    this.showRosterModal = true;
    this.cdr.detectChanges();
  }

  refreshClasses() {
    const user = this.authService.currentUser();
    if (user) {
      this.loadInitialSubjects(user.id, user.role);
    }
  }

  refreshCurrentSubjectState() {
    const currentSubj = this.viewStateService.currentSubject();
    if (currentSubj) {
      this.viewStateService.currentSubject.set({ ...currentSubj });
    }
    this.cdr.detectChanges();
  }
}
