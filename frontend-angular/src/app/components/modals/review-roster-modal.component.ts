import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
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
      <div class="gc-modal-card" style="max-width: 800px;" (click)="$event.stopPropagation()">
        <div class="gc-modal-header">
          <h3>Student Submissions Roster - {{ milestone?.title }}</h3>
          <button class="gc-close-btn" (click)="close()">&times;</button>
        </div>
        <div class="gc-modal-body" style="max-height: 75vh; overflow-y: auto;">

          @if (activeGradingEntry) {
            <div class="gc-grading-form-card">
              <h4>Grading Work for: {{ activeGradingEntry.studentName }}</h4>
              <form (submit)="submitGrade()">
                <div class="gc-form-field">
                  <label>Evaluation Status</label>
                  <select [(ngModel)]="gradeStatus" name="gradeStatus" required>
                    <option value="APPROVED">APPROVED (Earns Points & Unlocks Next Step)</option>
                    <option value="NEEDS_REVISION">NEEDS REVISION (0 Points until revised)</option>
                  </select>
                </div>
                <div class="gc-form-field">
                  <label>Quality Rating (1 to 5 Stars)</label>
                  <select [(ngModel)]="gradeQuality" name="gradeQuality" required>
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
                  <button type="button" class="gc-btn gc-btn-flat" (click)="activeGradingEntry = null">Cancel</button>
                  <button type="submit" class="gc-btn gc-btn-primary">Return Grade</button>
                </div>
              </form>
            </div>
          } @else {
            <div class="gc-table-responsive">
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
                  @for (item of rosterList; track item.studentId) {
                    <tr>
                      <td>
                        <strong>{{ item.studentName }}</strong>
                        <small style="display:block; color:var(--gc-text-sub);">{{ item.studentEmail }}</small>
                      </td>
                      <td>
                        <span class="gc-badge" 
                              [class.gc-badge-success]="item.status === 'APPROVED'" 
                              [class.gc-badge-warning]="item.status === 'SUBMITTED'"
                              [class.gc-badge-danger]="item.status === 'NEEDS_REVISION' || item.status === 'OVERDUE'">
                          {{ item.status }}
                        </span>
                      </td>
                      <td>{{ item.submittedAt ? (item.submittedAt | date:'short') : '&mdash;' }}</td>
                      <td><span class="gc-badge gc-badge-info">{{ item.timelinessLabel }}</span></td>
                      <td>
                        @if (item.fileUrl) {
                          <a [href]="'http://localhost:8080' + item.fileUrl" target="_blank" class="gc-btn gc-btn-outline" style="padding:0.2rem 0.5rem; font-size:0.75rem;">
                            <i class="fa-solid fa-download"></i> File
                          </a>
                        }
                        @if (item.submissionLink) {
                          <a [href]="item.submissionLink" target="_blank" class="gc-btn gc-btn-outline" style="padding:0.2rem 0.5rem; font-size:0.75rem;">
                            <i class="fa-solid fa-link"></i> Link
                          </a>
                        }
                      </td>
                      <td>
                        @if (item.submissionId) {
                          <button class="gc-btn gc-btn-primary" style="padding:0.25rem 0.6rem; font-size:0.78rem;" (click)="startGrading(item)">
                            Grade
                          </button>
                        } @else {
                          <span style="font-size:0.78rem; color:var(--gc-text-light);">No work</span>
                        }
                      </td>
                    </tr>
                  } @empty {
                    <tr><td colspan="6" style="text-align:center; padding:2rem;">No students found in roster.</td></tr>
                  }
                </tbody>
              </table>
            </div>
          }
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
  gradeQuality = 5;
  gradeFeedback = '';

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadRoster();
  }

  loadRoster() {
    if (!this.milestone) return;
    this.apiService.getMilestoneRoster(this.milestone.id).subscribe({
      next: (list) => {
        this.rosterList = list;
      }
    });
  }

  close() {
    this.closeModal.emit();
  }

  startGrading(item: MilestoneRosterEntry) {
    this.activeGradingEntry = item;
    this.gradeStatus = item.status === 'NEEDS_REVISION' ? 'NEEDS_REVISION' : 'APPROVED';
    this.gradeQuality = item.qualityRating || 5;
    this.gradeFeedback = item.instructorFeedback || '';
  }

  submitGrade() {
    if (!this.activeGradingEntry || !this.activeGradingEntry.submissionId) return;

    this.apiService.reviewSubmission(this.activeGradingEntry.submissionId, {
      status: this.gradeStatus,
      qualityRating: this.gradeQuality,
      feedback: this.gradeFeedback
    }).subscribe({
      next: () => {
        this.activeGradingEntry = null;
        this.loadRoster();
        this.gradeReturned.emit();
      }
    });
  }
}
