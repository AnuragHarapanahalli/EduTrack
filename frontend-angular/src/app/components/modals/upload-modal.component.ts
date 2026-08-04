import { Component, Input, Output, EventEmitter, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { Milestone, DeliverableItem } from '../../models/milestone.model';

@Component({
  selector: 'app-upload-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="gc-modal-backdrop" (click)="close()">
      <div class="gc-modal-card" style="max-width: 560px;" (click)="$event.stopPropagation()">
        <div class="gc-modal-header">
          <h3>Submit Assignment Work</h3>
          <button class="gc-close-btn" (click)="close()">&times;</button>
        </div>
        <form (ngSubmit)="onSubmit()">
          <div class="gc-modal-body" style="max-height: 75vh; overflow-y: auto;">
            <div *ngFor="let item of deliverablesList; let i = index" class="gc-deliverable-upload-box">
              <div class="gc-upload-header">
                <strong>Deliverable {{ i + 1 }}: {{ item.title }}</strong>
                <span class="gc-badge" [class.gc-badge-danger]="item.isMandatory" [class.gc-badge-info]="!item.isMandatory">
                  {{ item.isMandatory ? 'Mandatory' : 'Optional' }}
                </span>
              </div>
              <div class="gc-form-field">
                <label>Upload File</label>
                <input type="file" (change)="onFileSelected($event, i)">
              </div>
              <div class="gc-form-field" style="margin-bottom:0;">
                <label>OR Repository / Video Link</label>
                <input type="url" [(ngModel)]="linksMap[i]" [name]="'link_' + i" placeholder="https://github.com/user/project">
              </div>
            </div>

            <div class="gc-form-field" style="margin-top: 1rem;">
              <label>Private comments for teacher</label>
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
    .gc-deliverable-upload-box { background: var(--gc-background); border: 1px solid var(--gc-border); border-radius: var(--gc-radius-md); padding: 1rem; margin-bottom: 1rem; }
    .gc-upload-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.75rem; font-size: 0.85rem; }
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

  const hasFile = Object.keys(this.filesMap).length > 0;
  const hasLink = Object.values(this.linksMap).some(
    link => link && link.trim().length > 0
  );

  if (!hasFile && !hasLink) {
    alert('Please upload at least one file or provide one submission link.');
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
  const firstLink = Object.values(this.linksMap).find(
    link => link && link.trim().length > 0
  );
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
      alert('Failed to submit assignment.');
    }
  });
}
  
}
