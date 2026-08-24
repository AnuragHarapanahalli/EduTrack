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
      <div
        class="gc-modal-card"
        style="max-width: 1050px; width: 95%;"
        (click)="$event.stopPropagation()"
      >

        <!-- HEADER -->
        <div class="gc-modal-header">
          <h3>
            Student Submissions Roster - {{ milestone?.title }}
          </h3>

          <button
            type="button"
            class="gc-close-btn"
            (click)="close()"
          >
            &times;
          </button>
        </div>

        <div
          class="gc-modal-body"
          style="max-height: 75vh; overflow-y: auto;"
        >

          <!-- ========================= -->
          <!-- GRADING VIEW -->
          <!-- ========================= -->
          <div
            *ngIf="activeGradingEntry"
            class="gc-grading-form-card"
          >

            <h4>
              Grading Work for: {{ activeGradingEntry.studentName }}
            </h4>

            <!-- 1. SUBMISSION DETAILS -->
            <div
              style="
                margin-bottom: 1.25rem;
                padding: 1rem;
                background: var(--gc-card-sub, #f8fafc);
                border: 1px solid var(--gc-border);
                border-radius: var(--gc-radius-md);
              "
            >

              <h5
                style="
                  margin: 0 0 10px 0;
                  font-size: 0.8rem;
                  font-weight: 700;
                  color: var(--gc-text-sub);
                "
              >
                SUBMISSION DETAILS
              </h5>

              <div
                style="
                  font-size: 0.85rem;
                  margin-bottom: 10px;
                  display: flex;
                  gap: 8px;
                  flex-wrap: wrap;
                "
              >

                <a
                  *ngIf="activeGradingEntry.fileUrl"
                  [href]="serverHost + activeGradingEntry.fileUrl"
                  target="_blank"
                  class="gc-btn gc-btn-outline"
                  style="
                    padding: 0.2rem 0.5rem;
                    font-size: 0.75rem;
                  "
                >
                  <i class="fa-solid fa-download"></i>
                  File
                </a>

                <a
                  *ngIf="activeGradingEntry.submissionLink"
                  [href]="activeGradingEntry.submissionLink"
                  target="_blank"
                  class="gc-btn gc-btn-outline"
                  style="
                    padding: 0.2rem 0.5rem;
                    font-size: 0.75rem;
                  "
                >
                  <i class="fa-solid fa-link"></i>
                  Link
                </a>

              </div>

              <!-- STUDENT NOTE -->
              <div
                *ngIf="activeGradingEntry.comments"
                style="
                  padding: 8px 12px;
                  background: var(--gc-card);
                  border-left: 3px solid var(--gc-info, #0EA5E9);
                  border-radius: 6px;
                  font-size: 0.85rem;
                  margin-top: 8px;
                "
              >

                <span
                  style="
                    font-weight: 600;
                    color: var(--gc-text-sub);
                    display: block;
                    font-size: 0.72rem;
                    text-transform: uppercase;
                    margin-bottom: 2px;
                  "
                >
                  Student Note:
                </span>

                <p
                  style="
                    margin: 0;
                    color: var(--gc-text-main);
                  "
                >
                  "{{ activeGradingEntry.comments }}"
                </p>

              </div>

              <div
                *ngIf="!activeGradingEntry.comments"
                style="
                  font-size: 0.82rem;
                  color: var(--gc-text-light);
                  font-style: italic;
                  margin-top: 4px;
                "
              >
                No private comments provided by student.
              </div>

              <!-- TEACHER FEEDBACK -->
              <div
                *ngIf="activeGradingEntry.instructorFeedback"
                style="
                  padding: 8px 12px;
                  background: rgba(16, 185, 129, 0.05);
                  border-left: 3px solid var(--gc-success, #10b981);
                  border-radius: 6px;
                  font-size: 0.85rem;
                  margin-top: 10px;
                "
              >

                <span
                  style="
                    font-weight: 600;
                    color: var(--gc-success, #10b981);
                    display: block;
                    font-size: 0.72rem;
                    text-transform: uppercase;
                    margin-bottom: 2px;
                  "
                >
                  Teacher Feedback:
                </span>

                <p
                  style="
                    margin: 0;
                    color: var(--gc-text-main);
                  "
                >
                  "{{ activeGradingEntry.instructorFeedback }}"
                </p>

              </div>

            </div>

            <!-- ========================= -->
            <!-- GRADING FORM -->
            <!-- ========================= -->
            <form (ngSubmit)="submitGrade()">

              <!-- 2. EVALUATION STATUS -->
              <div class="gc-form-field">

                <label>
                  Evaluation Status
                </label>

                <select
                  [(ngModel)]="gradeStatus"
                  name="gradeStatus"
                  (change)="onStatusChange()"
                  required
                >

                  <option value="APPROVED">
                    APPROVED (Earns Points & Unlocks Next Step)
                  </option>

                  <option value="NEEDS_REVISION">
                    NEEDS REVISION (0 Points until revised)
                  </option>

                </select>

              </div>

              <!-- 3. OBTAINED MARKS -->
              <div
                class="gc-form-field"
                *ngIf="gradeStatus === 'APPROVED'"
              >

                <label>
                  Obtained Marks
                  (out of {{ milestone?.maxMarks || 100 }})
                </label>

                <div
                  style="
                    display: flex;
                    align-items: center;
                    gap: 8px;
                  "
                >

                  <input
                    type="number"
                    [(ngModel)]="obtainedMarks"
                    name="obtainedMarks"
                    min="0"
                    [max]="milestone?.maxMarks || 100"
                    step="0.5"
                    required
                    style="
                      width: 100px;
                      padding: 6px 12px;
                      border-radius: 8px;
                      border: 1px solid var(--gc-border);
                      background: var(--gc-background);
                      color: var(--gc-text-main);
                    "
                  />

                  <span
                    style="
                      font-size: 0.85rem;
                      color: var(--gc-text-sub);
                    "
                  >
                    / {{ milestone?.maxMarks || 100 }}
                  </span>

                </div>

              </div>

              <!-- 4. QUALITY RATING -->
              <div
                class="gc-form-field"
                *ngIf="
                  gradeStatus === 'APPROVED' &&
                  obtainedMarks == null
                "
              >

                <label>
                  Or Quality Rating (1 to 5 Stars)
                </label>

                <select
                  [(ngModel)]="gradeQuality"
                  name="gradeQuality"
                  required
                >

                  <option [ngValue]="5">
                    ⭐⭐⭐⭐⭐ 5/5 - Exceptional
                  </option>

                  <option [ngValue]="4">
                    ⭐⭐⭐⭐ 4/5 - Good Quality
                  </option>

                  <option [ngValue]="3">
                    ⭐⭐⭐ 3/5 - Average
                  </option>

                  <option [ngValue]="2">
                    ⭐⭐ 2/5 - Needs Improvement
                  </option>

                  <option [ngValue]="1">
                    ⭐ 1/5 - Poor
                  </option>

                </select>

              </div>

              <!-- 5. PRIVATE FEEDBACK -->
              <div class="gc-form-field">

                <label>
                  Private feedback for student
                </label>

                <textarea
                  [(ngModel)]="gradeFeedback"
                  name="gradeFeedback"
                  rows="2"
                  placeholder="Constructive feedback..."
                ></textarea>

              </div>

              <!-- 6. LOCK MARKS -->
              <div
                class="gc-form-field"
                style="
                  display: flex;
                  align-items: center;
                  gap: 8px;
                  margin: 12px 0;
                "
              >

                <input
                  type="checkbox"
                  [(ngModel)]="marksLocked"
                  name="marksLocked"
                  id="marksLocked"
                  style="
                    width: 18px;
                    height: 18px;
                    cursor: pointer;
                  "
                />

                <label
                  for="marksLocked"
                  style="
                    margin: 0;
                    font-weight: 500;
                    cursor: pointer;
                    font-size: 0.85rem;
                  "
                >
                  Lock Marks (Make grades visible to student and
                  calculate into leaderboard)
                </label>

              </div>

              <!-- ACTIONS -->
              <div
                style="
                  display: flex;
                  gap: 0.5rem;
                  justify-content: flex-end;
                "
              >

                <button
                  type="button"
                  class="gc-btn gc-btn-flat"
                  (click)="cancelGrading()"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  class="gc-btn gc-btn-primary"
                >
                  Return Grade
                </button>

              </div>

            </form>

          </div>


          <!-- ========================= -->
          <!-- ROSTER VIEW -->
          <!-- ========================= -->

          <div
            *ngIf="!activeGradingEntry"
            style="
              display: flex;
              justify-content: flex-end;
              margin-bottom: 12px;
            "
          >

            <button
              type="button"
              class="gc-btn"
              (click)="lockAndPublishAll()"
              style="
                display: inline-flex;
                align-items: center;
                gap: 6px;
                padding: 8px 16px;
                border-radius: 10px;
                font-weight: 600;
                cursor: pointer;
                background: #10b981;
                color: white;
                border: none;
                font-size: 0.82rem;
              "
            >
              <i class="fa-solid fa-lock"></i>
              Lock & Publish All Grades
            </button>

          </div>


          <div
            *ngIf="!activeGradingEntry"
            class="gc-table-responsive"
          >

            <table class="gc-data-table">

              <thead>

                <tr>

                  <th>
                    Student Details
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Submitted At
                  </th>

                  <th>
                    Timeliness
                  </th>

                  <th>
                    Marks
                  </th>

                  <th>
                    Work Links
                  </th>

                  <th>
                    Action
                  </th>

                </tr>

              </thead>

              <tbody>

                <tr
                  *ngFor="let item of rosterList"
                >

                  <!-- STUDENT DETAILS -->
                  <td style="max-width: 320px;">

                    <strong>
                      {{ item.studentName }}
                    </strong>

                    <small
                      style="
                        display: block;
                        color: var(--gc-text-sub);
                        margin-bottom: 6px;
                      "
                    >
                      {{ item.studentEmail }}
                    </small>

                    <div
                      *ngIf="item.comments"
                      style="
                        margin-top: 6px;
                        padding: 6px 10px;
                        background: var(--gc-card-sub);
                        border-radius: 6px;
                        font-size: 0.8rem;
                        border-left: 3px solid var(--gc-info, #0ea5e9);
                        line-height: 1.3;
                      "
                    >

                      <span
                        style="
                          font-weight: 600;
                          color: var(--gc-text-sub);
                          display: block;
                          font-size: 0.72rem;
                          text-transform: uppercase;
                          margin-bottom: 2px;
                        "
                      >
                        Student Note:
                      </span>

                      <p
                        style="
                          margin: 0;
                          color: var(--gc-text-main);
                        "
                      >
                        "{{ item.comments }}"
                      </p>

                    </div>

                    <div
                      *ngIf="item.instructorFeedback"
                      style="
                        margin-top: 6px;
                        padding: 6px 10px;
                        background: rgba(16, 185, 129, 0.05);
                        border-radius: 6px;
                        font-size: 0.8rem;
                        border-left: 3px solid var(--gc-success, #10b981);
                        line-height: 1.3;
                      "
                    >

                      <span
                        style="
                          font-weight: 600;
                          color: var(--gc-success, #10b981);
                          display: block;
                          font-size: 0.72rem;
                          text-transform: uppercase;
                          margin-bottom: 2px;
                        "
                      >
                        Teacher Feedback:
                      </span>

                      <p
                        style="
                          margin: 0;
                          color: var(--gc-text-main);
                        "
                      >
                        "{{ item.instructorFeedback }}"
                      </p>

                    </div>

                  </td>


                  <!-- STATUS -->
                  <td>

                    <span
                      class="gc-badge"
                      [class.gc-badge-success]="
                        item.status === 'APPROVED'
                      "
                      [class.gc-badge-warning]="
                        item.status === 'SUBMITTED'
                      "
                      [class.gc-badge-orange]="
                        item.status === 'NEEDS_REVISION'
                      "
                      [class.gc-badge-danger]="
                        item.status === 'OVERDUE'
                      "
                    >
                      {{
                        item.status === 'NEEDS_REVISION'
                          ? 'Needs Revision'
                          : item.status
                      }}
                    </span>

                  </td>


                  <!-- SUBMITTED AT -->
                  <td>
                    {{
                      item.submittedAt
                        ? (item.submittedAt | date:'short')
                        : '—'
                    }}
                  </td>


                  <!-- TIMELINESS -->
                  <td>

                    <span class="gc-badge gc-badge-info">
                      {{ item.timelinessLabel }}
                    </span>

                  </td>


                  <!-- MARKS -->
                  <td>

                    <div
                      style="
                        display: flex;
                        align-items: center;
                        gap: 4px;
                      "
                      *ngIf="item.status === 'APPROVED'"
                    >

                      <strong>
                        {{
                          item.obtainedMarks != null
                            ? item.obtainedMarks
                            : 'N/A'
                        }}
                      </strong>

                      <span
                        style="
                          color: var(--gc-text-sub);
                          font-size: 0.78rem;
                        "
                      >
                        / {{ milestone?.maxMarks || 100 }}
                      </span>

                      <i
                        *ngIf="item.marksLocked"
                        class="fa-solid fa-lock"
                        style="
                          color: var(--gc-success);
                          margin-left: 4px;
                        "
                        title="Marks Locked & Published"
                      ></i>

                      <i
                        *ngIf="!item.marksLocked"
                        class="fa-solid fa-lock-open"
                        style="
                          color: var(--gc-warning);
                          margin-left: 4px;
                        "
                        title="Draft / Unlocked"
                      ></i>

                    </div>

                    <span
                      *ngIf="item.status !== 'APPROVED'"
                      style="
                        color: var(--gc-text-light);
                        font-size: 0.8rem;
                      "
                    >
                      —
                    </span>

                  </td>


                  <!-- WORK LINKS -->
                  <td>

                    <div
                      style="
                        display: flex;
                        flex-direction: column;
                        gap: 4px;
                      "
                    >

                      <a
                        *ngIf="item.fileUrl"
                        [href]="serverHost + item.fileUrl"
                        target="_blank"
                        class="gc-btn gc-btn-outline"
                        style="
                          padding: 0.2rem 0.5rem;
                          font-size: 0.75rem;
                          text-align: center;
                        "
                      >
                        <i class="fa-solid fa-download"></i>
                        File
                      </a>

                      <a
                        *ngIf="item.submissionLink"
                        [href]="item.submissionLink"
                        target="_blank"
                        class="gc-btn gc-btn-outline"
                        style="
                          padding: 0.2rem 0.5rem;
                          font-size: 0.75rem;
                          text-align: center;
                        "
                      >
                        <i class="fa-solid fa-link"></i>
                        Link
                      </a>

                    </div>

                  </td>


                  <!-- ACTION -->
                  <td>

                    <button
                      *ngIf="item.submissionId"
                      type="button"
                      class="gc-btn gc-btn-primary"
                      style="
                        padding: 0.25rem 0.6rem;
                        font-size: 0.78rem;
                      "
                      (click)="startGrading(item)"
                    >
                      {{
                        item.status === 'APPROVED' ||
                        item.status === 'NEEDS_REVISION'
                          ? 'Re-Grade'
                          : 'Grade'
                      }}
                    </button>

                    <span
                      *ngIf="!item.submissionId"
                      style="
                        font-size: 0.78rem;
                        color: var(--gc-text-light);
                      "
                    >
                      No work
                    </span>

                  </td>

                </tr>


                <!-- EMPTY STATE -->
                <tr *ngIf="rosterList.length === 0">

                  <td
                    colspan="7"
                    style="
                      text-align: center;
                      padding: 2rem;
                    "
                  >
                    No students found in roster.
                  </td>

                </tr>

              </tbody>

            </table>

          </div>

        </div>

      </div>
    </div>
  `,

  styles: [`
    .gc-grading-form-card {
      background: var(--gc-background);
      border: 1px solid var(--gc-border);
      border-radius: var(--gc-radius-md);
      padding: 1.25rem;
    }

    .gc-grading-form-card h4 {
      font-size: 1rem;
      font-weight: 500;
      margin-bottom: 1rem;
    }
  `]
})
export class ReviewRosterModalComponent implements OnInit {

  @Input() milestone!: Milestone;

  @Output() closeModal = new EventEmitter<void>();

  @Output() gradeReturned = new EventEmitter<void>();

  serverHost =
    window.location.port === '4200'
      ? 'http://localhost:8080'
      : '';

  rosterList: MilestoneRosterEntry[] = [];

  activeGradingEntry: MilestoneRosterEntry | null = null;

  gradeStatus: SubmissionStatus = 'APPROVED';

  gradeQuality: number | null = 5;

  gradeFeedback = '';

  obtainedMarks: number | null = null;

  marksLocked = false;

  constructor(
    private apiService: ApiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadRoster();
  }

  loadRoster() {

    if (!this.milestone) {
      return;
    }

    this.apiService
      .getMilestoneRoster(this.milestone.id)
      .subscribe({

        next: (list) => {

          this.rosterList = list;

          this.cdr.detectChanges();

        },

        error: (err) => {

          console.error(
            'Error loading roster:',
            err
          );

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

    this.gradeStatus =
      item.status === 'NEEDS_REVISION'
        ? 'NEEDS_REVISION'
        : 'APPROVED';

    this.gradeQuality =
      this.gradeStatus === 'NEEDS_REVISION'
        ? null
        : (item.qualityRating || 5);

    this.gradeFeedback =
      item.instructorFeedback || '';

    this.obtainedMarks =
      (
        item.obtainedMarks !== undefined &&
        item.obtainedMarks !== null
      )
        ? item.obtainedMarks
        : (this.milestone.maxMarks || 100);

    this.marksLocked =
      item.marksLocked || false;

    this.cdr.detectChanges();
  }

  cancelGrading() {

    this.activeGradingEntry = null;

    this.cdr.detectChanges();

  }

  onStatusChange() {

    if (this.gradeStatus === 'NEEDS_REVISION') {

      this.gradeQuality = null;

      this.obtainedMarks = null;

    } else {

      this.gradeQuality = 5;

      if (this.obtainedMarks === null) {
        this.obtainedMarks =
          this.milestone.maxMarks || 100;
      }

    }

  }

  submitGrade() {

    if (
      !this.activeGradingEntry ||
      !this.activeGradingEntry.submissionId
    ) {
      return;
    }

    const finalObtainedMarks =
      (
        this.gradeStatus === 'APPROVED' &&
        this.obtainedMarks !== null
      )
        ? this.obtainedMarks
        : undefined;

    this.apiService
      .reviewSubmission(
        this.activeGradingEntry.submissionId,
        {
          status: this.gradeStatus,
          qualityRating: this.gradeQuality as any,
          feedback: this.gradeFeedback,
          obtainedMarks: finalObtainedMarks,
          marksLocked: this.marksLocked
        }
      )
      .subscribe({

        next: () => {

          this.activeGradingEntry = null;

          this.loadRoster();

          this.gradeReturned.emit();

          this.cdr.detectChanges();

        },

        error: (err) => {

          console.error(
            'Error submitting grade:',
            err
          );

          this.cdr.detectChanges();

        }

      });

  }

  lockAndPublishAll() {

    if (!this.milestone) {
      return;
    }

    if (
      !confirm(
        'Are you sure you want to lock and publish all grades for this milestone? This will make all grades visible to students and calculate them into the leaderboard.'
      )
    ) {
      return;
    }

    this.apiService
      .lockAllSubmissions(this.milestone.id)
      .subscribe({

        next: () => {

          this.loadRoster();

          this.gradeReturned.emit();

          this.cdr.detectChanges();

        },

        error: (err) => {

          console.error(
            'Error locking submissions:',
            err
          );

          alert(
            'Failed to lock and publish grades. Please try again.'
          );

          this.cdr.detectChanges();

        }

      });

  }

}