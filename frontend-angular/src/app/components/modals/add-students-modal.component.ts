import { Component, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ApiService } from '../../services/api.service';
import { ViewStateService } from '../../services/view-state.service';

@Component({
  selector: 'app-add-students-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  template: `
    <div
      class="gc-modal-backdrop"
      (click)="close()"
    >

      <div
        class="gc-modern-modal"
        (click)="$event.stopPropagation()"
      >

        <!-- =====================================================
             HEADER
        ====================================================== -->

        <div class="gc-modal-top">

          <div class="gc-modal-title">

            <div class="gc-modal-icon">
              <i class="fa-solid fa-user-plus"></i>
            </div>

            <div>
              <h2>Invite Students</h2>

              <p>
                Add students to your classroom
              </p>
            </div>

          </div>

          <button
            type="button"
            class="gc-modal-close"
            (click)="close()"
          >
            ×
          </button>

        </div>


        <!-- =====================================================
             TABS
        ====================================================== -->

        <div class="gc-tabs">

          <button
            type="button"
            [class.active]="isManual"
            (click)="setManual(true)"
          >

            <i class="fa-solid fa-user"></i>

            Manual Entry

          </button>


          <button
            type="button"
            [class.active]="!isManual"
            (click)="setManual(false)"
          >

            <i class="fa-solid fa-file-csv"></i>

            Import CSV

          </button>

        </div>


        <!-- =====================================================
             BODY
        ====================================================== -->

        <div class="gc-modal-content">


          <!-- ===================================================
               MANUAL ENTRY
          ==================================================== -->

          <div
            *ngIf="isManual"
            class="gc-manual-section"
          >

            <label>
              Student Full Name
            </label>

            <div class="gc-input-box">

              <i class="fa-solid fa-user"></i>

              <input
                type="text"
                [(ngModel)]="fullName"
                name="fullName"
                placeholder="Example: Rahul Sharma"
              >

            </div>


            <label>
              Student Email Address
            </label>

            <div class="gc-input-box">

              <i class="fa-solid fa-envelope"></i>

              <input
                type="email"
                [(ngModel)]="email"
                name="email"
                placeholder="student@example.com"
              >

            </div>

          </div>


          <!-- ===================================================
               CSV IMPORT
          ==================================================== -->

          <div
            *ngIf="!isManual"
            class="gc-csv-section"
          >

            <!-- CSV FORMAT -->

            <div class="gc-csv-block">

              <div class="gc-csv-block-header">

                <div class="gc-csv-block-icon format-icon">

                  <i class="fa-solid fa-table-columns"></i>

                </div>

                <div>

                  <h4>
                    CSV Format
                  </h4>

                  <p>
                    Your CSV file must contain these columns in this order.
                  </p>

                </div>

              </div>


              <div class="gc-format-box">

                <span>
                  FullName
                </span>

                <i class="fa-solid fa-arrow-right"></i>

                <span>
                  Email
                </span>

              </div>

            </div>


            <!-- DOWNLOAD TEMPLATE -->

            <div class="gc-csv-template-card">

              <div class="gc-csv-template-info">

                <div class="gc-csv-block-icon template-icon">

                  <i class="fa-solid fa-file-arrow-down"></i>

                </div>

                <div>

                  <h4>
                    Need a template?
                  </h4>

                  <p>
                    Download a ready-to-use CSV template and fill in the student details.
                  </p>

                </div>

              </div>


              <button
                type="button"
                class="gc-secondary-btn gc-template-btn"
                (click)="downloadTemplate()"
              >

                <i class="fa-solid fa-download"></i>

                Download Template

              </button>

            </div>


            <!-- UPLOAD CSV -->

            <div class="gc-csv-upload-section">

              <label class="gc-upload-label">
                Upload CSV File
              </label>


              <div class="gc-file-upload-box">

                <div class="gc-file-upload-icon">

                  <i class="fa-solid fa-cloud-arrow-up"></i>

                </div>


                <div class="gc-file-upload-content">

                  <strong>
                    Select your student CSV file
                  </strong>

                  <span>
                    Only .csv files are supported
                  </span>

                </div>


                <label class="gc-browse-btn">

                  Browse

                  <input
                    type="file"
                    accept=".csv"
                    (change)="onFileSelected($event)"
                  >

                </label>

              </div>


              <!-- SELECTED FILE -->

              <div
                class="gc-selected-file"
                *ngIf="selectedFile"
              >

                <div class="gc-selected-file-icon">

                  <i class="fa-solid fa-file-csv"></i>

                </div>

                <div class="gc-selected-file-info">

                  <strong>
                    {{ selectedFile.name }}
                  </strong>

                  <span>
                    CSV file selected
                  </span>

                </div>

                <button
                  type="button"
                  class="gc-remove-file"
                  (click)="selectedFile = null"
                  title="Remove file"
                >

                  <i class="fa-solid fa-xmark"></i>

                </button>

              </div>

            </div>

          </div>

        </div>


        <!-- =====================================================
             FOOTER
        ====================================================== -->

        <div class="gc-modal-actions">

          <button
            type="button"
            class="gc-secondary-btn"
            (click)="close()"
          >
            Cancel
          </button>


          <button
            *ngIf="isManual"
            type="button"
            class="gc-primary-btn"
            (click)="onManualSubmit()"
          >

            <i class="fa-solid fa-paper-plane"></i>

            Invite

          </button>


          <button
            *ngIf="!isManual"
            type="button"
            class="gc-primary-btn"
            (click)="processCsv()"
          >

            <i class="fa-solid fa-upload"></i>

            Upload Roster

          </button>

        </div>

      </div>

    </div>
  `,

  styles: [`

    /* ==========================================================
       MODAL BACKDROP
    ========================================================== */

    .gc-modal-backdrop {

      position: fixed;

      inset: 0;

      background: rgba(15, 23, 42, .65);

      backdrop-filter: blur(4px);

      display: flex;

      justify-content: center;

      align-items: center;

      z-index: 999;

      padding: 20px;

      box-sizing: border-box;

    }


    /* ==========================================================
       MODAL
    ========================================================== */

    .gc-modern-modal {

      width: 520px;

      max-width: 100%;

      max-height: 92vh;

      background: var(--gc-card);

      border-radius: 24px;

      overflow: hidden;

      box-shadow:
        var(
          --gc-shadow-lg,
          0 25px 60px rgba(0,0,0,.25)
        );

      color: var(--gc-text-main);

      border: 1px solid var(--gc-border);

      display: flex;

      flex-direction: column;

    }


    /* ==========================================================
       HEADER
    ========================================================== */

    .gc-modal-top {

      padding: 24px;

      display: flex;

      justify-content: space-between;

      align-items: center;

      border-bottom: 1px solid var(--gc-border);

      background: var(--gc-card);

      flex-shrink: 0;

    }


    .gc-modal-title {

      display: flex;

      gap: 15px;

      align-items: center;

    }


    .gc-modal-title h2 {

      margin: 0;

      color: var(--gc-text-main);

      font-weight: 700;

      font-size: 1.4rem;

    }


    .gc-modal-title p {

      margin: 5px 0 0;

      color: var(--gc-text-sub);

      font-size: .85rem;

    }


    .gc-modal-icon {

      width: 48px;

      height: 48px;

      border-radius: 14px;

      display: flex;

      align-items: center;

      justify-content: center;

      background:
        linear-gradient(
          135deg,
          #059669,
          #10b981
        );

      color: white;

      font-size: 20px;

      flex-shrink: 0;

    }


    .gc-modal-close {

      border: none;

      background: none;

      font-size: 28px;

      cursor: pointer;

      color: var(--gc-text-sub);

      transition: color .2s ease;

      line-height: 1;

    }


    .gc-modal-close:hover {

      color: var(--gc-text-main);

    }


    /* ==========================================================
       TABS
    ========================================================== */

    .gc-tabs {

      display: flex;

      padding: 15px 25px 0;

      gap: 10px;

      border-bottom: 1px solid var(--gc-border);

      background: var(--gc-card);

      flex-shrink: 0;

    }


    .gc-tabs button {

      flex: 1;

      padding: 12px;

      border: none;

      background: transparent;

      border-bottom: 3px solid transparent;

      cursor: pointer;

      font-weight: 600;

      color: var(--gc-text-sub);

      transition: all .2s ease;

    }


    .gc-tabs button:hover {

      color: var(--gc-text-main);

    }


    .gc-tabs button.active {

      color: #2563eb;

      border-color: #2563eb;

    }


    :host-context(.dark-theme) .gc-tabs button.active,
    .dark-theme .gc-tabs button.active {

      color: #60a5fa;

      border-color: #60a5fa;

    }


    /* ==========================================================
       CONTENT
    ========================================================== */

    .gc-modal-content {

      padding: 25px;

      background: var(--gc-card);

      color: var(--gc-text-main);

      overflow-y: auto;

    }


    /* ==========================================================
       LABELS
    ========================================================== */

    label {

      font-size: .85rem;

      font-weight: 600;

      display: block;

      margin-bottom: 8px;

      margin-top: 18px;

      color: var(--gc-text-main);

    }


    .gc-manual-section label:first-child {

      margin-top: 0;

    }


    /* ==========================================================
       MANUAL INPUT
    ========================================================== */

    .gc-input-box {

      border: 1px solid
        var(
          --gc-input-border,
          var(--gc-border)
        );

      border-radius: 14px;

      display: flex;

      align-items: center;

      gap: 12px;

      padding: 0 15px;

      background: var(--gc-input-bg);

      transition:
        border-color .2s ease,
        box-shadow .2s ease;

    }


    .gc-input-box:focus-within {

      border-color: var(--gc-primary);

      box-shadow:
        0 0 0 3px
        rgba(37,99,235,.15);

    }


    .gc-input-box i {

      color: var(--gc-primary);

    }


    input {

      border: none;

      outline: none;

      padding: 14px;

      width: 100%;

      background: transparent;

      color: var(--gc-text-main);

      font-size: .95rem;

      box-sizing: border-box;

    }


    input::placeholder {

      color: var(--gc-text-light);

    }


    /* ==========================================================
       CSV SECTION
    ========================================================== */

    .gc-csv-section {

      display: flex;

      flex-direction: column;

      gap: 18px;

    }


    /* ==========================================================
       CSV FORMAT BLOCK
    ========================================================== */

    .gc-csv-block {

      border: 1px solid var(--gc-border);

      border-radius: 16px;

      padding: 16px;

      background: var(--gc-card-sub);

    }


    .gc-csv-block-header {

      display: flex;

      align-items: center;

      gap: 12px;

    }


    .gc-csv-block-icon {

      width: 40px;

      height: 40px;

      border-radius: 11px;

      display: flex;

      align-items: center;

      justify-content: center;

      flex-shrink: 0;

    }


    .format-icon {

      background: rgba(37,99,235,.1);

      color: #2563eb;

    }


    .template-icon {

      background: rgba(16,185,129,.1);

      color: #059669;

    }


    .gc-csv-block-header h4 {

      margin: 0;

      font-size: .95rem;

      font-weight: 700;

      color: var(--gc-text-main);

    }


    .gc-csv-block-header p {

      margin: 4px 0 0;

      color: var(--gc-text-sub);

      font-size: .78rem;

      line-height: 1.4;

    }


    /* ==========================================================
       FORMAT DISPLAY
    ========================================================== */

    .gc-format-box {

      margin-top: 14px;

      padding: 12px 14px;

      border-radius: 10px;

      background: var(--gc-card);

      border: 1px dashed var(--gc-border);

      display: flex;

      align-items: center;

      justify-content: center;

      gap: 12px;

      font-family: monospace;

      font-size: .85rem;

      font-weight: 600;

      color: var(--gc-text-main);

    }


    .gc-format-box i {

      color: var(--gc-text-sub);

      font-size: .7rem;

    }


    /* ==========================================================
       TEMPLATE CARD
    ========================================================== */

    .gc-csv-template-card {

      display: flex;

      align-items: center;

      justify-content: space-between;

      gap: 14px;

      padding: 15px 16px;

      border: 1px solid var(--gc-border);

      border-radius: 16px;

      background: var(--gc-card);

    }


    .gc-csv-template-info {

      display: flex;

      align-items: center;

      gap: 12px;

      min-width: 0;

    }


    .gc-csv-template-info h4 {

      margin: 0;

      font-size: .9rem;

      font-weight: 700;

      color: var(--gc-text-main);

    }


    .gc-csv-template-info p {

      margin: 4px 0 0;

      color: var(--gc-text-sub);

      font-size: .75rem;

      line-height: 1.4;

    }


    .gc-template-btn {

      white-space: nowrap;

      flex-shrink: 0;

    }


    /* ==========================================================
       UPLOAD SECTION
    ========================================================== */

    .gc-csv-upload-section {

      display: flex;

      flex-direction: column;

      gap: 8px;

    }


    .gc-upload-label {

      margin: 0;

      font-size: .85rem;

      font-weight: 700;

      color: var(--gc-text-main);

    }


    .gc-file-upload-box {

      display: flex;

      align-items: center;

      gap: 12px;

      padding: 14px;

      border: 1px dashed var(--gc-border);

      border-radius: 16px;

      background: var(--gc-card-sub);

    }


    .gc-file-upload-icon {

      width: 42px;

      height: 42px;

      border-radius: 12px;

      background: rgba(37,99,235,.1);

      color: #2563eb;

      display: flex;

      align-items: center;

      justify-content: center;

      flex-shrink: 0;

    }


    .gc-file-upload-content {

      display: flex;

      flex-direction: column;

      gap: 3px;

      min-width: 0;

      flex: 1;

    }


    .gc-file-upload-content strong {

      font-size: .82rem;

      color: var(--gc-text-main);

      overflow-wrap: anywhere;

    }


    .gc-file-upload-content span {

      font-size: .72rem;

      color: var(--gc-text-sub);

    }


    /* ==========================================================
       BROWSE BUTTON
    ========================================================== */

    .gc-browse-btn {

      margin: 0;

      padding: 8px 13px;

      border-radius: 9px;

      background: rgba(37,99,235,.1);

      color: #2563eb;

      font-size: .78rem;

      font-weight: 700;

      cursor: pointer;

      transition: all .2s ease;

      flex-shrink: 0;

    }


    .gc-browse-btn:hover {

      background: #2563eb;

      color: white;

    }


    .gc-browse-btn input {

      display: none;

    }


    /* ==========================================================
       SELECTED FILE
    ========================================================== */

    .gc-selected-file {

      display: flex;

      align-items: center;

      gap: 10px;

      padding: 10px 12px;

      border-radius: 12px;

      background: rgba(16,185,129,.08);

      border: 1px solid rgba(16,185,129,.2);

    }


    .gc-selected-file-icon {

      color: #059669;

      font-size: 1.1rem;

      flex-shrink: 0;

    }


    .gc-selected-file-info {

      display: flex;

      flex-direction: column;

      gap: 2px;

      min-width: 0;

      flex: 1;

    }


    .gc-selected-file-info strong {

      font-size: .78rem;

      color: var(--gc-text-main);

      overflow-wrap: anywhere;

    }


    .gc-selected-file-info span {

      font-size: .7rem;

      color: var(--gc-text-sub);

    }


    .gc-remove-file {

      border: none;

      background: transparent;

      color: #ef4444;

      cursor: pointer;

      padding: 5px;

      flex-shrink: 0;

    }


    /* ==========================================================
       BUTTONS
    ========================================================== */

    .gc-secondary-btn {

      border: 1px solid var(--gc-border);

      padding: 12px 22px;

      border-radius: 12px;

      cursor: pointer;

      font-weight: 600;

      background: var(--gc-card-sub);

      color: var(--gc-text-main);

      transition: all .2s ease;

    }


    .gc-secondary-btn:hover {

      background: var(--gc-border);

    }


    .gc-primary-btn {

      border: none;

      padding: 12px 22px;

      border-radius: 12px;

      cursor: pointer;

      font-weight: 600;

      background:
        linear-gradient(
          135deg,
          #2563eb,
          #4f46e5
        );

      color: white;

      box-shadow:
        0 4px 12px
        rgba(37,99,235,.2);

      transition: all .2s ease;

    }


    .gc-primary-btn:hover {

      transform: translateY(-1px);

      box-shadow:
        0 6px 16px
        rgba(37,99,235,.3);

    }


    /* ==========================================================
       FOOTER
    ========================================================== */

    .gc-modal-actions {

      padding: 20px;

      display: flex;

      justify-content: flex-end;

      gap: 12px;

      background: var(--gc-card-sub);

      border-top: 1px solid var(--gc-border);

      flex-shrink: 0;

    }


    /* ==========================================================
       MOBILE
    ========================================================== */

    @media (max-width: 600px) {

      .gc-modal-backdrop {

        padding: 12px;

      }


      .gc-modern-modal {

        width: 100%;

        max-height: 95vh;

        border-radius: 20px;

      }


      .gc-modal-top {

        padding: 18px;

      }


      .gc-tabs {

        padding: 12px 18px 0;

      }


      .gc-modal-content {

        padding: 18px;

      }


      .gc-csv-template-card {

        flex-direction: column;

        align-items: stretch;

      }


      .gc-template-btn {

        width: 100%;

      }


      .gc-file-upload-box {

        flex-wrap: wrap;

      }


      .gc-file-upload-content {

        min-width: calc(100% - 55px);

      }


      .gc-browse-btn {

        width: 100%;

        text-align: center;

        box-sizing: border-box;

      }


      .gc-modal-actions {

        padding: 16px 18px;

      }

    }


    /* ==========================================================
       DARK THEME
    ========================================================== */

    :host-context(.dark-theme) .gc-csv-block {

      background: #172033;

    }


    :host-context(.dark-theme) .gc-format-box {

      background: #1e293b;

    }


    :host-context(.dark-theme) .gc-csv-template-card {

      background: #1e293b;

    }


    :host-context(.dark-theme) .gc-file-upload-box {

      background: #172033;

    }

  `]
})
export class AddStudentsModalComponent {

  @Output()
  closeModal = new EventEmitter<void>();

  @Output()
  studentsAdded = new EventEmitter<void>();


  isManual = true;


  fullName = '';

  email = '';


  selectedFile: File | null = null;


  constructor(
    private apiService: ApiService,
    private viewStateService: ViewStateService,
    private cdr: ChangeDetectorRef
  ) {}


  close() {

    this.closeModal.emit();

  }


  setManual(value: boolean) {

    this.isManual = value;

  }


  isValidEmail(email: string): boolean {

    if (!email) return false;

    const emailRegex =
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    return emailRegex.test(email.trim());

  }


  isValidName(name: string): boolean {

    if (!name) return false;

    const trimmed = name.trim();

    const limits =
      this.viewStateService.validationLimits();

    const minLen =
      limits?.userFullnameMin || 2;

    const maxLen =
      limits?.userFullnameMax || 100;

    if (
      trimmed.length < minLen ||
      trimmed.length > maxLen
    ) {

      return false;

    }

    const nameRegex =
      /^[a-zA-Z\s.'-]+$/;

    if (!nameRegex.test(trimmed)) {

      return false;

    }

    const alphaMatches =
      trimmed.match(/[a-zA-Z]/g);

    return !!alphaMatches &&
      alphaMatches.length >= 2;

  }


  onManualSubmit() {

    const subject =
      this.viewStateService.currentSubject();

    if (!subject) return;

    const trimmedName =
      this.fullName
        ? this.fullName.trim()
        : '';

    const trimmedEmail =
      this.email
        ? this.email.trim()
        : '';


    if (!trimmedName || !trimmedEmail) {

      alert(
        "Please enter both student full name and email address."
      );

      return;

    }


    if (!this.isValidName(trimmedName)) {

      alert(
        "Please enter a valid full name (e.g. H. C. Verma or Rahul Sharma). Names cannot be punctuation symbols only (like '.')."
      );

      return;

    }


    if (!this.isValidEmail(trimmedEmail)) {

      alert(
        "Please enter a valid email address (e.g. student@example.com)."
      );

      return;

    }


    this.apiService
      .addStudentToSubjectManual(
        subject.id,
        trimmedName,
        trimmedEmail
      )
      .subscribe({

        next: () => {

          this.studentsAdded.emit();

          this.close();

        },

        error: (err) => {

          console.error(err);

          alert(
            err?.error?.message ||
            "Unable to invite student"
          );

        }

      });

  }


  downloadTemplate() {

    const csv =
      "FullName,Email\nJohn Doe,john@example.com";

    const blob =
      new Blob(
        [csv],
        { type: 'text/csv' }
      );

    const url =
      URL.createObjectURL(blob);

    const a =
      document.createElement('a');

    a.href = url;

    a.download =
      "Student_Template.csv";

    a.click();

    URL.revokeObjectURL(url);

  }


  onFileSelected(event: Event) {

    const input =
      event.target as HTMLInputElement;

    if (input.files?.length) {

      this.selectedFile =
        input.files[0];

      this.cdr.detectChanges();

    }

  }


  processCsv() {

    if (!this.selectedFile) {

      alert(
        "Please select a CSV file first."
      );

      return;

    }


    const subject =
      this.viewStateService.currentSubject();

    if (!subject) {

      alert(
        "No active class selected."
      );

      return;

    }


    const reader =
      new FileReader();


    reader.onload = (e: any) => {

      const text =
        e.target.result as string;

      const lines =
        text.split(/\r\n|\n/);

      let enrolledCount = 0;

      let skippedCount = 0;

      const promises: any[] = [];


      for (
        let i = 0;
        i < lines.length;
        i++
      ) {

        const line =
          lines[i].trim();


        if (
          !line ||
          (
            i === 0 &&
            (
              line
                .toLowerCase()
                .includes('email') ||
              line
                .toLowerCase()
                .includes('fullname')
            )
          )
        ) {

          continue;

        }


        const parts =
          line.split(',');


        if (parts.length >= 2) {

          const fullName =
            parts[0].trim();

          const email =
            parts[1].trim();


          if (
            this.isValidName(fullName) &&
            this.isValidEmail(email)
          ) {

            promises.push(

              this.apiService
                .addStudentToSubjectManual(
                  subject.id,
                  fullName,
                  email
                )
                .toPromise()

            );

            enrolledCount++;

          } else {

            skippedCount++;

          }

        } else {

          skippedCount++;

        }

      }


      if (
        enrolledCount === 0 &&
        skippedCount > 0
      ) {

        alert(
          `No valid student entries found in CSV. ${skippedCount} row(s) were skipped due to invalid full name or email format.`
        );

        return;

      }


      if (
        enrolledCount === 0 &&
        skippedCount === 0
      ) {

        alert(
          "The uploaded CSV file contains no data rows."
        );

        return;

      }


      Promise
        .allSettled(promises)
        .then((results) => {

          const failed = results.filter(r => r.status === 'rejected');
          const succeeded = results.filter(r => r.status === 'fulfilled');

          let msg =
            `Successfully processed CSV. Added ${succeeded.length} student(s).`;

          if (skippedCount > 0) {

            msg +=
              ` Skipped ${skippedCount} invalid row(s) (invalid name or email format).`;

          }
          
          if (failed.length > 0) {
            const firstError = (failed[0] as PromiseRejectedResult).reason?.error?.message || 'Some students could not be added.';
            msg += ` Failed to add ${failed.length} student(s): ${firstError}`;
          }

          alert(msg);

          this.studentsAdded.emit();

          this.close();

        });

    };


    reader.readAsText(
      this.selectedFile
    );

  }

}