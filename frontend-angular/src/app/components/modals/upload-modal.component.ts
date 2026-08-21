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
        <form (ngSubmit)="onSubmit()" novalidate>
          <div class="gc-modal-body" style="max-height: 55vh; overflow-y: auto;">
            <div *ngFor="let item of deliverablesList; let i = index" class="gc-deliverable-upload-box">
              <div class="gc-upload-header">
                <strong>Deliverable {{ i + 1 }}: {{ item.title }}</strong>
                <span class="gc-badge" [class.gc-badge-danger]="item.isMandatory" [class.gc-badge-info]="!item.isMandatory">
                  {{ item.isMandatory ? 'Mandatory' : 'Optional' }}
                </span>
              </div>
              <!-- FILE UPLOAD FIELD -->
              <div class="gc-form-field" *ngIf="item.acceptsFile !== false">
                <label>Upload File</label>
                <div class="gc-file-upload-wrapper">
                  <input type="file" id="fileInput_{{i}}" class="gc-file-input-hidden" (change)="onFileSelected($event, i)">
                  <label for="fileInput_{{i}}" class="gc-file-upload-trigger" [class.has-file]="filesMap[i] || existingFilesMap[i]">
                    <i class="fa-solid" [class.fa-cloud-arrow-up]="!filesMap[i] && !existingFilesMap[i]" [class.fa-circle-check]="filesMap[i] || existingFilesMap[i]"></i>
                    <span>{{ filesMap[i] ? filesMap[i].name : (existingFilesMap[i] ? 'Uploaded: ' + existingFilesMap[i] : 'Choose file or drag here') }}</span>
                  </label>
                </div>
                <small style="display:block; margin-top:6px; color: var(--gc-text-sub);">
                  Max size: {{ formatBytes(viewStateService.validationLimits().submissionFileMaxBytes) }}
                  <span *ngIf="allowedFileFormatsFor(item)"> | Allowed: {{ allowedFileFormatsFor(item) }}</span>
                </small>
              </div>

              <!-- LINK SUBMISSION FIELD -->
              <div class="gc-form-field" style="margin-bottom:0;" *ngIf="item.acceptsLink !== false">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                  <label style="margin: 0;">Repository / Video Link</label>
                  <div class="gc-link-meta-right">
                    <span *ngIf="linkErrorsMap[i]" class="gc-inline-link-error">{{ linkErrorsMap[i] }}</span>
                    <span style="font-size: 0.72rem; color: var(--gc-text-sub);">
                      {{ linksMap[i]?.trim()?.length || 0 }} / {{ viewStateService.validationLimits().submissionLinkMax }}
                    </span>
                  </div>
                </div>
                <input
                  type="text"
                  [(ngModel)]="linksMap[i]"
                  [name]="'link_' + i"
                  (ngModelChange)="onLinkInputChange(i)"
                  (blur)="validateLinkForIndex(i)"
                  [class.gc-input-error]="!!linkErrorsMap[i]"
                  placeholder="github.com/user/project">
                <small *ngIf="allowedLinkFormatsFor(item)" style="display:block; margin-top:6px; color: var(--gc-text-sub);">
                  Allowed link format: {{ allowedLinkFormatsFor(item) }}
                </small>
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
    .gc-form-field input[type="text"],
    .gc-form-field textarea {
      width: 100%;
      margin-top: 0.35rem;
    }

    .gc-link-meta-right {
      display: flex;
      align-items: center;
      gap: 10px;
      justify-content: flex-end;
      min-height: 18px;
    }

    .gc-inline-link-error {
      font-size: 0.72rem;
      font-weight: 600;
      color: var(--gc-danger);
      background: color-mix(in srgb, var(--gc-danger) 10%, transparent);
      border: 1px solid color-mix(in srgb, var(--gc-danger) 28%, transparent);
      border-radius: 999px;
      padding: 2px 8px;
      line-height: 1.2;
      max-width: 260px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .gc-input-error {
      border-color: var(--gc-danger) !important;
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--gc-danger) 18%, transparent) !important;
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
  existingFilesMap: { [index: number]: string } = {};
  linksMap: { [index: number]: string } = {};
  linkErrorsMap: { [index: number]: string } = {};
  comments = '';

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    public viewStateService: ViewStateService,
    private cdr: ChangeDetectorRef
  ) {}

  private getFileNameFromUrl(url: string): string {
    if (!url) return '';
    const parts = url.split('/');
    return parts[parts.length - 1];
  }

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

    if (this.milestone && this.milestone.userSubmission) {
      const sub = this.milestone.userSubmission;
      if (sub.comments) {
        this.comments = sub.comments;
      }
      if (sub.submissionLink) {
        let linkIndex = this.deliverablesList.findIndex(d => d.acceptsLink !== false && (this.allowedLinkFormatsFor(d) || !this.allowedFileFormatsFor(d)));
        if (linkIndex === -1) linkIndex = 0;
        this.linksMap[linkIndex] = sub.submissionLink;
      }
      if (sub.fileUrl) {
        let fileIndex = this.deliverablesList.findIndex(d => d.acceptsFile !== false && (this.allowedFileFormatsFor(d) || !this.allowedLinkFormatsFor(d)));
        if (fileIndex === -1) fileIndex = 0;
        this.existingFilesMap[fileIndex] = this.getFileNameFromUrl(sub.fileUrl);
      }
    }
  }

  close() {
    this.closeModal.emit();
    this.cdr.detectChanges();
  }

  onFileSelected(event: any, index: number) {
    const selectedFile: File | undefined = event?.target?.files?.[0];
    if (!selectedFile) return;

    const limits = this.viewStateService.validationLimits();
    if (selectedFile.size > limits.submissionFileMaxBytes) {
      alert(
        `File size exceeded. Max allowed size is ${this.formatBytes(limits.submissionFileMaxBytes)}. ` +
        `Selected file size is ${this.formatBytes(selectedFile.size)}.`
      );
      delete this.filesMap[index];
      event.target.value = '';
      this.cdr.detectChanges();
      return;
    }

    if (!this.isFileAllowedForIndex(selectedFile, index)) {
      const allowedList = this.allowedFileFormatsFor(this.deliverablesList[index]);
      alert(`File format not allowed. Teacher allowed only: ${allowedList}.`);
      delete this.filesMap[index];
      event.target.value = '';
      this.cdr.detectChanges();
      return;
    }

    this.filesMap[index] = selectedFile;
    this.cdr.detectChanges();
  }

  validateLinkForIndex(index: number): boolean {
    const link = this.linksMap[index]?.trim();
    if (!link) {
      this.clearLinkError(index);
      return true;
    }

    const limits = this.viewStateService.validationLimits();
    if (link.length > limits.submissionLinkMax) {
      this.linkErrorsMap[index] = `Max ${limits.submissionLinkMax} characters`;
      this.cdr.detectChanges();
      return false;
    }

    if (!this.isValidSubmissionLink(link)) {
      this.linkErrorsMap[index] = 'Enter a valid link';
      this.cdr.detectChanges();
      return false;
    }

    if (!this.isLinkAllowedForIndex(link, index)) {
      const allowedList = this.allowedLinkFormatsFor(this.deliverablesList[index]);
      this.linkErrorsMap[index] = `Allowed: ${allowedList}`;
      this.cdr.detectChanges();
      return false;
    }

    this.clearLinkError(index);
    return true;
  }

  onLinkInputChange(index: number) {
    if (this.linkErrorsMap[index]) {
      this.clearLinkError(index);
      this.cdr.detectChanges();
    }
  }

  onSubmit() {
    const user = this.authService.currentUser();
    if (!user || !this.milestone) return;

    const limits = this.viewStateService.validationLimits();

    const hasFile = Object.keys(this.filesMap).length > 0 || Object.keys(this.existingFilesMap).length > 0;
    const hasLink = Object.values(this.linksMap).some(
      link => link && link.trim().length > 0
    );

    // Validate that all mandatory deliverables are provided (either as a file or a link)
    for (let i = 0; i < this.deliverablesList.length; i++) {
      const item = this.deliverablesList[i];
      if (item.isMandatory) {
        const hasFileOrExisting = !!this.filesMap[i] || !!this.existingFilesMap[i];
        const hasLinkVal = !!(this.linksMap[i] && this.linksMap[i].trim().length > 0);
        if (!hasFileOrExisting && !hasLinkVal) {
          alert(`Please provide a file or link for the mandatory deliverable: "${item.title}".`);
          return;
        }
      }
    }

    if (!hasFile && !hasLink) {
      alert('Please upload at least one file or provide one submission link.');
      return;
    }

    const linkIndexes = Object.keys(this.linksMap).map(key => Number(key));
    for (const index of linkIndexes) {
      if (!this.validateLinkForIndex(index)) return;
    }

    const firstLinkEntry = Object.entries(this.linksMap)[0];
    const firstLink = firstLinkEntry ? firstLinkEntry[1] : undefined;

    if (this.comments && this.comments.trim().length > limits.submissionCommentsMax) {
      alert(`Private comments must not exceed ${limits.submissionCommentsMax} characters.`);
      return;
    }

    const formData = new FormData();
    formData.append('milestoneId', this.milestone.id.toString());
    formData.append('studentId', user.id.toString());

    // Upload first file (backend currently accepts one file)
    const firstFileEntry = Object.entries(this.filesMap)[0];
    const firstFile = firstFileEntry?.[1];
    if (firstFile) {
      formData.append('file', firstFile);
    }

    // Upload first link
    if (firstLink !== undefined) {
      formData.append('submissionLink', firstLink.trim());
    }

    const firstIndex = firstFileEntry
      ? Number(firstFileEntry[0])
      : (firstLinkEntry ? Number(firstLinkEntry[0]) : null);
    if (firstIndex !== null && !Number.isNaN(firstIndex)) {
      formData.append('deliverableIndex', firstIndex.toString());
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

  allowedFileFormatsFor(item: DeliverableItem | undefined): string {
    const values = this.parseCsv(item?.allowedFileExtensions);
    return values.length ? values.join(', ') : '';
  }

  allowedLinkFormatsFor(item: DeliverableItem | undefined): string {
    const values = this.parseCsv(item?.allowedLinkPatterns);
    return values.length ? values.join(', ') : '';
  }

  formatBytes(bytes: number): string {
    if (!bytes || bytes <= 0) return '0 B';
    const mb = bytes / (1024 * 1024);
    if (mb >= 1) return `${mb.toFixed(1)} MB`;
    const kb = bytes / 1024;
    return `${kb.toFixed(1)} KB`;
  }

  private isFileAllowedForIndex(file: File, index: number): boolean {
    const allowed = this.parseCsv(this.deliverablesList[index]?.allowedFileExtensions);
    if (!allowed.length) return true;
    const extension = this.extractExtension(file.name).toLowerCase();
    return !!extension && allowed.includes(extension);
  }

  private isLinkAllowedForIndex(link: string, index: number): boolean {
    const allowed = this.parseCsv(this.deliverablesList[index]?.allowedLinkPatterns);
    if (!allowed.length) return true;
    return allowed.some(pattern => this.linkMatchesPattern(link, pattern));
  }

  private isValidSubmissionLink(link: string): boolean {
    return this.parseLinkParts(link) !== null;
  }

  private linkMatchesPattern(link: string, pattern: string): boolean {
    if (!pattern || !pattern.trim()) return false;

    const linkParts = this.parseLinkParts(link);
    if (!linkParts) return false;

    const normalizedPattern = pattern.trim().toLowerCase();
    const patternParts = this.parseLinkParts(normalizedPattern);
    if (!patternParts) {
      return this.normalizeHost(linkParts.host).includes(normalizedPattern);
    }

    const linkHost = this.normalizeHost(linkParts.host);
    const patternHost = this.normalizeHost(patternParts.host);
    if (!patternHost) return false;

    const hostMatches = linkHost === patternHost || linkHost.endsWith(`.${patternHost}`);
    if (!hostMatches) return false;

    const requiredPath = this.normalizePath(patternParts.path);
    if (!requiredPath) return true;

    const linkPath = this.normalizePath(linkParts.path);
    return linkPath === requiredPath || linkPath.startsWith(`${requiredPath}/`);
  }

  private parseLinkParts(value: string): { host: string; path: string } | null {
    const trimmed = (value || '').trim();
    if (!trimmed) return null;

    const hasScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed);
    const candidate = hasScheme ? trimmed : `//${trimmed}`;
    const parsed = /^(?:[a-z][a-z0-9+.-]*:)?\/\/([^\/?#:]+)(?::\d+)?(\/[^?#]*)?/i.exec(candidate);
    if (!parsed || !parsed[1]) return null;

    return {
      host: parsed[1],
      path: parsed[2] || ''
    };
  }

  private normalizeHost(host?: string): string {
    return (host || '').trim().toLowerCase();
  }

  private normalizePath(path?: string): string {
    if (!path || path === '/') return '';
    const normalized = path.trim().toLowerCase();
    return normalized.endsWith('/') ? normalized.slice(0, -1) : normalized;
  }

  private extractExtension(fileName: string): string {
    const dotIndex = fileName.lastIndexOf('.');
    if (dotIndex < 0 || dotIndex === fileName.length - 1) return '';
    return fileName.substring(dotIndex + 1).trim();
  }

  private parseCsv(value?: string): string[] {
    if (!value) return [];
    return value
      .split(',')
      .map(item => item.trim().toLowerCase())
      .filter(Boolean);
  }

  private clearLinkError(index: number) {
    delete this.linkErrorsMap[index];
  }
}
