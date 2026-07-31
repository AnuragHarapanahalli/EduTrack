import { Component, OnInit, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin, of } from 'rxjs';
import { ApiService } from '../../../services/api.service';
import { AuthService } from '../../../services/auth.service';
import { ViewStateService } from '../../../services/view-state.service';
import { Milestone, DeliverableItem } from '../../../models/milestone.model';
import { Submission } from '../../../models/submission.model';

export interface MilestoneUI extends Milestone {
  deliverablesList: DeliverableItem[];
  isLocked: boolean;
  userSubmission?: Submission;
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
  @Output() openUploadModal = new EventEmitter<Milestone>();
  @Output() openRosterModal = new EventEmitter<Milestone>();

  milestones: MilestoneUI[] = [];
  expandedMilestoneId: number | null = null;

  constructor(
    private apiService: ApiService,
    public authService: AuthService,
    public viewStateService: ViewStateService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadClasswork();
  }

  loadClasswork() {
    const currentSubject = this.viewStateService.currentSubject();
    if (!currentSubject) return;

    const user = this.authService.currentUser();
    const milestones$ = this.apiService.getMilestonesBySubject(currentSubject.id);
    const submissions$ = (user && user.role === 'STUDENT')
      ? this.apiService.getSubmissionsByStudent(user.id)
      : of([]);

    forkJoin({ ms: milestones$, subs: submissions$ }).subscribe({
      next: ({ ms, subs }) => {
        const map: { [id: number]: Submission } = {};
        subs.forEach(s => map[s.milestoneId] = s);

        this.milestones = ms.map((m, idx) => {
          let deliverablesList: DeliverableItem[] = [];
          if (m.requiredDeliverables) {
            try {
              const parsed = JSON.parse(m.requiredDeliverables);
              if (Array.isArray(parsed)) deliverablesList = parsed;
            } catch (e) {
              deliverablesList = [{ title: m.requiredDeliverables, isMandatory: true }];
            }
          }

          let isLocked = false;
          if (user && user.role === 'STUDENT' && idx > 0) {
            const prevMilestone = ms[idx - 1];
            const prevSub = map[prevMilestone.id];
            isLocked = (!prevSub || prevSub.status !== 'APPROVED');
          }

          return { ...m, deliverablesList, isLocked, userSubmission: map[m.id] };
        });

        if (this.milestones.length > 0 && !this.expandedMilestoneId) {
          this.expandedMilestoneId = this.milestones[0].id;
        }
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error loading classwork:', err);
        this.cdr.markForCheck();
      }
    });
  }

  toggleExpand(id: number) {
    this.expandedMilestoneId = (this.expandedMilestoneId === id) ? null : id;
    this.cdr.markForCheck();
  }

  triggerCreateMilestone() {
    this.openCreateMilestoneModal.emit();
  }

  triggerUpload(m: Milestone) {
    this.openUploadModal.emit(m);
  }

  triggerRoster(m: Milestone) {
    this.openRosterModal.emit(m);
  }
}
