import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  ChangeDetectorRef,
  OnDestroy,
  effect
} from '@angular/core';

import { CommonModule } from '@angular/common';

import { forkJoin, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { ApiService } from '../../../services/api.service';
import { AuthService } from '../../../services/auth.service';
import { ViewStateService } from '../../../services/view-state.service';

import {
  Milestone,
  DeliverableItem
} from '../../../models/milestone.model';

import {
  Subject as SubjectModel
} from '../../../models/subject.model';

export interface MilestoneUI extends Milestone {
  isLocked: boolean;
  isDueSoon?: boolean;
  daysRemainingText?: string;
  deliverablesList: DeliverableItem[];
}

export interface StudentSubjectRow {
  subject: SubjectModel;
  milestones: MilestoneUI[];
}

@Component({
  selector: 'app-classwork',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './classwork.component.html',
  styleUrls: ['./classwork.component.css']
})
export class ClassworkComponent implements OnInit, OnDestroy {

  @Output() openCreateMilestoneModal = new EventEmitter<void>();
  @Output() openEditMilestoneModal = new EventEmitter<Milestone>();
  @Output() openUploadModal = new EventEmitter<Milestone>();
  @Output() openRosterModal = new EventEmitter<Milestone>();

  loading = true;
  teacherMilestones: MilestoneUI[] = [];
  expandedMilestoneId: number | null = null;
  studentSubjectRows: StudentSubjectRow[] = [];
  heroMilestone: MilestoneUI | null = null;
  heroSubject: SubjectModel | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private apiService: ApiService,
    public authService: AuthService,
    public viewStateService: ViewStateService,
    private cdr: ChangeDetectorRef
  ) {
    effect(() => {
      const subject = this.viewStateService.currentSubject();
      const user = this.authService.currentUser();
      const trigger = this.viewStateService.refreshTrigger();
      if (user) {
        if (user.role === 'INSTRUCTOR' && subject) {
          this.loadTeacherClasswork();
        } else if (user.role === 'STUDENT') {
          this.loadStudentNetflixView(user.id);
        }
      }
    });
  }



  ngOnInit():void{


    const user =
      this.authService.currentUser();


    if(!user)
      return;



    if(user.role==='STUDENT'){

      this.loadStudentNetflixView(user.id);

    }

    else{

      this.loadTeacherClasswork();

    }


  }





  loadStudentNetflixView(studentId: number) {
    const activeSubject = this.viewStateService.currentSubject();

    if (activeSubject) {
      this.loading = true;
      this.apiService.getMilestonesBySubject(activeSubject.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (rawMilestones) => {
            this.apiService.getSubmissionsByStudent(studentId)
              .pipe(takeUntil(this.destroy$))
              .subscribe({
                next: (submissions) => {
                  const submissionMap: any = {};
                  submissions.forEach(sub => {
                    submissionMap[sub.milestoneId] = sub;
                  });

                  const uiMilestones: MilestoneUI[] = rawMilestones.map((m, idx) => {
                    const deliverables = this.parseDeliverables(m.requiredDeliverables);
                    const submission = submissionMap[m.id];
                    const locked = idx > 0 && (
                      !submissionMap[rawMilestones[idx - 1].id] ||
                      submissionMap[rawMilestones[idx - 1].id].status !== 'APPROVED'
                    );
                    const countdown = this.calculateCountdown(m.deadline);
                    return {
                      ...m,
                      deliverablesList: deliverables,
                      isLocked: locked,
                      userSubmission: submission,
                      daysRemainingText: countdown.text,
                      isDueSoon: countdown.isDueSoon
                    };
                  });

                  this.studentSubjectRows = [{ subject: activeSubject, milestones: uiMilestones }];
                  this.heroMilestone = null;
                  this.heroSubject = null;
                  this.loading = false;
                  this.cdr.detectChanges();
                },
                error: (err) => {
                  console.error(err);
                  this.loading = false;
                  this.cdr.detectChanges();
                }
              });
          },
          error: (err) => {
            console.error(err);
            this.loading = false;
            this.cdr.detectChanges();
          }
        });
    } else {
      this.loading = true;
      forkJoin({
        subjects: this.apiService.getSubjectsForStudent(studentId),
        submissions: this.apiService.getSubmissionsByStudent(studentId)
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ({ subjects, submissions }) => {
          const submissionMap: any = {};
          submissions.forEach(sub => {
            submissionMap[sub.milestoneId] = sub;
          });

          if (subjects.length === 0) {
            this.studentSubjectRows = [];
            this.heroMilestone = null;
            this.heroSubject = null;
            this.loading = false;
            this.cdr.detectChanges();
            return;
          }

          const requests = subjects.map(subject =>
            this.apiService.getMilestonesBySubject(subject.id)
          );

          forkJoin(requests)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (allMilestones) => {
              let nearest: any = null;

              this.studentSubjectRows = subjects.map((subject, index) => {
                const raw = allMilestones[index] || [];
                const milestones = raw.map((m: any, i: number) => {
                  const deliverables = this.parseDeliverables(m.requiredDeliverables);
                  const submission = submissionMap[m.id];
                  const locked = i > 0 && (
                    !submissionMap[raw[i - 1].id] ||
                    submissionMap[raw[i - 1].id].status !== 'APPROVED'
                  );
                  const countdown = this.calculateCountdown(m.deadline);
                  const item: MilestoneUI = {
                    ...m,
                    deliverablesList: deliverables,
                    isLocked: locked,
                    userSubmission: submission,
                    daysRemainingText: countdown.text,
                    isDueSoon: countdown.isDueSoon
                  };

                  if (!locked && submission?.status !== 'APPROVED') {
                    const due = new Date(m.deadline).getTime();
                    if (!nearest || due < nearest.due) {
                      nearest = { item, subject, due };
                    }
                  }

                  return item;
                });

                return { subject, milestones };
              });

              if (nearest) {
                this.heroMilestone = nearest.item;
                this.heroSubject = nearest.subject;
              } else if (this.studentSubjectRows.length > 0 && this.studentSubjectRows[0].milestones.length > 0) {
                this.heroMilestone = this.studentSubjectRows[0].milestones[0];
                this.heroSubject = this.studentSubjectRows[0].subject;
              } else {
                this.heroMilestone = null;
                this.heroSubject = null;
              }

              this.loading = false;
              this.cdr.detectChanges();
            },
            error: (err) => {
              console.error(err);
              this.loading = false;
              this.cdr.detectChanges();
            }
          });
        },
        error: (err) => {
          console.error(err);
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
    }
  }





  loadTeacherClasswork(){


    const subject =
      this.viewStateService.currentSubject();



    if(!subject)
      return;



    this.apiService

    .getMilestonesBySubject(subject.id)

    .pipe(takeUntil(this.destroy$))


    .subscribe({

      next:milestones=>{


        this.teacherMilestones =
        milestones.map((m:any)=>{


          const countdown =
          this.calculateCountdown(
            m.deadline
          );



          return {


            ...m,


            deliverablesList:
              this.parseDeliverables(
                m.requiredDeliverables
              ),


            isLocked:false,


            daysRemainingText:
              countdown.text,


            isDueSoon:
              countdown.isDueSoon



          } as MilestoneUI;



        });






        this.loading=false;

        this.cdr.detectChanges();


      },


      error:err=>{

        console.error(err);

        this.loading=false;

      }


    });


  }





  parseDeliverables(value:string|undefined)
  :DeliverableItem[]{


    if(!value)
      return [];



    try{

      const parsed =
        JSON.parse(value);


      if(Array.isArray(parsed))
        return parsed;


    }

    catch{}



    return [

      {

        title:value,

        isMandatory:true

      }

    ];

  }





  calculateCountdown(deadline:string){


    if(!deadline)

      return {

        text:'No deadline',

        isDueSoon:false

      };



    const diff =
      new Date(deadline)
      .getTime()
      -
      new Date().getTime();



    if(diff<=0)

      return {

        text:'Overdue',

        isDueSoon:true

      };



    const days =
      Math.floor(
        diff/
        (1000*60*60*24)
      );



    const hours =
      Math.floor(
        diff/
        (1000*60*60)
      );



    return {

      text:
      days>0
      ?
      `${days}d ${hours%24}h remaining`
      :
      `${hours}h remaining`,


      isDueSoon:
      days<=2

    };


  }





  toggleExpand(id: number) {
    this.expandedMilestoneId =
      this.expandedMilestoneId === id
        ? null
        : id;
    this.cdr.detectChanges();
  }





  triggerCreateMilestone(){

    this.openCreateMilestoneModal.emit();

  }



  triggerEditMilestone(m:Milestone){

    this.openEditMilestoneModal.emit(m);

  }




  triggerUpload(m:Milestone){

    this.openUploadModal.emit(m);

  }



  triggerRoster(m:Milestone){

    this.openRosterModal.emit(m);

  }




  deleteMilestone(m:Milestone){


    if(!confirm(`Delete "${m.title}"?`))
      return;



    this.apiService
    .deleteMilestone(m.id)
    .subscribe(()=>{

      this.loadTeacherClasswork();

    });


  }





  downloadMarksCsv(): void {
    const subject = this.viewStateService.currentSubject();
    if (!subject) return;

    this.apiService.exportSubjectMarksCsv(subject.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${subject.code || 'class'}-marks.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Failed to download marks CSV:', err);
        alert('Failed to download marks CSV. Please try again.');
      }
    });
  }


  refresh(){

    const user =
      this.authService.currentUser();



    if(user?.role==='STUDENT')

      this.loadStudentNetflixView(user.id);

    else

      this.loadTeacherClasswork();


  }




  ngOnDestroy(){

    this.destroy$.next();

    this.destroy$.complete();

  }


}