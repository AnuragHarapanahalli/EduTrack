import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { ViewStateService } from '../../services/view-state.service';
import { CreateSubjectRequest } from '../../models/subject.model';

@Component({
  selector: 'app-create-subject-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="gc-modal-backdrop" (click)="close()">
      <div class="gc-modal-card" (click)="$event.stopPropagation()">
        <div class="gc-modal-header">
          <h3>Create class</h3>
          <button class="gc-close-btn" (click)="close()">&times;</button>
        </div>
        <form (submit)="onSubmit()">
          <div class="gc-modal-body">
            <div class="gc-form-field">
              <label>Class name (required)</label>
              <input type="text" [(ngModel)]="name" name="name" placeholder="e.g. CSE20140 - Project Based Learning III" required>
            </div>
            <div class="gc-form-field">
              <label>Class code (required)</label>
              <input type="text" [(ngModel)]="code" name="code" placeholder="e.g. CSE20140-PBL3" required>
            </div>
            <div class="gc-form-field">
              <label>Description / Overview</label>
              <textarea [(ngModel)]="description" name="description" rows="3" placeholder="Course details..." required></textarea>
            </div>
          </div>
          <div class="gc-modal-footer">
            <button type="button" class="gc-btn gc-btn-flat" (click)="close()">Cancel</button>
            <button type="submit" class="gc-btn gc-btn-primary">Create</button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class CreateSubjectModalComponent {
  @Output() closeModal = new EventEmitter<void>();
  @Output() subjectCreated = new EventEmitter<void>();

  name = '';
  code = '';
  description = '';

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private viewStateService: ViewStateService
  ) {}

  close() {
    this.closeModal.emit();
  }

  onSubmit() {
    const user = this.authService.currentUser();
    if (!user) return;

    const req: CreateSubjectRequest = {
      name: this.name,
      code: this.code,
      batchId: 1,
      description: this.description
    };

    this.apiService.createSubject(req, user.id).subscribe({
      next: (newSubj) => {
        this.viewStateService.selectSubject(newSubj);
        this.subjectCreated.emit();
        this.close();
      }
    });
  }
}
