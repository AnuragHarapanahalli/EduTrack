import { Component, Input, Output, EventEmitter, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { ViewStateService } from '../../services/view-state.service';
import { Milestone, CreateMilestoneRequest, DeliverableItem } from '../../models/milestone.model';

@Component({
  selector: 'app-create-milestone-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="gc-modal-backdrop" (click)="close()">
      <div class="gc-modal-card" style="max-width: 600px;" (click)="$event.stopPropagation()">
        <div class="gc-modal-header">
          <h3>{{ milestoneToEdit ? 'Edit Milestone Assignment' : 'Create Milestone Assignment' }}</h3>
          <button type="button" class="gc-close-btn" (click)="close()">&times;</button>
        </div>
        <form (ngSubmit)="onSubmit()">
          <div class="gc-modal-body" style="max-height: 75vh; overflow-y: auto;">
            <div class="gc-form-field">
              <label>Title</label>
              <input type="text" [(ngModel)]="title" name="title" placeholder="e.g. Milestone 1: SRS Document" required>
            </div>
            <div class="gc-form-field">
              <label>Instructions</label>
              <textarea [(ngModel)]="description" name="description" rows="3" placeholder="Assignment details..." required></textarea>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
              <div class="gc-form-field">
                <label>Due date & time</label>
                <input type="datetime-local" [(ngModel)]="deadline" name="deadline" required>
              </div>
              <div class="gc-form-field">
                <label>Base Points</label>
                <input type="number" [(ngModel)]="basePoints" name="basePoints" min="10" step="5" required>
              </div>
            </div>

            <!-- Dynamic Multi-Deliverable List -->
            <div class="gc-form-field">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                <label style="margin: 0;">Required Deliverables</label>
                <button type="button" class="gc-btn gc-btn-flat" style="padding: 0.25rem 0.5rem; font-size: 0.8rem;" (click)="addDeliverableRow()">
                  <i class="fa-solid fa-plus"></i> Add Deliverable
                </button>
              </div>

              <div *ngFor="let item of deliverables; let i = index" class="gc-deliverable-row">
                <input type="text" [(ngModel)]="item.title" [name]="'del_title_' + i" placeholder="e.g. SRS PDF Document" required>
                <label class="gc-check-label">
                  <input type="checkbox" [(ngModel)]="item.isMandatory" [name]="'del_mand_' + i"> Mandatory
                </label>
                <button type="button" class="gc-btn gc-btn-flat" (click)="removeDeliverableRow(i)">
                  <i class="fa-solid fa-xmark"></i>
                </button>
              </div>
            </div>
          </div>
          <div class="gc-modal-footer">
            <button type="button" class="gc-btn gc-btn-flat" (click)="close()">Cancel</button>
            <button type="submit" class="gc-btn gc-btn-primary">
              {{ milestoneToEdit ? 'Save Changes' : 'Assign' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .gc-deliverable-row { display: flex; align-items: center; gap: 0.5rem; background: var(--gc-background); border: 1px solid var(--gc-border); padding: 0.5rem 0.75rem; border-radius: var(--gc-radius-md); margin-bottom: 0.5rem; }
    .gc-deliverable-row input[type="text"] { flex: 1; }
    .gc-check-label { font-size: 0.8rem; white-space: nowrap; }
  `]
})
export class CreateMilestoneModalComponent implements OnInit {
  @Input() milestoneToEdit: Milestone | null = null;
  @Output() closeModal = new EventEmitter<void>();
  @Output() milestoneCreated = new EventEmitter<void>();

  title = '';
  description = '';
  deadline = '';
  basePoints = 100;
  deliverables: DeliverableItem[] = [
    { title: 'SRS Report / PDF', isMandatory: true },
    { title: 'GitHub Repository URL', isMandatory: true }
  ];

  constructor(
    private apiService: ApiService,
    private viewStateService: ViewStateService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    if (this.milestoneToEdit) {
      this.title = this.milestoneToEdit.title;
      this.description = this.milestoneToEdit.description;
      if (this.milestoneToEdit.deadline) {
        this.deadline = this.milestoneToEdit.deadline.substring(0, 16);
      }
      this.basePoints = this.milestoneToEdit.basePoints || 100;
      if (this.milestoneToEdit.requiredDeliverables) {
        try {
          const parsed = JSON.parse(this.milestoneToEdit.requiredDeliverables);
          if (Array.isArray(parsed)) this.deliverables = parsed;
        } catch (e) {
          this.deliverables = [{ title: this.milestoneToEdit.requiredDeliverables, isMandatory: true }];
        }
      }
    }
  }

  close() {
    this.closeModal.emit();
    this.cdr.detectChanges();
  }

  addDeliverableRow() {
    this.deliverables.push({ title: '', isMandatory: true });
    this.cdr.detectChanges();
  }

  removeDeliverableRow(index: number) {
    this.deliverables.splice(index, 1);
    this.cdr.detectChanges();
  }

  onSubmit() {
    const currentSubject = this.viewStateService.currentSubject();
    if (!currentSubject) return;

    const req: CreateMilestoneRequest = {
      subjectId: currentSubject.id,
      title: this.title,
      description: this.description,
      deadline: this.deadline,
      basePoints: this.basePoints,
      requiredDeliverables: JSON.stringify(this.deliverables),
      isMandatory: this.deliverables.some(d => d.isMandatory)
    };

    if (this.milestoneToEdit) {
      this.apiService.updateMilestone(this.milestoneToEdit.id, req).subscribe({
        next: () => {
          this.milestoneCreated.emit();
          this.close();
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error updating milestone:', err);
          this.cdr.detectChanges();
        }
      });
    } else {
      this.apiService.createMilestone(req).subscribe({
        next: () => {
          this.milestoneCreated.emit();
          this.close();
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error creating milestone:', err);
          this.cdr.detectChanges();
        }
      });
    }
  }
}
