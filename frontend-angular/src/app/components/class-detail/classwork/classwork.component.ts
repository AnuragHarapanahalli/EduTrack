import { Component, OnInit, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin, of } from 'rxjs';
import { ApiService } from '../../../services/api.service';
import { AuthService } from '../../../services/auth.service';
import { ViewStateService } from '../../../services/view-state.service';
import { Milestone, DeliverableItem } from '../../../models/milestone.model';
import { Submission } from '../../../models/submission.model';
import { Subject as SubjectModel } from '../../../models/subject.model';

export interface MilestoneUI extends Milestone {
  deliverablesList: DeliverableItem[];
  isLocked: boolean;
  userSubmission?: Submission;
  daysRemainingText?: string;
  isDueSoon?: boolean;
}

export interface StudentSubjectRow {
  subject: SubjectModel;
  milestones: MilestoneUI[];
}

@Component({
  selector: 'app-classwork',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './classwork.component.html',
  styleUrl: './classwork.component.css'
})
export class ClassworkComponent implements OnInit {
  @Output() openCreateMilestoneModal = new EventEmitter<void>();
  @Output() openEditMilestoneModal = new EventEmitter<Milestone>();
  @Output() openUploadModal = new EventEmitter<Milestone>();
  @Output() openRosterModal = new EventEmitter<Milestone>();

  // Teacher View Data
  teacherMilestones: MilestoneUI[] = [];
  expandedMilestoneId: number | null = null;

  // Student Netflix View Data
  studentSubjectRows: StudentSubjectRow[] = [];
  heroMilestone: MilestoneUI | null = null;
  heroSubject: SubjectModel | null = null;

  constructor(
    private apiService: ApiService,
    public authService: AuthService,
    public viewStateService: ViewStateService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const user = this.authService.currentUser();
    if (user && user.role === 'STUDENT') {
      this.loadStudentNetflixView(user.id);
    } else {
      this.loadTeacherClasswork();
    }
  }

  loadStudentNetflixView(studentId: number) {
    forkJoin({
      subjects: this.apiService.getSubjectsForStudent(studentId),
      submissions: this.apiService.getSubmissionsByStudent(studentId)
    }).subscribe({
      next: ({ subjects, submissions }) => {
        const subMap: { [id: number]: Submission } = {};
        submissions.forEach(s => subMap[s.milestoneId] = s);

        if (subjects.length === 0) {
          this.studentSubjectRows = [];
          this.cdr.markForCheck();
          return;
        }

        const milestoneStreams = subjects.map(s => this.apiService.getMilestonesBySubject(s.id));

        forkJoin(milestoneStreams).subscribe({
          next: (allSubjectMilestones) => {
            let nearestUpcoming: { m: MilestoneUI, s: SubjectModel, diff: number } | null = null;

            this.studentSubjectRows = subjects.map((subj, sIdx) => {
              const rawMilestones = allSubjectMilestones[sIdx] || [];

              const uiMilestones: MilestoneUI[] = rawMilestones.map((m, idx) => {
                let deliverablesList: DeliverableItem[] = [];
                if (m.requiredDeliverables) {
                  try {
                    const parsed = JSON.parse(m.requiredDeliverables);
                    if (Array.isArray(parsed)) deliverablesList = parsed;
                  } catch (e) {
                    deliverablesList = [{ title: m.requiredDeliverables, isMandatory: true }];
                  }
                }

                const userSub = subMap[m.id];
                let isLocked = false;
                if (idx > 0) {
                  const prevM = rawMilestones[idx - 1];
                  const prevSub = subMap[prevM.id];
                  isLocked = (!prevSub || prevSub.status !== 'APPROVED');
                }

                const countdown = this.calculateCountdown(m.deadline);
                const item: MilestoneUI = {
                  ...m,
                  deliverablesList,
                  isLocked,
                  userSubmission: userSub,
                  daysRemainingText: countdown.text,
                  isDueSoon: countdown.isDueSoon
                };

                if (!isLocked && userSub?.status !== 'APPROVED') {
                  const dueTime = new Date(m.deadline).getTime();
                  if (!nearestUpcoming || dueTime < nearestUpcoming.diff) {
                    nearestUpcoming = { m: item, s: subj, diff: dueTime };
                  }
                }

                return item;
              });

              return { subject: subj, milestones: uiMilestones };
            });

            if (nearestUpcoming) {
              this.heroMilestone = (nearestUpcoming as any).m;
              this.heroSubject = (nearestUpcoming as any).s;
            } else if (this.studentSubjectRows.length > 0 && this.studentSubjectRows[0].milestones.length > 0) {
              this.heroMilestone = this.studentSubjectRows[0].milestones[0];
              this.heroSubject = this.studentSubjectRows[0].subject;
            }

            this.cdr.markForCheck();
          }
        });
      }
    });
  }

  loadTeacherClasswork() {
    const currentSubject = this.viewStateService.currentSubject();
    if (!currentSubject) return;

    this.apiService.getMilestonesBySubject(currentSubject.id).subscribe({
      next: (ms) => {
        this.teacherMilestones = ms.map((m) => {
          let deliverablesList: DeliverableItem[] = [];
          if (m.requiredDeliverables) {
            try {
              const parsed = JSON.parse(m.requiredDeliverables);
              if (Array.isArray(parsed)) deliverablesList = parsed;
            } catch (e) {
              deliverablesList = [{ title: m.requiredDeliverables, isMandatory: true }];
            }
          }
          return { ...m, deliverablesList, isLocked: false };
        });

        if (this.teacherMilestones.length > 0 && !this.expandedMilestoneId) {
          this.expandedMilestoneId = this.teacherMilestones[0].id;
        }
        this.cdr.markForCheck();
      }
    });
  }

  calculateCountdown(deadlineStr: string): { text: string, isDueSoon: boolean } {
    if (!deadlineStr) return { text: 'No deadline', isDueSoon: false };
    const due = new Date(deadlineStr).getTime();
    const now = new Date().getTime();
    const diff = due - now;

    if (diff <= 0) return { text: 'Overdue', isDueSoon: true };

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) {
      return { text: `${days}d ${hours}h remaining`, isDueSoon: days <= 2 };
    }
    return { text: `${hours}h remaining`, isDueSoon: true };
  }

  toggleExpand(id: number) {
    this.expandedMilestoneId = (this.expandedMilestoneId === id) ? null : id;
    this.cdr.markForCheck();
  }

  triggerCreateMilestone() {
    this.openCreateMilestoneModal.emit();
  }

  triggerEditMilestone(m: Milestone) {
    this.openEditMilestoneModal.emit(m);
  }

  deleteMilestone(m: Milestone) {
    if (confirm(`Are you sure you want to delete "${m.title}"? This will also remove any student submissions for this milestone.`)) {
      this.apiService.deleteMilestone(m.id).subscribe({
        next: () => {
          this.loadTeacherClasswork();
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('Error deleting milestone:', err);
          this.cdr.markForCheck();
        }
      });
    }
  }

  triggerUpload(m: Milestone) {
    this.openUploadModal.emit(m);
  }

  triggerRoster(m: Milestone) {
    this.openRosterModal.emit(m);
  }
}
