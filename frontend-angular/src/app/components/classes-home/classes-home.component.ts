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

  @Output()
  openCreateSubjectModal = new EventEmitter<void>();


  constructor(
    private apiService: ApiService,
    public authService: AuthService,
    public viewStateService: ViewStateService,
    private cdr: ChangeDetectorRef
  ) {


    /*
      Reload classes whenever:
      - user logs in
      - dashboard becomes active
    */

    effect(() => {

      const user = this.authService.currentUser();

      const currentView =
        this.viewStateService.currentView();


      if (
        user &&
        currentView === 'CLASSES_HOME'
      ) {

        this.loadSubjects(
          user.id,
          user.role
        );

      }

    });

  }



  // ============================
  // LOAD CLASSES
  // ============================

  loadSubjects(
    userId:number,
    role:string
  ):void {


    const request =

      role === 'INSTRUCTOR'

      ?

      this.apiService
      .getSubjectsForInstructor(userId)

      :

      this.apiService
      .getSubjectsForStudent(userId);



    request.subscribe({

      next:(subjects)=>{


        this.viewStateService
        .setUserSubjects(subjects);


        this.cdr.detectChanges();

      },


      error:(error)=>{

        console.error(
          "Error loading subjects:",
          error
        );


        this.viewStateService
        .setUserSubjects([]);


        this.cdr.detectChanges();

      }

    });


  }





  // ============================
  // OPEN CLASS
  // ============================


  selectClass(
    subject:SubjectModel
  ):void {


    this.viewStateService
    .selectSubject(subject);


  }





  // ============================
  // CREATE CLASS MODAL
  // ============================


  triggerCreateClass():void {


    this.openCreateSubjectModal
    .emit();


  }





  // ============================
  // DASHBOARD STATISTICS
  // ============================


  getTotalMilestones():number {


    return this.viewStateService
    .subjects()
    .reduce(

      (total,subject)=>{

        return total +
        (subject.totalMilestones || 0);

      },

      0

    );


  }




  getTotalStudents(): number {

  return this.viewStateService
    .subjects()
    .reduce((total, subject) => {

      return total + 
      ((subject as any).studentCount || 0);

    }, 0);

}




  getTotalClasses():number {


    return this.viewStateService
    .subjects()
    .length;


  }





  // ============================
  // CARD COLORS
  // ============================


  getBannerGradient(
    index:number
  ):string {


    const gradients = [


      'linear-gradient(135deg,#2563eb,#4f46e5)',


      'linear-gradient(135deg,#0f766e,#14b8a6)',


      'linear-gradient(135deg,#9333ea,#7c3aed)',


      'linear-gradient(135deg,#ea580c,#f97316)',


      'linear-gradient(135deg,#059669,#10b981)',


      'linear-gradient(135deg,#dc2626,#ef4444)'


    ];


    return gradients[
      index % gradients.length
    ];


  }



}