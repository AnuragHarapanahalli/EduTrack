import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ApiService } from '../../services/api.service';
import { ViewStateService } from '../../services/view-state.service';

import {
  Milestone,
  CreateMilestoneRequest,
  DeliverableItem
} from '../../models/milestone.model';

@Component({
  selector: 'app-create-milestone-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],

  template: `
    <div class="gc-modal-backdrop" (click)="close()">

      <div
        class="gc-modern-modal"
        (click)="$event.stopPropagation()"
      >

        <!-- HEADER -->
        <div class="gc-modal-top">

          <div class="gc-modal-title">

            <div class="gc-modal-icon">
              <i class="fa-solid fa-file-lines"></i>
            </div>

            <div>
              <h2>
                {{ milestoneToEdit ? 'Edit Milestone' : 'Create Milestone' }}
              </h2>

              <p>
                Define requirements and timeline for students
              </p>
            </div>

          </div>

          <button
            type="button"
            class="gc-modal-close"
            (click)="close()"
          >
            &times;
          </button>

        </div>


        <!-- FORM -->
        <form
          class="gc-milestone-form"
          (ngSubmit)="onSubmit()"
        >

          <div class="gc-modal-content">

            <!-- TITLE -->
            <div class="gc-field">

              <div class="gc-label-row">

                <label for="milestone-title">
                  Title <span>*</span>
                </label>

                <span class="gc-character-count">
                  {{ title?.trim()?.length || 0 }}
                  /
                  {{ viewStateService.validationLimits().milestoneTitleMax }}
                </span>

              </div>

              <div class="gc-input-box">

                <i class="fa-solid fa-heading"></i>

                <input
                  id="milestone-title"
                  type="text"
                  [(ngModel)]="title"
                  name="title"
                  placeholder="e.g. Milestone 1: SRS Document"
                  required
                  autocomplete="off"
                />

              </div>

            </div>


            <!-- DESCRIPTION -->
            <div class="gc-field">

              <div class="gc-label-row">

                <label for="milestone-description">
                  Instructions <span>*</span>
                </label>

                <span class="gc-character-count">
                  {{ description?.trim()?.length || 0 }}
                  /
                  {{ viewStateService.validationLimits().milestoneDescriptionMax }}
                </span>

              </div>

              <textarea
                id="milestone-description"
                [(ngModel)]="description"
                name="description"
                rows="4"
                placeholder="Explain what students need to complete for this milestone..."
                required
              ></textarea>

            </div>


            <!-- MARKS + DEADLINE -->
            <div class="gc-two-column">

              <!-- MAX MARKS -->
              <div class="gc-field">

                <label for="max-marks">
                  Max Marks <span>*</span>
                </label>

                <div class="gc-input-box">

                  <i class="fa-solid fa-square-poll-vertical"></i>

                  <input
                    id="max-marks"
                    type="number"
                    [(ngModel)]="maxMarks"
                    name="maxMarks"
                    required
                    min="1"
                    placeholder="100"
                  />

                </div>

              </div>


              <!-- DEADLINE -->
              <div class="gc-field">

                <label for="deadline">
                  Due Date & Time <span>*</span>
                </label>

                <div class="gc-input-box">

                  <i class="fa-solid fa-calendar-days"></i>

                  <input
                    id="deadline"
                    type="datetime-local"
                    [(ngModel)]="deadline"
                    name="deadline"
                    required
                  />

                </div>

              </div>

            </div>


            <!-- DELIVERABLES -->
            <div class="gc-deliverables-section">

              <div class="gc-deliverables-header">

                <div>

                  <label class="gc-section-label">
                    Required Deliverables
                  </label>

                  <p class="gc-section-description">
                    Specify what students must submit.
                  </p>

                </div>

                <button
                  type="button"
                  class="gc-btn-add"
                  (click)="addDeliverableRow()"
                >
                  <i class="fa-solid fa-plus"></i>
                  Add Deliverable
                </button>

              </div>


              <!-- DELIVERABLE LIST -->
              <div class="gc-deliverables-list">

                <div
                  *ngFor="
                    let item of deliverables;
                    let i = index;
                    trackBy: trackByDeliverable
                  "
                  class="gc-deliverable-card"
                >

                  <!-- ROW HEADER -->
                  <div class="gc-deliverable-card-header">

                    <div class="gc-deliverable-number">
                      {{ i + 1 }}
                    </div>

                    <div class="gc-deliverable-heading">
                      Deliverable {{ i + 1 }}
                    </div>

                    <button
                      *ngIf="deliverables.length > 1"
                      type="button"
                      class="gc-btn-delete-row"
                      (click)="removeDeliverableRow(i)"
                      title="Remove deliverable"
                    >
                      <i class="fa-solid fa-trash-can"></i>
                    </button>

                  </div>


                  <!-- DELIVERABLE TITLE -->
                  <div class="gc-deliverable-title-field">

                    <label>
                      Deliverable Name <span>*</span>
                    </label>

                    <input
                      type="text"
                      [(ngModel)]="item.title"
                      [name]="'del_title_' + i"
                      placeholder="e.g. SRS PDF Document"
                      required
                    />

                  </div>


                  <!-- SUBMISSION TYPES -->
                  <div class="gc-submission-options">

                    <!-- FILE -->
                    <div
                      class="gc-submission-option"
                      [class.gc-option-active]="item.acceptsFile"
                    >

                      <label class="gc-option-label">

                        <input
                          type="checkbox"
                          [(ngModel)]="item.acceptsFile"
                          [name]="'del_acc_file_' + i"
                        />

                        <span class="gc-custom-check">
                          <i class="fa-solid fa-check"></i>
                        </span>

                        <span>
                          <strong>File Upload</strong>
                          <small>
                            Allow students to upload a file
                          </small>
                        </span>

                      </label>


                      <div
                        class="gc-option-input"
                        *ngIf="item.acceptsFile"
                      >

                        <input
                          type="text"
                          [(ngModel)]="item.allowedFileExtensions"
                          [name]="'del_file_formats_' + i"
                          placeholder="Allowed formats: pdf, zip, docx"
                        />

                      </div>

                    </div>


                    <!-- LINK -->
                    <div
                      class="gc-submission-option"
                      [class.gc-option-active]="item.acceptsLink"
                    >

                      <label class="gc-option-label">

                        <input
                          type="checkbox"
                          [(ngModel)]="item.acceptsLink"
                          [name]="'del_acc_link_' + i"
                        />

                        <span class="gc-custom-check">
                          <i class="fa-solid fa-check"></i>
                        </span>

                        <span>
                          <strong>Link Submission</strong>
                          <small>
                            Allow students to submit a URL
                          </small>
                        </span>

                      </label>


                      <div
                        class="gc-option-input"
                        *ngIf="item.acceptsLink"
                      >

                        <input
                          type="text"
                          [(ngModel)]="item.allowedLinkPatterns"
                          [name]="'del_link_formats_' + i"
                          placeholder="Allowed patterns: github.com"
                        />

                      </div>

                    </div>

                  </div>


                  <!-- MANDATORY -->
                  <label class="gc-mandatory-option">

                    <input
                      type="checkbox"
                      [(ngModel)]="item.isMandatory"
                      [name]="'del_mand_' + i"
                    />

                    <span class="gc-custom-check">
                      <i class="fa-solid fa-check"></i>
                    </span>

                    <span>
                      Mandatory deliverable
                    </span>

                  </label>

                </div>


                <!-- EMPTY STATE -->
                <div
                  *ngIf="deliverables.length === 0"
                  class="gc-empty-deliverables"
                >

                  <i class="fa-solid fa-inbox"></i>

                  <p>No deliverables added yet.</p>

                  <button
                    type="button"
                    class="gc-btn-add"
                    (click)="addDeliverableRow()"
                  >
                    <i class="fa-solid fa-plus"></i>
                    Add Deliverable
                  </button>

                </div>

              </div>

            </div>


            <!-- ERROR -->
            <div
              *ngIf="errorMessage"
              class="gc-error"
            >

              <i class="fa-solid fa-circle-exclamation"></i>

              <span>
                {{ errorMessage }}
              </span>

            </div>

          </div>


          <!-- FOOTER -->
          <div class="gc-modal-actions">

            <button
              type="button"
              class="gc-secondary-btn"
              (click)="close()"
            >
              Cancel
            </button>

            <button
              type="submit"
              class="gc-primary-btn"
              [disabled]="isSubmitting"
            >

              <i
                *ngIf="isSubmitting"
                class="fa-solid fa-spinner fa-spin"
              ></i>

              <i
                *ngIf="!isSubmitting"
                class="fa-solid fa-paper-plane"
              ></i>

              {{
                isSubmitting
                  ? (milestoneToEdit ? 'Saving...' : 'Creating...')
                  : (milestoneToEdit ? 'Save Changes' : 'Create Milestone')
              }}

            </button>

          </div>

        </form>

      </div>

    </div>
  `,

  styles: [
    `
      /* ================================
         MODAL BACKDROP
         ================================ */

      .gc-modal-backdrop {
        position: fixed;
        inset: 0;
        z-index: 9999;

        display: flex;
        align-items: center;
        justify-content: center;

        padding: 24px;

        background: rgba(15, 23, 42, 0.62);

        backdrop-filter: blur(6px);
        -webkit-backdrop-filter: blur(6px);

        animation: gcBackdropIn 0.2s ease;
      }


      /* ================================
         MODAL
         ================================ */

      .gc-modern-modal {
        width: 860px;
        max-width: 100%;

        max-height: calc(100vh - 48px);

        display: flex;
        flex-direction: column;

        overflow: hidden;

        background: var(--gc-card);
        border: 1px solid var(--gc-border);

        border-radius: 24px;

        box-shadow:
          0 30px 80px rgba(15, 23, 42, 0.28),
          0 8px 30px rgba(15, 23, 42, 0.12);

        animation: gcModalIn 0.25s ease;
      }


      /* ================================
         HEADER
         ================================ */

      .gc-modal-top {
        flex-shrink: 0;

        display: flex;
        align-items: center;
        justify-content: space-between;

        padding: 22px 25px;

        background: var(--gc-card);

        border-bottom: 1px solid var(--gc-border);
      }


      .gc-modal-title {
        display: flex;
        align-items: center;
        gap: 14px;
      }


      .gc-modal-icon {
        width: 48px;
        height: 48px;

        flex-shrink: 0;

        display: flex;
        align-items: center;
        justify-content: center;

        border-radius: 14px;

        background: linear-gradient(
          135deg,
          #2563eb,
          #4f46e5
        );

        color: white;

        font-size: 19px;

        box-shadow:
          0 8px 20px rgba(37, 99, 235, 0.22);
      }


      .gc-modal-title h2 {
        margin: 0;

        color: var(--gc-text-main);

        font-size: 1.35rem;
        line-height: 1.3;

        font-weight: 750;
      }


      .gc-modal-title p {
        margin: 4px 0 0;

        color: var(--gc-text-sub);

        font-size: 0.82rem;
      }


      .gc-modal-close {
        width: 38px;
        height: 38px;

        display: flex;
        align-items: center;
        justify-content: center;

        border: none;
        border-radius: 10px;

        background: transparent;

        color: var(--gc-text-sub);

        font-size: 25px;
        line-height: 1;

        cursor: pointer;

        transition:
          background 0.18s ease,
          color 0.18s ease,
          transform 0.18s ease;
      }


      .gc-modal-close:hover {
        background: var(--gc-background);
        color: var(--gc-text-main);
        transform: rotate(4deg);
      }


      /* ================================
         FORM CONTENT
         ================================ */

      .gc-milestone-form {
        min-height: 0;

        display: flex;
        flex-direction: column;
      }


      .gc-modal-content {
        min-height: 0;

        overflow-y: auto;

        padding: 24px 25px;

        display: flex;
        flex-direction: column;
        gap: 18px;

        background: var(--gc-card);
      }


      .gc-modal-content::-webkit-scrollbar {
        width: 7px;
      }


      .gc-modal-content::-webkit-scrollbar-track {
        background: transparent;
      }


      .gc-modal-content::-webkit-scrollbar-thumb {
        background: var(--gc-border);
        border-radius: 10px;
      }


      /* ================================
         FIELDS
         ================================ */

      .gc-field {
        width: 100%;
      }


      .gc-label-row {
        display: flex;
        align-items: center;
        justify-content: space-between;

        margin-bottom: 7px;
      }


      label {
        display: block;

        margin: 0 0 7px;

        color: var(--gc-text-main);

        font-size: 0.82rem;
        font-weight: 650;
      }


      label span {
        color: #ef4444;
      }


      .gc-label-row label {
        margin: 0;
      }


      .gc-character-count {
        color: var(--gc-text-sub);

        font-size: 0.7rem;
        font-weight: 500;
      }


      /* ================================
         INPUTS
         ================================ */

      .gc-input-box {
        min-height: 46px;

        display: flex;
        align-items: center;
        gap: 10px;

        padding: 0 13px;

        border: 1px solid var(--gc-border);
        border-radius: 12px;

        background: var(--gc-card);

        transition:
          border-color 0.18s ease,
          box-shadow 0.18s ease;
      }


      .gc-input-box:focus-within {
        border-color: var(--gc-primary);

        box-shadow:
          0 0 0 3px rgba(37, 99, 235, 0.10);
      }


      .gc-input-box i {
        width: 18px;

        flex-shrink: 0;

        color: var(--gc-primary);

        font-size: 0.88rem;

        text-align: center;
      }


      input,
      textarea {
        width: 100%;

        outline: none;

        color: var(--gc-text-main);

        font-family: inherit;

        font-size: 0.88rem;
      }


      .gc-input-box input {
        min-width: 0;

        padding: 12px 4px;

        border: none;

        background: transparent;
      }


      input::placeholder,
      textarea::placeholder {
        color: var(--gc-text-sub);
        opacity: 0.72;
      }


      textarea {
        display: block;

        min-height: 100px;

        padding: 12px 14px;

        border: 1px solid var(--gc-border);
        border-radius: 12px;

        background: var(--gc-card);

        resize: vertical;

        line-height: 1.5;

        transition:
          border-color 0.18s ease,
          box-shadow 0.18s ease;
      }


      textarea:focus {
        border-color: var(--gc-primary);

        box-shadow:
          0 0 0 3px rgba(37, 99, 235, 0.10);
      }


      /* ================================
         TWO COLUMN
         ================================ */

      .gc-two-column {
        display: grid;

        grid-template-columns: 1fr 1fr;

        gap: 16px;
      }


      /* ================================
         DELIVERABLE SECTION
         ================================ */

      .gc-deliverables-section {
        margin-top: 2px;
      }


      .gc-deliverables-header {
        display: flex;
        align-items: center;
        justify-content: space-between;

        gap: 15px;

        margin-bottom: 10px;
      }


      .gc-section-label {
        margin: 0;

        font-size: 0.86rem;
        font-weight: 700;
      }


      .gc-section-description {
        margin: 3px 0 0;

        color: var(--gc-text-sub);

        font-size: 0.72rem;
        font-weight: 400;
      }


      /* ================================
         ADD BUTTON
         ================================ */

      .gc-btn-add {
        flex-shrink: 0;

        display: inline-flex;
        align-items: center;
        justify-content: center;

        gap: 6px;

        padding: 8px 12px;

        border: 1px solid rgba(37, 99, 235, 0.20);
        border-radius: 9px;

        background: rgba(37, 99, 235, 0.08);

        color: #2563eb;

        font-family: inherit;

        font-size: 0.75rem;
        font-weight: 650;

        cursor: pointer;

        transition:
          background 0.18s ease,
          color 0.18s ease,
          border-color 0.18s ease,
          transform 0.18s ease;
      }


      .gc-btn-add:hover {
        background: #2563eb;
        border-color: #2563eb;
        color: white;

        transform: translateY(-1px);
      }


      /* ================================
         DELIVERABLE CARD
         ================================ */

      .gc-deliverables-list {
        display: flex;
        flex-direction: column;

        gap: 10px;
      }


      .gc-deliverable-card {
        padding: 15px;

        border: 1px solid var(--gc-border);
        border-radius: 14px;

        background: var(--gc-background);

        transition:
          border-color 0.18s ease,
          box-shadow 0.18s ease;
      }


      .gc-deliverable-card:hover {
        border-color: rgba(37, 99, 235, 0.25);

        box-shadow:
          0 3px 12px rgba(15, 23, 42, 0.04);
      }


      /* ================================
         DELIVERABLE HEADER
         ================================ */

      .gc-deliverable-card-header {
        display: flex;
        align-items: center;

        gap: 9px;

        margin-bottom: 12px;
      }


      .gc-deliverable-number {
        width: 25px;
        height: 25px;

        display: flex;
        align-items: center;
        justify-content: center;

        border-radius: 7px;

        background: rgba(37, 99, 235, 0.10);

        color: #2563eb;

        font-size: 0.72rem;
        font-weight: 750;
      }


      .gc-deliverable-heading {
        flex: 1;

        color: var(--gc-text-main);

        font-size: 0.78rem;
        font-weight: 700;
      }


      .gc-btn-delete-row {
        width: 30px;
        height: 30px;

        display: flex;
        align-items: center;
        justify-content: center;

        border: none;
        border-radius: 8px;

        background: transparent;

        color: #ef4444;

        cursor: pointer;

        transition:
          background 0.18s ease,
          color 0.18s ease;
      }


      .gc-btn-delete-row:hover {
        background: rgba(239, 68, 68, 0.09);
        color: #dc2626;
      }


      /* ================================
         DELIVERABLE TITLE
         ================================ */

      .gc-deliverable-title-field {
        margin-bottom: 13px;
      }


      .gc-deliverable-title-field label {
        font-size: 0.74rem;
      }


      .gc-deliverable-title-field input {
        width: 100%;

        box-sizing: border-box;

        padding: 10px 11px;

        border: 1px solid var(--gc-border);
        border-radius: 9px;

        outline: none;

        background: var(--gc-card);

        color: var(--gc-text-main);

        font-family: inherit;
        font-size: 0.8rem;

        transition:
          border-color 0.18s ease,
          box-shadow 0.18s ease;
      }


      .gc-deliverable-title-field input:focus {
        border-color: var(--gc-primary);

        box-shadow:
          0 0 0 3px rgba(37, 99, 235, 0.08);
      }


      /* ================================
         SUBMISSION OPTIONS
         ================================ */

      .gc-submission-options {
        display: grid;

        grid-template-columns: 1fr 1fr;

        gap: 10px;
      }


      .gc-submission-option {
        padding: 11px;

        border: 1px solid var(--gc-border);
        border-radius: 10px;

        background: var(--gc-card);

        transition:
          border-color 0.18s ease,
          background 0.18s ease;
      }


      .gc-submission-option.gc-option-active {
        border-color: rgba(37, 99, 235, 0.35);

        background: rgba(37, 99, 235, 0.035);
      }


      .gc-option-label {
        display: flex;
        align-items: center;

        gap: 9px;

        margin: 0;

        cursor: pointer;
      }


      .gc-option-label > span:last-child {
        display: flex;
        flex-direction: column;

        gap: 2px;
      }


      .gc-option-label strong {
        color: var(--gc-text-main);

        font-size: 0.74rem;
        font-weight: 650;
      }


      .gc-option-label small {
        color: var(--gc-text-sub);

        font-size: 0.64rem;
        font-weight: 400;
      }


      .gc-option-label input,
      .gc-mandatory-option input {
        position: absolute;

        width: 1px;
        height: 1px;

        opacity: 0;

        pointer-events: none;
      }


      .gc-custom-check {
        width: 17px;
        height: 17px;

        flex-shrink: 0;

        display: inline-flex;
        align-items: center;
        justify-content: center;

        border: 1.5px solid var(--gc-border);
        border-radius: 5px;

        background: var(--gc-card);

        color: transparent;

        font-size: 0.58rem;

        transition:
          background 0.18s ease,
          border-color 0.18s ease,
          color 0.18s ease;
      }


      .gc-option-label input:checked + .gc-custom-check,
      .gc-mandatory-option input:checked + .gc-custom-check {
        border-color: var(--gc-primary);

        background: var(--gc-primary);

        color: white;
      }


      .gc-option-input {
        margin-top: 9px;
      }


      .gc-option-input input {
        width: 100%;

        box-sizing: border-box;

        padding: 7px 9px;

        border: 1px solid var(--gc-border);
        border-radius: 7px;

        outline: none;

        background: var(--gc-card);

        color: var(--gc-text-main);

        font-family: inherit;

        font-size: 0.68rem;
      }


      .gc-option-input input:focus {
        border-color: var(--gc-primary);
      }


      /* ================================
         MANDATORY
         ================================ */

      .gc-mandatory-option {
        display: inline-flex;
        align-items: center;

        gap: 8px;

        width: fit-content;

        margin: 12px 0 0;

        color: var(--gc-text-sub);

        font-size: 0.72rem;
        font-weight: 500;

        cursor: pointer;
      }


      .gc-mandatory-option .gc-custom-check {
        width: 16px;
        height: 16px;
      }


      /* ================================
         EMPTY STATE
         ================================ */

      .gc-empty-deliverables {
        padding: 25px;

        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;

        gap: 8px;

        border: 1px dashed var(--gc-border);
        border-radius: 14px;

        color: var(--gc-text-sub);

        text-align: center;
      }


      .gc-empty-deliverables > i {
        font-size: 1.5rem;
        opacity: 0.5;
      }


      .gc-empty-deliverables p {
        margin: 0 0 5px;

        font-size: 0.76rem;
      }


      /* ================================
         ERROR
         ================================ */

      .gc-error {
        display: flex;
        align-items: flex-start;

        gap: 9px;

        padding: 11px 13px;

        border: 1px solid rgba(220, 38, 38, 0.15);
        border-radius: 10px;

        background: #fef2f2;

        color: #dc2626;

        font-size: 0.78rem;
        line-height: 1.4;
      }


      .gc-error i {
        margin-top: 2px;
      }


      /* ================================
         FOOTER
         ================================ */

      .gc-modal-actions {
        flex-shrink: 0;

        display: flex;
        align-items: center;
        justify-content: flex-end;

        gap: 10px;

        padding: 16px 25px;

        border-top: 1px solid var(--gc-border);

        background: var(--gc-card-sub);
      }


      .gc-primary-btn,
      .gc-secondary-btn {
        min-height: 42px;

        display: inline-flex;
        align-items: center;
        justify-content: center;

        gap: 8px;

        padding: 0 18px;

        border-radius: 11px;

        font-family: inherit;

        font-size: 0.8rem;
        font-weight: 650;

        cursor: pointer;

        transition:
          transform 0.18s ease,
          box-shadow 0.18s ease,
          background 0.18s ease,
          border-color 0.18s ease;
      }


      .gc-primary-btn {
        border: none;

        background: linear-gradient(
          135deg,
          #2563eb,
          #4f46e5
        );

        color: white;

        box-shadow:
          0 5px 15px rgba(37, 99, 235, 0.18);
      }


      .gc-primary-btn:hover:not(:disabled) {
        transform: translateY(-1px);

        box-shadow:
          0 8px 20px rgba(37, 99, 235, 0.25);
      }


      .gc-primary-btn:disabled {
        cursor: not-allowed;

        opacity: 0.65;
      }


      .gc-secondary-btn {
        border: 1px solid var(--gc-border);

        background: var(--gc-card);

        color: var(--gc-text-main);
      }


      .gc-secondary-btn:hover {
        background: var(--gc-background);

        border-color: var(--gc-text-sub);
      }


      /* ================================
         ANIMATIONS
         ================================ */

      @keyframes gcBackdropIn {
        from {
          opacity: 0;
        }

        to {
          opacity: 1;
        }
      }


      @keyframes gcModalIn {
        from {
          opacity: 0;
          transform: translateY(10px) scale(0.98);
        }

        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }


      /* ================================
         RESPONSIVE
         ================================ */

      @media (max-width: 760px) {

        .gc-modal-backdrop {
          padding: 10px;
        }


        .gc-modern-modal {
          max-height: calc(100vh - 20px);

          border-radius: 18px;
        }


        .gc-modal-top {
          padding: 17px;
        }


        .gc-modal-content {
          padding: 18px;
        }


        .gc-modal-actions {
          padding: 14px 18px;
        }


        .gc-two-column {
          grid-template-columns: 1fr;
          gap: 12px;
        }


        .gc-submission-options {
          grid-template-columns: 1fr;
        }


        .gc-deliverables-header {
          align-items: flex-start;
          flex-direction: column;
        }


        .gc-btn-add {
          width: 100%;
        }

      }


      @media (max-width: 480px) {

        .gc-modal-title h2 {
          font-size: 1.1rem;
        }


        .gc-modal-title p {
          font-size: 0.72rem;
        }


        .gc-modal-icon {
          width: 40px;
          height: 40px;

          border-radius: 11px;

          font-size: 16px;
        }


        .gc-modal-actions {
          flex-direction: column-reverse;
        }


        .gc-primary-btn,
        .gc-secondary-btn {
          width: 100%;
        }

      }
    `
  ]
})
export class CreateMilestoneModalComponent implements OnInit {

