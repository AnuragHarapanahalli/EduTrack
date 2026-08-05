import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HeaderComponent } from './components/header/header.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { AuthComponent } from './components/auth/auth.component';
import { ClassesHomeComponent } from './components/classes-home/classes-home.component';

import { ClassHeaderComponent }
from './components/class-detail/class-header/class-header.component';

import { StreamComponent }
from './components/class-detail/stream/stream.component';

import { ClassworkComponent }
from './components/class-detail/classwork/classwork.component';

import { PeopleComponent }
from './components/class-detail/people/people.component';

import { LeaderboardComponent }
from './components/class-detail/leaderboard/leaderboard.component';


import { CreateSubjectModalComponent }
from './components/modals/create-subject-modal.component';

import { AddStudentsModalComponent }
from './components/modals/add-students-modal.component';

import { CreateMilestoneModalComponent }
from './components/modals/create-milestone-modal.component';

import { UploadModalComponent }
from './components/modals/upload-modal.component';

import { ReviewRosterModalComponent }
from './components/modals/review-roster-modal.component';


import { AuthService } from './services/auth.service';
import { ViewStateService } from './services/view-state.service';
import { ApiService } from './services/api.service';
import { ThemeService } from './services/theme.service';

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

    ClassHeaderComponent,

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



  selectedMilestoneForEdit: Milestone | null = null;

  selectedMilestoneForUpload: Milestone | null = null;

  selectedMilestoneForRoster: Milestone | null = null;



  constructor(

    public authService: AuthService,

    public viewStateService: ViewStateService,

    public themeService: ThemeService,

    private apiService: ApiService,

    private cdr: ChangeDetectorRef

  ) {}



  ngOnInit(): void {

    this.authService.logout();

    this.viewStateService.setView('AUTH');

  }





  loadInitialSubjects(
    userId: number,
    role: string
  ): void {


    const request =

      role === 'INSTRUCTOR'

        ? this.apiService.getSubjectsForInstructor(userId)

        : this.apiService.getSubjectsForStudent(userId);



    request.subscribe({


      next: subjects => {


        this.viewStateService.setUserSubjects(subjects);


        this.viewStateService.setView(
          'CLASSES_HOME'
        );


        this.cdr.detectChanges();

      },


      error: err => {


        console.error(
          'Error loading subjects:',
          err
        );


        this.viewStateService.setView(
          'CLASSES_HOME'
        );


        this.cdr.detectChanges();


      }


    });


  }






  openCreateMilestoneDialog(): void {


    this.selectedMilestoneForEdit = null;


    this.showCreateMilestoneModal = true;


    this.cdr.detectChanges();


  }





  openEditMilestoneDialog(
    milestone: Milestone
  ): void {


    this.selectedMilestoneForEdit = milestone;


    this.showCreateMilestoneModal = true;


    this.cdr.detectChanges();


  }






  openUploadDialog(
    milestone: Milestone
  ): void {


    this.selectedMilestoneForUpload = milestone;


    this.showUploadModal = true;


    this.cdr.detectChanges();


  }






  openRosterDialog(
    milestone: Milestone
  ): void {


    this.selectedMilestoneForRoster = milestone;


    this.showRosterModal = true;


    this.cdr.detectChanges();


  }






  closeCreateSubjectModal(): void {
    this.showCreateSubjectModal = false;
    this.cdr.detectChanges();
  }

  closeAddStudentsModal(): void {
    this.showAddStudentsModal = false;
    this.cdr.detectChanges();
  }

  closeCreateMilestoneModal(): void {
    this.showCreateMilestoneModal = false;
    this.selectedMilestoneForEdit = null;
    this.cdr.detectChanges();
  }

  closeUploadModal(): void {
    this.showUploadModal = false;
    this.selectedMilestoneForUpload = null;
    this.cdr.detectChanges();
  }

  closeRosterModal(): void {
    this.showRosterModal = false;
    this.selectedMilestoneForRoster = null;
    this.cdr.detectChanges();
  }

  refreshClasses(): void {
    const user = this.authService.currentUserVal;
    if(user){
      this.loadInitialSubjects(
        user.id,
        user.role
      );
    }
  }

  refreshCurrentSubjectState(): void {
    this.viewStateService.triggerRefresh();
    const subject = this.viewStateService.currentSubject();
    if(subject){
      this.viewStateService.currentSubject.set({
        ...subject
      });
    }
    this.cdr.detectChanges();
  }

}