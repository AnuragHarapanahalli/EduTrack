import { Component, Input, Output, EventEmitter, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Milestone } from '../../models/milestone.model';
import { MilestoneRosterEntry, SubmissionStatus } from '../../models/submission.model';

@Component({
  selector: 'app-review-roster-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="gc-modal-backdrop" (click)="close()">
      <div class="gc-modal-card" style="max-width: 1050px; width: 95%;" (click)="$event.stopPropagation()">
        <div class="gc-modal-header">
          <h3>Student Submissions Roster - {{ milestone?.title }}</h3>
          <button type="button" class="gc-close-btn" (click)="close()">&times;</button>
        </div>
        <div class="gc-modal-body" style="max-height: 75vh; overflow-y: auto;">

          <div *ngIf="activeGradingEntry" class="gc-grading-form-card">
            <h4>Grading Work for: {{ activeGradingEntry.studentName }}</h4>
            
            <div style="margin-bottom: 1.25rem; padding: 1rem; background: var(--gc-card-sub, #f8fafc); border: 1px solid var(--gc-border); border-radius: var(--gc-radius-md);">
              <h5 style="margin: 0 0 6px 0; font-size: 0.8rem; font-weight: 700; color: var(--gc-text-sub);">SUBMISSION DETAILS</h5>
              <div style="font-size: 0.85rem; margin-bottom: 8px; display: flex; gap: 8px;">
                <span *ngIf="activeGradingEntry.fileUrl">
                  <a [href]="'http://localhost:8080' + activeGradingEntry.fileUrl" target="_blank" class="gc-btn gc-btn-outline" style="padding: 0.2rem 0.5rem; font-size: 0.75rem;">
                    <i class="fa-solid fa-download"></i> File
                  </a>
                </span>
                <span *ngIf="activeGradingEntry.submissionLink">
                  <a [href]="activeGradingEntry.submissionLink" target="_blank" class="gc-btn gc-btn-outline" style="padding: 0.2rem 0.5rem; font-size: 0.75rem;">
                    <i class="fa-solid fa-link"></i> Link
                  </a>
                </span>
              </div>
              <div *ngIf="activeGradingEntry.comments" style="padding: 8px 12px; background: var(--gc-card); border-left: 3px solid var(--gc-info, #0EA5E9); border-radius: 6px; font-size: 0.85rem; margin-top: 8px;">
                <span style="font-weight: 600; color: var(--gc-text-sub); display: block; font-size: 0.72rem; text-transform: uppercase; margin-bottom: 2px;">Student Note:</span>
                <p style="margin: 0; color: var(--gc-text-main);">"{{ activeGradingEntry.comments }}"</p>
              </div>
              <div *ngIf="!activeGradingEntry.comments" style="font-size: 0.82rem; color: var(--gc-text-light); font-style: italic; margin-top: 4px;">
                No private comments provided by student.
              </div>
            </div>

            <form (ngSubmit)="submitGrade()">
              <div class="gc-form-field">
                <label>Evaluation Status</label>
                <select [(ngModel)]="gradeStatus" name="gradeStatus" (change)="onStatusChange()" required>
                  <option value="APPROVED">APPROVED (Earns Points & Unlocks Next Step)</option>
                  <option value="NEEDS_REVISION">NEEDS REVISION (0 Points until revised)</option>
                </select>
              </div>
              <div class="gc-form-field">
                <label>Quality Rating (1 to 5 Stars)</label>
                <select [(ngModel)]="gradeQuality" name="gradeQuality" [disabled]="gradeStatus === 'NEEDS_REVISION'" required>
                  <option *ngIf="gradeStatus === 'NEEDS_REVISION'" [ngValue]="null">Not Applicable</option>
                  <option [ngValue]="5">⭐⭐⭐⭐⭐ 5/5 - Exceptional</option>
                  <option [ngValue]="4">⭐⭐⭐⭐ 4/5 - Good Quality</option>
                  <option [ngValue]="3">⭐⭐⭐ 3/5 - Average</option>
                  <option [ngValue]="2">⭐⭐ 2/5 - Needs Improvement</option>
                  <option [ngValue]="1">⭐ 1/5 - Poor</option>
                </select>
              </div>
              <div class="gc-form-field">
                <label>Private feedback for student</label>
                <textarea [(ngModel)]="gradeFeedback" name="gradeFeedback" rows="2" placeholder="Constructive feedback..."></textarea>
              </div>
              <div style="display: flex; gap: 0.5rem; justify-content: flex-end;">
                <button type="button" class="gc-btn gc-btn-flat" (click)="cancelGrading()">Cancel</button>
                <button type="submit" class="gc-btn gc-btn-primary">Return Grade</button>
              </div>
            </form>
          </div>

          <div *ngIf="!activeGradingEntry" class="gc-table-responsive">
            <table class="gc-data-table">
              <thead>
                <tr>
                  <th>Student Details</th>
                  <th>Status</th>
                  <th>Submitted At</th>
                  <th>Timeliness</th>
                  <th>Work Links</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let item of rosterList">
                  <td style="max-width: 320px;">
                    <strong>{{ item.studentName }}</strong>
                    <small style="display:block; color:var(--gc-text-sub); margin-bottom: 6px;">{{ item.studentEmail }}</small>
                    
                    <div *ngIf="item.comments" style="margin-top: 6px; padding: 6px 10px; background: var(--gc-card-sub); border-radius: 6px; font-size: 0.8rem; border-left: 3px solid var(--gc-info, #0ea5e9); line-height: 1.3;">
                      <span style="font-weight: 600; color: var(--gc-text-sub); display: block; font-size: 0.72rem; text-transform: uppercase; margin-bottom: 2px;">Student Note:</span>
                      <p style="margin: 0; color: var(--gc-text-main);">"{{ item.comments }}"</p>
                    </div>

                    <div *ngIf="item.instructorFeedback" style="margin-top: 6px; padding: 6px 10px; background: rgba(16, 185, 129, 0.05); border-radius: 6px; font-size: 0.8rem; border-left: 3px solid var(--gc-success, #10b981); line-height: 1.3;">
                      <span style="font-weight: 600; color: var(--gc-success, #10b981); display: block; font-size: 0.72rem; text-transform: uppercase; margin-bottom: 2px;">Teacher Feedback:</span>
                      <p style="margin: 0; color: var(--gc-text-main);">"{{ item.instructorFeedback }}"</p>
                    </div>
                  </td>
                  <td>
                    <span class="gc-badge" 
                          [class.gc-badge-success]="item.status === 'APPROVED'" 
                          [class.gc-badge-warning]="item.status === 'SUBMITTED'"
                          [class.gc-badge-orange]="item.status === 'NEEDS_REVISION'"
                          [class.gc-badge-danger]="item.status === 'OVERDUE'">
                      {{ item.status === 'NEEDS_REVISION' ? 'Needs Revision' : item.status }}
                    </span>
                  </td>
                  <td>{{ item.submittedAt ? (item.submittedAt | date:'short') : '&mdash;' }}</td>
                  <td><span class="gc-badge gc-badge-info">{{ item.timelinessLabel }}</span></td>
                  <td>
                    <div style="display: flex; flex-direction: column; gap: 4px;">
                      <a *ngIf="item.fileUrl" [href]="'http://localhost:8080' + item.fileUrl" target="_blank" class="gc-btn gc-btn-outline" style="padding:0.2rem 0.5rem; font-size:0.75rem; text-align: center;">
                        <i class="fa-solid fa-download"></i> File
                      </a>
                      <a *ngIf="item.submissionLink" [href]="item.submissionLink" target="_blank" class="gc-btn gc-btn-outline" style="padding:0.2rem 0.5rem; font-size:0.75rem; text-align: center;">
                        <i class="fa-solid fa-link"></i> Link
                      </a>
                    </div>
                  </td>
                  <td>
                    <button *ngIf="item.submissionId" type="button" class="gc-btn gc-btn-primary" style="padding:0.25rem 0.6rem; font-size:0.78rem;" (click)="startGrading(item)">
                      {{ item.status === 'APPROVED' || item.status === 'NEEDS_REVISION' ? 'Re-Grade' : 'Grade' }}
                    </button>
                    <span *ngIf="!item.submissionId" style="font-size:0.78rem; color:var(--gc-text-light);">No work</span>
                  </td>
                </tr>
                <tr *ngIf="rosterList.length === 0">
                  <td colspan="6" style="text-align:center; padding:2rem;">No students found in roster.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .gc-grading-form-card { background: var(--gc-background); border: 1px solid var(--gc-border); border-radius: var(--gc-radius-md); padding: 1.25rem; }
    .gc-grading-form-card h4 { font-size: 1rem; font-weight: 500; margin-bottom: 1rem; }
  `]
})
export class ReviewRosterModalComponent implements OnInit {
  @Input() milestone!: Milestone;
  @Output() closeModal = new EventEmitter<void>();
  @Output() gradeReturned = new EventEmitter<void>();

  rosterList: MilestoneRosterEntry[] = [];
  activeGradingEntry: MilestoneRosterEntry | null = null;
  gradeStatus: SubmissionStatus = 'APPROVED';
  gradeQuality: number | null = 5;
  gradeFeedback = '';

  constructor(
    private apiService: ApiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadRoster();
  }

  loadRoster() {
    if (!this.milestone) return;
    this.apiService.getMilestoneRoster(this.milestone.id).subscribe({
      next: (list) => {
        this.rosterList = list;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading roster:', err);
        this.cdr.detectChanges();
      }
    });
  }

  close() {
    this.closeModal.emit();
    this.cdr.detectChanges();
  }

  startGrading(item: MilestoneRosterEntry) {
    this.activeGradingEntry = item;
    this.gradeStatus = item.status === 'NEEDS_REVISION' ? 'NEEDS_REVISION' : 'APPROVED';
    this.gradeQuality = this.gradeStatus === 'NEEDS_REVISION' ? null : (item.qualityRating || 5);
    this.gradeFeedback = item.instructorFeedback || '';
    this.cdr.detectChanges();
  }

  cancelGrading() {
    this.activeGradingEntry = null;
    this.cdr.detectChanges();
  }

  onStatusChange() {
    if (this.gradeStatus === 'NEEDS_REVISION') {
      this.gradeQuality = null;
    } else {
      this.gradeQuality = 5;
    }
  }

  submitGrade() {
    if (!this.activeGradingEntry || !this.activeGradingEntry.submissionId) return;

    this.apiService.reviewSubmission(this.activeGradingEntry.submissionId, {
      status: this.gradeStatus,
      qualityRating: this.gradeQuality as any,
      feedback: this.gradeFeedback
    }).subscribe({
      next: () => {
        this.activeGradingEntry = null;
        this.loadRoster();
        this.gradeReturned.emit();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error submitting grade:', err);
        this.cdr.detectChanges();
      }
    });
  }
}
