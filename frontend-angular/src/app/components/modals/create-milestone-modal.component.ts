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
      <div class="gc-modern-modal" (click)="$event.stopPropagation()">
        <div class="gc-modal-top">
          <div class="gc-modal-title">
            <div class="gc-modal-icon">
              <i class="fa-solid fa-file-lines"></i>
            </div>
            <div>
              <h2>{{ milestoneToEdit ? 'Edit Milestone' : 'Create Milestone' }}</h2>
              <p>Define requirements and timeline for students</p>
            </div>
          </div>
          <button type="button" class="gc-modal-close" (click)="close()">&times;</button>
        </div>
        <form (ngSubmit)="onSubmit()">
          <div class="gc-modal-content">
            <label>Title *</label>
            <div class="gc-input-box">
              <i class="fa-solid fa-heading"></i>
              <input type="text" [(ngModel)]="title" name="title" placeholder="e.g. Milestone 1: SRS Document" required>
            </div>

            <label>Instructions *</label>
            <textarea [(ngModel)]="description" name="description" rows="3" placeholder="Assignment details..." required></textarea>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem;">
              <div>
                <label>Due Date & Time *</label>
                <div class="gc-input-box">
                  <i class="fa-solid fa-calendar-days"></i>
                  <input type="datetime-local" [(ngModel)]="deadline" name="deadline" required style="padding: 10px 0;">
                </div>
              </div>
              <div>
                <label>Base Points *</label>
                <div class="gc-input-box">
                  <i class="fa-solid fa-star"></i>
                  <input type="number" [(ngModel)]="basePoints" name="basePoints" min="10" step="5" required>
                </div>
              </div>
            </div>

            <!-- Dynamic Multi-Deliverable List -->
            <div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <label style="margin: 0; font-weight: 600;">Required Deliverables</label>
                <button type="button" class="gc-btn-add" (click)="addDeliverableRow()">
                  <i class="fa-solid fa-plus"></i> Add
                </button>
              </div>

              <div style="max-height: 180px; overflow-y: auto; padding-right: 5px;">
                <div *ngFor="let item of deliverables; let i = index" class="gc-deliverable-row">
                  <input type="text" [(ngModel)]="item.title" [name]="'del_title_' + i" placeholder="e.g. SRS PDF Document" required>
                  <label class="gc-check-label">
                    <input type="checkbox" [(ngModel)]="item.isMandatory" [name]="'del_mand_' + i"> Mandatory
                  </label>
                  <button type="button" class="gc-btn-delete-row" (click)="removeDeliverableRow(i)">
                    <i class="fa-solid fa-trash-can"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div class="gc-modal-actions">
            <button type="button" class="gc-secondary-btn" (click)="close()">Cancel</button>
            <button type="submit" class="gc-primary-btn">
              {{ milestoneToEdit ? 'Save Changes' : 'Assign' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .gc-modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, .55);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 999;
    }
    .gc-modern-modal {
      width: 550px;
      background: var(--gc-card);
      border-radius: 24px;
      overflow: hidden;
      box-shadow: 0 25px 60px rgba(0,0,0,.25);
      display: flex;
      flex-direction: column;
    }
    .gc-modal-top {
      padding: 24px;
      display: flex;
      justify-content: space-between;
      border-bottom: 1px solid var(--gc-border);
      background: var(--gc-card);
    }
    .gc-modal-title {
      display: flex;
      gap: 15px;
      align-items: center;
    }
    .gc-modal-title h2 {
      margin: 0;
      font-size: 1.4rem;
      color: var(--gc-text-main);
      font-weight: 700;
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
      background: linear-gradient(135deg, #2563eb, #4f46e5);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
    }
    .gc-modal-close {
      border: none;
      background: none;
      font-size: 28px;
      cursor: pointer;
      color: var(--gc-text-sub);
    }
    .gc-modal-close:hover {
      color: var(--gc-text-main);
    }
    .gc-modal-content {
      padding: 25px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      background: var(--gc-card);
    }
    label {
      font-weight: 600;
      font-size: .85rem;
      display: block;
      margin-bottom: 4px;
      color: var(--gc-text-main);
    }
    .gc-input-box {
      display: flex;
      align-items: center;
      gap: 10px;
      border: 1px solid var(--gc-border);
      border-radius: 14px;
      padding: 0 15px;
      background: var(--gc-card);
    }
    .gc-input-box i {
      color: var(--gc-primary);
    }
    .gc-input-box input {
      padding-left: 6px;
    }
    input, textarea {
      width: 100%;
      border: none;
      outline: none;
      padding: 12px;
      background: transparent;
      font-size: .95rem;
      color: var(--gc-text-main);
    }
    textarea {
      border: 1px solid var(--gc-border);
      border-radius: 14px;
      height: 80px;
      resize: none;
      background: var(--gc-card);
      color: var(--gc-text-main);
      padding: 12px;
    }
    textarea:focus, .gc-input-box:focus-within {
      border-color: var(--gc-primary);
      box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.15);
    }
    .gc-deliverable-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: var(--gc-background);
      border: 1px solid var(--gc-border);
      padding: 0.4rem 0.65rem;
      border-radius: 10px;
      margin-bottom: 0.5rem;
    }
    .gc-deliverable-row input[type="text"] {
      flex: 1;
      padding: 8px;
      border: 1px solid var(--gc-border);
      border-radius: 8px;
      background: var(--gc-card);
      color: var(--gc-text-main);
    }
    .gc-check-label {
      font-size: 0.8rem;
      white-space: nowrap;
      display: flex;
      align-items: center;
      gap: 4px;
      margin: 0;
      font-weight: 500;
      color: var(--gc-text-main);
    }
    .gc-btn-add {
      border: none;
      background: rgba(37, 99, 235, 0.1);
      color: #2563eb;
      padding: 6px 12px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 0.8rem;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .gc-btn-add:hover {
      background: #2563eb;
      color: white;
    }
    .gc-btn-delete-row {
      border: none;
      background: none;
      color: #ef4444;
      cursor: pointer;
      padding: 6px;
      font-size: 1.1rem;
    }
    .gc-btn-delete-row:hover {
      color: #dc2626;
    }
    .gc-modal-actions {
      padding: 20px 25px;
      border-top: 1px solid var(--gc-border);
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      background: var(--gc-card-sub);
    }
    .gc-primary-btn {
      background: linear-gradient(135deg, #2563eb, #4f46e5);
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .gc-primary-btn:hover {
      box-shadow: 0 10px 20px rgba(37,99,235,.2);
      transform: translateY(-1px);
    }
    .gc-secondary-btn {
      background: var(--gc-card);
      border: 1px solid var(--gc-border);
      color: var(--gc-text-main);
      padding: 12px 24px;
      border-radius: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .gc-secondary-btn:hover {
      background: var(--gc-border);
    }
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
