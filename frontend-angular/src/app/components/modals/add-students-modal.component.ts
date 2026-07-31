import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { ViewStateService } from '../../services/view-state.service';

@Component({
  selector: 'app-add-students-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="gc-modal-backdrop" (click)="close()">
      <div class="gc-modal-card" (click)="$event.stopPropagation()">
        <div class="gc-modal-header">
          <h3>Invite students</h3>
          <button class="gc-close-btn" (click)="close()">&times;</button>
        </div>
        <div class="gc-modal-body">
          <div class="gc-tab-switcher">
            <button class="gc-tab-switcher-btn" [class.active]="isManual" (click)="isManual = true">Manual Entry</button>
            <button class="gc-tab-switcher-btn" [class.active]="!isManual" (click)="isManual = false">Import CSV</button>
          </div>

          @if (isManual) {
            <form (submit)="onManualSubmit()">
              <div class="gc-form-field">
                <label>Student full name</label>
                <input type="text" [(ngModel)]="fullName" name="fullName" placeholder="e.g. John Doe" required>
              </div>
              <div class="gc-form-field">
                <label>Student email address</label>
                <input type="email" [(ngModel)]="email" name="email" placeholder="johndoe@edutrack.edu" required>
              </div>
              <div class="gc-modal-footer" style="padding:0; background:transparent;">
                <button type="button" class="gc-btn gc-btn-flat" (click)="close()">Cancel</button>
                <button type="submit" class="gc-btn gc-btn-primary">Invite</button>
              </div>
            </form>
          } @else {
            <div>
              <div class="gc-template-box">
                <i class="fa-solid fa-file-csv gc-template-icon"></i>
                <div>
                  <strong>Standard Student CSV Template</strong>
                  <p>Format: <code>FullName,Email</code></p>
                </div>
                <button type="button" class="gc-btn gc-btn-flat" (click)="downloadTemplate()"><i class="fa-solid fa-download"></i> Download</button>
              </div>

              <div class="gc-form-field" style="margin-top:1rem;">
                <label>Upload CSV File</label>
                <input type="file" (change)="onFileSelected($event)" accept=".csv">
              </div>

              <div class="gc-modal-footer" style="padding:0; background:transparent;">
                <button type="button" class="gc-btn gc-btn-flat" (click)="close()">Cancel</button>
                <button type="button" class="gc-btn gc-btn-primary" (click)="processCsv()">Upload Roster</button>
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .gc-tab-switcher { display: flex; border-bottom: 1px solid var(--gc-border); margin-bottom: 1.25rem; }
    .gc-tab-switcher-btn { flex: 1; padding: 0.5rem; background: none; border: none; border-bottom: 2px solid transparent; cursor: pointer; font-size: 0.85rem; font-weight: 500; }
    .gc-tab-switcher-btn.active { color: var(--gc-primary); border-bottom-color: var(--gc-primary); }
    .gc-template-box { background: var(--gc-background); border: 1px solid var(--gc-border); padding: 0.85rem; border-radius: var(--gc-radius-md); display: flex; align-items: center; justify-content: space-between; font-size: 0.82rem; }
    .gc-template-icon { font-size: 1.5rem; color: var(--gc-primary); }
  `]
})
export class AddStudentsModalComponent {
  @Output() closeModal = new EventEmitter<void>();
  @Output() studentsAdded = new EventEmitter<void>();

  isManual = true;
  fullName = '';
  email = '';
  selectedFile: File | null = null;

  constructor(
    private apiService: ApiService,
    private viewStateService: ViewStateService
  ) {}

  close() {
    this.closeModal.emit();
  }

  onManualSubmit() {
    const currentSubject = this.viewStateService.currentSubject();
    if (!currentSubject) return;

    this.apiService.addStudentToSubjectManual(currentSubject.id, this.fullName, this.email).subscribe({
      next: () => {
        this.studentsAdded.emit();
        this.close();
      }
    });
  }

  downloadTemplate() {
    const csvContent = "FullName,Email\nJohn Doe,johndoe@edutrack.edu\nJane Smith,janesmith@edutrack.edu\n";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "EduTrack_Student_Import_Template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  onFileSelected(event: any) {
    if (event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
    }
  }

  processCsv() {
    if (!this.selectedFile) return;
    const currentSubject = this.viewStateService.currentSubject();
    if (!currentSubject) return;

    const reader = new FileReader();
    reader.onload = (e: any) => {
      const lines = e.target.result.split(/\r\n|\n/);
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const parts = line.split(',');
        if (parts.length >= 2) {
          const name = parts[0].trim();
          const em = parts[1].trim();
          if (name && em) {
            this.apiService.addStudentToSubjectManual(currentSubject.id, name, em).subscribe();
          }
        }
      }
      this.studentsAdded.emit();
      this.close();
    };
    reader.readAsText(this.selectedFile);
  }
}