  @Input() milestoneToEdit: Milestone | null = null;

  @Output() closeModal = new EventEmitter<void>();

  @Output() milestoneCreated = new EventEmitter<void>();


  title = '';

  description = '';

  deadline = '';

  basePoints = 100;

  maxMarks = 100;

  isSubmitting = false;

  errorMessage = '';


  deliverables: DeliverableItem[] = [
    {
      title: 'SRS Report / PDF',
      isMandatory: true,
      acceptsFile: true,
      acceptsLink: false,
      allowedFileExtensions: 'pdf'
    },
    {
      title: 'GitHub Repository URL',
      isMandatory: true,
      acceptsFile: false,
      acceptsLink: true,
      allowedLinkPatterns: 'github.com'
    }
  ];


  constructor(
    private apiService: ApiService,
    public viewStateService: ViewStateService,
    private cdr: ChangeDetectorRef
  ) {}


  ngOnInit(): void {

    if (!this.milestoneToEdit) {
      return;
    }

    this.title = this.milestoneToEdit.title || '';

    this.description = this.milestoneToEdit.description || '';

    if (this.milestoneToEdit.deadline) {
      this.deadline =
        this.milestoneToEdit.deadline.substring(0, 16);
    }

    this.basePoints =
      this.milestoneToEdit.basePoints || 100;

    this.maxMarks =
      this.milestoneToEdit.maxMarks || 100;


    if (this.milestoneToEdit.requiredDeliverables) {

      try {

        const parsed =
          JSON.parse(
            this.milestoneToEdit.requiredDeliverables
          );

        if (Array.isArray(parsed)) {

          this.deliverables = parsed.map(
            (d: any): DeliverableItem => ({
              title: d.title || '',

              isMandatory:
                d.isMandatory !== undefined
                  ? d.isMandatory
                  : true,

              acceptsFile:
                d.acceptsFile !== undefined
                  ? d.acceptsFile
                  : !!d.allowedFileExtensions,

              acceptsLink:
                d.acceptsLink !== undefined
                  ? d.acceptsLink
                  : !!d.allowedLinkPatterns,

              allowedFileExtensions:
                d.allowedFileExtensions || '',

              allowedLinkPatterns:
                d.allowedLinkPatterns || ''
            })
          );

        }

      } catch (error) {

        console.error(
          'Unable to parse required deliverables:',
          error
        );

        this.deliverables = [
          {
            title:
              this.milestoneToEdit.requiredDeliverables,

            isMandatory: true,

            acceptsFile: true,

            acceptsLink: true,

            allowedFileExtensions: '',

            allowedLinkPatterns: ''
          }
        ];
      }
    }
  }


