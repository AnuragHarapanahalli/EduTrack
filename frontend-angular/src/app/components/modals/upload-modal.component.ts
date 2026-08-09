import { Component, Input, Output, EventEmitter, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { ViewStateService } from '../../services/view-state.service';
import { Milestone, DeliverableItem } from '../../models/milestone.model';

@Component({
  selector: 'app-upload-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="gc-modal-backdrop" (click)="close()">
      <div class="gc-modal-card" style="max-width: 560px;" (click)="$event.stopPropagation()">
        <div class="gc-modal-header" style="flex-direction: column; align-items: flex-start; gap: 6px; border-bottom: 1px solid var(--gc-border);">
          <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
            <h3 style="margin: 0; font-size: 1.25rem;">Submit Assignment Work</h3>
            <button type="button" class="gc-close-btn" (click)="close()" style="font-size: 1.5rem; line-height: 1; background: none; border: none; cursor: pointer;">&times;</button>
          </div>
          <div style="margin-top: 4px; width: 100%;">
            <h4 style="margin: 0 0 6px 0; color: var(--gc-primary); font-size: 1.05rem; font-weight: 700;">{{ milestone.title }}</h4>
            <p style="margin: 0; font-size: 0.85rem; color: var(--gc-text-sub); line-height: 1.4; white-space: pre-wrap; font-weight: 400; max-height: 100px; overflow-y: auto;">
              {{ milestone.description }}
            </p>
          </div>
        </div>
        <form (ngSubmit)="onSubmit()">
          <div class="gc-modal-body" style="max-height: 55vh; overflow-y: auto;">
            <div *ngFor="let item of deliverablesList; let i = index" class="gc-deliverable-upload-box">
              <div class="gc-upload-header">
                <strong>Deliverable {{ i + 1 }}: {{ item.title }}</strong>
                <span class="gc-badge" [class.gc-badge-danger]="item.isMandatory" [class.gc-badge-info]="!item.isMandatory">
                  {{ item.isMandatory ? 'Mandatory' : 'Optional' }}
                </span>
              </div>
              <div class="gc-form-field">
                <label>Upload File</label>
                <div class="gc-file-upload-wrapper">
                  <input type="file" id="fileInput_{{i}}" class="gc-file-input-hidden" (change)="onFileSelected($event, i)">
                  <label for="fileInput_{{i}}" class="gc-file-upload-trigger" [class.has-file]="filesMap[i]">
                    <i class="fa-solid" [class.fa-cloud-arrow-up]="!filesMap[i]" [class.fa-circle-check]="filesMap[i]"></i>
                    <span>{{ filesMap[i] ? filesMap[i].name : 'Choose file or drag here' }}</span>
                  </label>
                </div>
              </div>
              <div class="gc-form-field" style="margin-bottom:0;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                  <label style="margin: 0;">OR Repository / Video Link</label>
                  <span style="font-size: 0.72rem; color: var(--gc-text-sub);">
                    {{ linksMap[i]?.trim()?.length || 0 }} / {{ viewStateService.validationLimits().submissionLinkMax }}
                  </span>
                </div>
                <input type="url" [(ngModel)]="linksMap[i]" [name]="'link_' + i" placeholder="https://github.com/user/project">
              </div>
            </div>

            <div class="gc-form-field" style="margin-top: 1rem;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                <label style="margin: 0;">Private comments for teacher</label>
                <span style="font-size: 0.72rem; color: var(--gc-text-sub);">
                  {{ comments?.trim()?.length || 0 }} / {{ viewStateService.validationLimits().submissionCommentsMax }}
                </span>
              </div>
              <textarea [(ngModel)]="comments" name="comments" rows="2" placeholder="Add comments..."></textarea>
            </div>
          </div>
          <div class="gc-modal-footer">
            <button type="button" class="gc-btn gc-btn-flat" (click)="close()">Cancel</button>
            <button type="submit" class="gc-btn gc-btn-primary"><i class="fa-solid fa-check"></i> Turn in</button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .gc-deliverable-upload-box { background: var(--gc-background); border: 1px solid var(--gc-border); border-radius: var(--gc-radius-md); padding: 1.25rem; margin-bottom: 1.25rem; }
    .gc-upload-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; font-size: 0.88rem; }
    
    .gc-form-field {
      margin-bottom: 1.25rem;
    }
    .gc-form-field label {
      display: block;
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--gc-text-sub);
      margin-bottom: 0.5rem;
    }
    .gc-form-field input[type="url"],
    .gc-form-field textarea {
      width: 100%;
      margin-top: 0.35rem;
    }

    .gc-file-upload-wrapper {
      position: relative;
      width: 100%;
      margin-top: 0.35rem;
    }
    .gc-file-input-hidden {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      opacity: 0;
      cursor: pointer;
      z-index: 2;
    }
    .gc-file-upload-trigger {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 10px;
      padding: 1.5rem 1rem;
      border: 2px dashed var(--gc-border);
      border-radius: var(--gc-radius-md);
      background: var(--gc-card-sub, #f1f5f9);
      cursor: pointer;
      transition: all 0.2s ease;
      color: var(--gc-text-sub);
      text-align: center;
    }
    .gc-file-upload-trigger i {
      font-size: 1.6rem;
      color: var(--gc-primary);
      transition: transform 0.2s ease;
    }
    .gc-file-upload-wrapper:hover .gc-file-upload-trigger {
      border-color: var(--gc-primary);
      background: rgba(37, 99, 235, 0.04);
      color: var(--gc-text-main);
    }
    .gc-file-upload-wrapper:hover .gc-file-upload-trigger i {
      transform: translateY(-2px);
    }
    .gc-file-upload-trigger.has-file {
      border-color: var(--gc-success, #10b981);
      background: rgba(16, 185, 129, 0.04);
      color: var(--gc-text-main);
    }
    .gc-file-upload-trigger.has-file i {
      color: var(--gc-success, #10b981);
    }
  `]
})
export class UploadModalComponent implements OnInit {
  @Input() milestone!: Milestone;
  @Output() closeModal = new EventEmitter<void>();
  @Output() workSubmitted = new EventEmitter<void>();

  deliverablesList: DeliverableItem[] = [];
  filesMap: { [index: number]: File } = {};
  linksMap: { [index: number]: string } = {};
  comments = '';

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    public viewStateService: ViewStateService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    if (this.milestone && this.milestone.requiredDeliverables) {
      try {
        const parsed = JSON.parse(this.milestone.requiredDeliverables);
        if (Array.isArray(parsed)) this.deliverablesList = parsed;
      } catch (e) {
        this.deliverablesList = [{ title: this.milestone.requiredDeliverables, isMandatory: true }];
      }
    } else {
      this.deliverablesList = [{ title: 'Main Project Deliverable File', isMandatory: true }];
    }
  }

  close() {
    this.closeModal.emit();
    this.cdr.detectChanges();
  }

  onFileSelected(event: any, index: number) {
    if (event.target.files.length > 0) {
      this.filesMap[index] = event.target.files[0];
      this.cdr.detectChanges();
    }
  }

  onSubmit() {
    const user = this.authService.currentUser();
    if (!user || !this.milestone) return;

    const limits = this.viewStateService.validationLimits();

    const hasFile = Object.keys(this.filesMap).length > 0;
    const hasLink = Object.values(this.linksMap).some(
      link => link && link.trim().length > 0
    );

    if (!hasFile && !hasLink) {
      alert('Please upload at least one file or provide one submission link.');
      return;
    }

    // Check link length
    const firstLink = Object.values(this.linksMap).find(
      link => link && link.trim().length > 0
    );
    if (firstLink && firstLink.trim().length > limits.submissionLinkMax) {
      alert(`Submission Link must not exceed ${limits.submissionLinkMax} characters.`);
      return;
    }

    if (this.comments && this.comments.trim().length > limits.submissionCommentsMax) {
      alert(`Private comments must not exceed ${limits.submissionCommentsMax} characters.`);
      return;
    }

    const formData = new FormData();
    formData.append('milestoneId', this.milestone.id.toString());
    formData.append('studentId', user.id.toString());

    // Upload first file (backend currently accepts one file)
    const firstFile = Object.values(this.filesMap)[0];
    if (firstFile) {
      formData.append('file', firstFile);
    }

    // Upload first link
    if (firstLink) {
      formData.append('submissionLink', firstLink.trim());
    }

    if (this.comments.trim()) {
      formData.append('comments', this.comments.trim());
    }

    this.apiService.uploadSubmission(formData).subscribe({
      next: () => {
        alert('Assignment submitted successfully.');
        this.workSubmitted.emit();
        this.close();
      },
      error: (err) => {
        console.error(err);
        alert(err?.error?.message || 'Failed to submit assignment.');
      }
    });
  }
}
