import { Component, OnInit, Output, EventEmitter, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../services/api.service';
import { AuthService } from '../../../services/auth.service';
import { ViewStateService } from '../../../services/view-state.service';
import { Milestone, DeliverableItem } from '../../../models/milestone.model';
import { Submission } from '../../../models/submission.model';

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

  milestones: Milestone[] = [];
  submissionsMap: { [milestoneId: number]: Submission } = {};
  expandedMilestoneId: number | null = null;

  constructor(
    private apiService: ApiService,
    public authService: AuthService,
    public viewStateService: ViewStateService
  ) {
    effect(() => {
      const currentSubject = this.viewStateService.currentSubject();
      if (currentSubject) {
        this.loadClasswork();
      }
    });
  }

  ngOnInit() {
    this.loadClasswork();
  }

  loadClasswork() {
    const currentSubject = this.viewStateService.currentSubject();
    if (!currentSubject) return;

    this.apiService.getMilestonesBySubject(currentSubject.id).subscribe({
      next: (ms) => {
        this.milestones = ms.map(m => {
          let deliverablesList: DeliverableItem[] = [];
          if (m.requiredDeliverables) {
            try {
              const parsed = JSON.parse(m.requiredDeliverables);
              if (Array.isArray(parsed)) deliverablesList = parsed;
            } catch (e) {
              deliverablesList = [{ title: m.requiredDeliverables, isMandatory: true }];
            }
          }
          return { ...m, deliverablesList };
        });

        if (this.milestones.length > 0 && !this.expandedMilestoneId) {
          this.expandedMilestoneId = this.milestones[0].id;
        }
      }
    });

    const user = this.authService.currentUser();
    if (user && user.role === 'STUDENT') {
      this.apiService.getSubmissionsByStudent(user.id).subscribe({
        next: (subs) => {
          this.submissionsMap = {};
          subs.forEach(s => this.submissionsMap[s.milestoneId] = s);
        }
      });
    }
  }

  toggleExpand(id: number) {
    this.expandedMilestoneId = (this.expandedMilestoneId === id) ? null : id;
  }

  isMilestoneLocked(index: number): boolean {
    const user = this.authService.currentUser();
    if (!user || user.role !== 'STUDENT') return false;
    if (index === 0) return false;

    const prevMilestone = this.milestones[index - 1];
    const prevSub = this.submissionsMap[prevMilestone.id];
    return (!prevSub || prevSub.status !== 'APPROVED');
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