  trackByDeliverable(
    index: number,
    item: DeliverableItem
  ): number {
    return index;
  }


  close(): void {

    if (this.isSubmitting) {
      return;
    }

    this.closeModal.emit();

    this.cdr.detectChanges();
  }


  addDeliverableRow(): void {

    this.deliverables.push({
      title: '',
      isMandatory: true,
      acceptsFile: true,
      acceptsLink: false,
      allowedFileExtensions: '',
      allowedLinkPatterns: ''
    });

    this.cdr.detectChanges();
  }


  removeDeliverableRow(index: number): void {

    if (
      index < 0 ||
      index >= this.deliverables.length
    ) {
      return;
    }

    this.deliverables.splice(index, 1);

    this.cdr.detectChanges();
  }


  onSubmit(): void {

    if (this.isSubmitting) {
      return;
    }

    this.errorMessage = '';


    const currentSubject =
      this.viewStateService.currentSubject();

    if (!currentSubject) {

      this.errorMessage =
        'Please select a subject before creating a milestone.';

      return;
    }


    const limits =
      this.viewStateService.validationLimits();


    /* ================================
       TITLE VALIDATION
       ================================ */

    const trimmedTitle =
      this.title?.trim() || '';

    if (
      trimmedTitle.length <
        limits.milestoneTitleMin ||
      trimmedTitle.length >
        limits.milestoneTitleMax
    ) {

      this.errorMessage =
        `Title must be between ` +
        `${limits.milestoneTitleMin} and ` +
        `${limits.milestoneTitleMax} characters.`;

      return;
    }


    /* ================================
       DESCRIPTION VALIDATION
       ================================ */

    const trimmedDescription =
      this.description?.trim() || '';

    if (
      trimmedDescription.length <
        limits.milestoneDescriptionMin ||
      trimmedDescription.length >
        limits.milestoneDescriptionMax
    ) {

      this.errorMessage =
        `Instructions must be between ` +
        `${limits.milestoneDescriptionMin} and ` +
        `${limits.milestoneDescriptionMax} characters.`;

      return;
    }


    /* ================================
       MARKS VALIDATION
       ================================ */

    const marks =
      Number(this.maxMarks);

    if (
      !Number.isFinite(marks) ||
      marks < 1
    ) {

      this.errorMessage =
        'Max Marks must be at least 1.';

      return;
    }


    /* ================================
       DEADLINE VALIDATION
       ================================ */

    if (!this.deadline) {

      this.errorMessage =
        'Please select a due date and time.';

      return;
    }


    /* ================================
       DELIVERABLE VALIDATION
       ================================ */

    for (
      let i = 0;
      i < this.deliverables.length;
      i++
    ) {

      const deliverable =
        this.deliverables[i];

      const deliverableTitle =
        deliverable.title?.trim() || '';


      if (!deliverableTitle) {

        this.errorMessage =
          `Please enter a name for Deliverable ${i + 1}.`;

        return;
      }


      if (
        !deliverable.acceptsFile &&
        !deliverable.acceptsLink
      ) {

        this.errorMessage =
          `Deliverable "${deliverableTitle}" ` +
          `must accept at least a file or a link.`;

        return;
      }


      if (
        deliverable.acceptsFile &&
        !deliverable.allowedFileExtensions?.trim()
      ) {

        this.errorMessage =
          `Please specify allowed file formats ` +
          `for "${deliverableTitle}".`;

        return;
      }


      if (
        deliverable.acceptsLink &&
        !deliverable.allowedLinkPatterns?.trim()
      ) {

        this.errorMessage =
          `Please specify allowed link patterns ` +
          `for "${deliverableTitle}".`;

        return;
      }
    }


    /* ================================
       REQUEST
       ================================ */

    const cleanedDeliverables =
      this.deliverables.map(item => ({

        title:
          item.title?.trim() || '',

        isMandatory:
          !!item.isMandatory,

        acceptsFile:
          !!item.acceptsFile,

        acceptsLink:
          !!item.acceptsLink,

        allowedFileExtensions:
          item.acceptsFile
            ? this.normalizeCsv(
                item.allowedFileExtensions
              )
            : '',

        allowedLinkPatterns:
          item.acceptsLink
            ? this.normalizeCsv(
                item.allowedLinkPatterns
              )
            : ''
      }));


    const req: CreateMilestoneRequest = {

      subjectId:
        currentSubject.id,

      title:
        trimmedTitle,

      description:
        trimmedDescription,

      deadline:
        this.deadline,

      basePoints:
        100.0,

      maxMarks:
        marks,

      requiredDeliverables:
        JSON.stringify(
          cleanedDeliverables
        ),

      isMandatory:
        cleanedDeliverables.some(
          d => d.isMandatory
        )
    };


    this.isSubmitting = true;


    /* ================================
       EDIT
       ================================ */

    if (this.milestoneToEdit) {

      this.apiService
        .updateMilestone(
          this.milestoneToEdit.id,
          req
        )
        .subscribe({

          next: () => {

            this.isSubmitting = false;

            this.milestoneCreated.emit();

            this.close();

            this.cdr.detectChanges();
          },

          error: (err) => {

            console.error(
              'Error updating milestone:',
              err
            );

            this.isSubmitting = false;

            this.errorMessage =
              err?.error?.message ||
              'Error updating milestone. Please try again.';

            this.cdr.detectChanges();
          }

        });

      return;
    }


    /* ================================
       CREATE
       ================================ */

    this.apiService
      .createMilestone(req)
      .subscribe({

        next: () => {

          this.isSubmitting = false;

          this.milestoneCreated.emit();

          this.close();

          this.cdr.detectChanges();
        },

        error: (err) => {

          console.error(
            'Error creating milestone:',
            err
          );

          this.isSubmitting = false;

          this.errorMessage =
            err?.error?.message ||
            'Error creating milestone. Please try again.';

          this.cdr.detectChanges();
        }

      });
  }


  private normalizeCsv(
    value?: string
  ): string {

    if (!value) {
      return '';
    }

    return value
      .split(',')
      .map(
        item =>
          item.trim().toLowerCase()
      )
      .filter(Boolean)
      .join(',');
  }
}