import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  computed,
  effect
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl, SafeHtml } from '@angular/platform-browser';
import * as mammoth from 'mammoth';
import {
  DocumentPreviewService,
  SUPPORTED_PREVIEW_EXTENSIONS
} from '../../services/document-preview.service';

@Component({
  selector: 'app-document-preview-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="gc-modal-backdrop gc-preview-backdrop"
      *ngIf="previewService.isVisible()"
      (click)="close()"
    >
      <div
        class="gc-modal-card gc-preview-card"
        [class.fullscreen]="isFullscreen"
        (click)="$event.stopPropagation()"
      >
        <!-- HEADER -->
        <div class="gc-preview-header">
          <div class="gc-preview-title-group">
            <span class="file-type-badge" [ngClass]="fileTypeBadgeClass">
              {{ fileExtension.toUpperCase() || 'FILE' }}
            </span>
            <div class="file-name-info">
              <h3 class="file-name" [title]="fileName">{{ fileName }}</h3>
              <span class="file-sub-status" *ngIf="isSupported && !isLoading">
                {{ fileTypeLabel }}
              </span>
            </div>
          </div>

          <!-- CONTROLS -->
          <div class="gc-preview-controls">
            <!-- Zoom Controls (for images / docx) -->
            <div class="zoom-pill" *ngIf="isSupported && (fileType === 'image' || fileType === 'docx')">
              <button type="button" (click)="adjustZoom(-10)" title="Zoom Out" [disabled]="zoom <= 50">
                <i class="fa-solid fa-minus"></i>
              </button>
              <span>{{ zoom }}%</span>
              <button type="button" (click)="adjustZoom(10)" title="Zoom In" [disabled]="zoom >= 200">
                <i class="fa-solid fa-plus"></i>
              </button>
            </div>

            <!-- Download Button -->
            <a
              *ngIf="downloadUrl"
              [href]="downloadUrl"
              [download]="fileName"
              target="_blank"
              class="gc-btn-control"
              title="Download File"
            >
              <i class="fa-solid fa-download"></i>
              <span class="btn-text">Download</span>
            </a>

            <!-- Fullscreen Toggle -->
            <button
              type="button"
              class="gc-btn-control"
              (click)="toggleFullscreen()"
              [title]="isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'"
            >
              <i class="fa-solid" [ngClass]="isFullscreen ? 'fa-compress' : 'fa-expand'"></i>
            </button>

            <!-- Close Button -->
            <button
              type="button"
              class="gc-btn-control gc-btn-close"
              (click)="close()"
              title="Close Preview"
            >
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>
        </div>

        <!-- BODY / VIEWER CONTENT -->
        <div class="gc-preview-body">
          <!-- LOADING STATE -->
          <div class="gc-preview-loading" *ngIf="isLoading">
            <i class="fa-solid fa-circle-notch fa-spin"></i>
            <p>Loading document preview...</p>
          </div>

          <!-- ERROR STATE: FILE NOT SUPPORTED -->
          <div class="gc-preview-unsupported" *ngIf="!isLoading && !isSupported">
            <div class="unsupported-icon-pod">
              <i class="fa-solid fa-file-circle-xmark"></i>
            </div>
            <h3 class="unsupported-title">file not supported for preview</h3>
            <p class="unsupported-desc">
              Files of type <strong>.{{ fileExtension || 'unknown' }}</strong> cannot be previewed in the viewer.
              You can still download and open the file on your device.
            </p>
            <div class="unsupported-supported-pill">
              <span>Supported formats:</span>
              <code>PDF, DOCX, DOC, PNG, JPG, JPEG, TXT, CSV</code>
            </div>
            <a
              *ngIf="downloadUrl"
              [href]="downloadUrl"
              [download]="fileName"
              target="_blank"
              class="gc-btn-primary gc-btn-lg"
              style="margin-top: 1.25rem; display: inline-flex; align-items: center; gap: 8px; text-decoration: none;"
            >
              <i class="fa-solid fa-download"></i> Download File
            </a>
          </div>

          <!-- ERROR STATE: LOAD FAILED -->
          <div class="gc-preview-unsupported" *ngIf="!isLoading && isSupported && loadError">
            <div class="unsupported-icon-pod" style="color: #ef4444; background: rgba(239, 68, 68, 0.1);">
              <i class="fa-solid fa-triangle-exclamation"></i>
            </div>
            <h3 class="unsupported-title">Failed to load preview</h3>
            <p class="unsupported-desc">{{ loadError }}</p>
            <a
              *ngIf="downloadUrl"
              [href]="downloadUrl"
              [download]="fileName"
              target="_blank"
              class="gc-btn-primary"
              style="margin-top: 1.25rem; display: inline-flex; align-items: center; gap: 8px; text-decoration: none;"
            >
              <i class="fa-solid fa-download"></i> Download File Instead
            </a>
          </div>

          <!-- VIEWER: PDF -->
          <div class="gc-pdf-viewer" *ngIf="!isLoading && isSupported && fileType === 'pdf' && safePdfUrl">
            <iframe [src]="safePdfUrl" class="pdf-frame" title="PDF Document Viewer"></iframe>
          </div>

          <!-- VIEWER: WORD (.DOCX) via Mammoth -->
          <div class="gc-docx-viewer" *ngIf="!isLoading && isSupported && fileType === 'docx' && renderedDocxHtml">
            <div
              class="docx-paper"
              [style.transform]="'scale(' + zoom / 100 + ')'"
              [style.transform-origin]="'top center'"
              [innerHTML]="renderedDocxHtml"
            ></div>
          </div>

          <!-- VIEWER: WORD (.DOC) legacy notice -->
          <div class="gc-docx-viewer" *ngIf="!isLoading && isSupported && fileType === 'doc'">
            <div class="legacy-doc-notice">
              <i class="fa-solid fa-file-word" style="font-size: 3rem; color: #2563eb; margin-bottom: 1rem;"></i>
              <h3>Microsoft Word Document (.doc)</h3>
              <p>Legacy binary Word format (.doc). For optimal inline viewing, save as modern .docx.</p>
              <a [href]="downloadUrl" target="_blank" download class="gc-btn-primary" style="margin-top: 1rem; display: inline-flex; align-items: center; gap: 8px; text-decoration: none;">
                <i class="fa-solid fa-download"></i> Download & Open in Word
              </a>
            </div>
          </div>

          <!-- VIEWER: IMAGE -->
          <div class="gc-image-viewer" *ngIf="!isLoading && isSupported && fileType === 'image'">
            <div class="image-stage">
              <img
                [src]="downloadUrl"
                [alt]="fileName"
                [style.transform]="'scale(' + zoom / 100 + ')'"
                [style.transform-origin]="'center center'"
              />
            </div>
          </div>

          <!-- VIEWER: TEXT / CSV -->
          <div class="gc-text-viewer" *ngIf="!isLoading && isSupported && fileType === 'text'">
            <pre class="text-content"><code>{{ textContent }}</code></pre>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .gc-preview-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.75);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      z-index: 2000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
      animation: fadeIn 0.2s ease;
    }

    .gc-preview-card {
      background: var(--gc-surface);
      border: 1px solid var(--gc-border);
      border-radius: 18px;
      width: 92vw;
      max-width: 1200px;
      height: 88vh;
      display: flex;
      flex-direction: column;
      box-shadow: 0 25px 60px rgba(0, 0, 0, 0.35);
      overflow: hidden;
      animation: scaleUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      transition: all 0.25s ease;
    }

    .gc-preview-card.fullscreen {
      width: 100vw;
      max-width: 100vw;
      height: 100vh;
      border-radius: 0;
      border: none;
    }

    /* HEADER */
    .gc-preview-header {
      padding: 1rem 1.5rem;
      border-bottom: 1px solid var(--gc-border);
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: var(--gc-surface);
      gap: 1rem;
    }

    .gc-preview-title-group {
      display: flex;
      align-items: center;
      gap: 12px;
      min-width: 0;
    }

    .file-type-badge {
      padding: 4px 8px;
      border-radius: 6px;
      font-size: 0.72rem;
      font-weight: 800;
      letter-spacing: 0.6px;
      text-transform: uppercase;
      background: #3b82f6;
      color: #ffffff;
    }

    .file-type-badge.pdf { background: #ef4444; }
    .file-type-badge.docx, .file-type-badge.doc { background: #2563eb; }
    .file-type-badge.image { background: #10b981; }
    .file-type-badge.text { background: #8b5cf6; }
    .file-type-badge.unsupported { background: #64748b; }

    .file-name-info {
      min-width: 0;
    }

    .file-name {
      margin: 0;
      font-size: 1.05rem;
      font-weight: 700;
      color: var(--gc-text-main);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 450px;
    }

    .file-sub-status {
      font-size: 0.75rem;
      color: var(--gc-text-sub);
    }

    /* CONTROLS */
    .gc-preview-controls {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-shrink: 0;
    }

    .zoom-pill {
      display: flex;
      align-items: center;
      background: var(--gc-background);
      border: 1px solid var(--gc-border);
      border-radius: 20px;
      padding: 2px 8px;
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--gc-text-main);
      gap: 6px;
    }

    .zoom-pill button {
      background: transparent;
      border: none;
      color: var(--gc-text-sub);
      cursor: pointer;
      padding: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .zoom-pill button:hover:not([disabled]) {
      color: var(--gc-text-main);
    }

    .gc-btn-control {
      background: var(--gc-background);
      border: 1px solid var(--gc-border);
      color: var(--gc-text-main);
      padding: 7px 12px;
      border-radius: 8px;
      font-size: 0.84rem;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      text-decoration: none;
      transition: all 0.2s;
    }

    .gc-btn-control:hover {
      background: var(--gc-surface);
      border-color: #3b82f6;
      color: #3b82f6;
    }

    .gc-btn-close:hover {
      background: rgba(239, 68, 68, 0.1);
      border-color: #ef4444;
      color: #ef4444;
    }

    /* BODY */
    .gc-preview-body {
      flex: 1;
      overflow: auto;
      background: var(--gc-background);
      display: flex;
      flex-direction: column;
      position: relative;
    }

    .gc-preview-loading {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 12px;
      color: var(--gc-text-sub);
      font-size: 1rem;
    }

    .gc-preview-loading i {
      font-size: 2.5rem;
      color: #3b82f6;
    }

    /* UNSUPPORTED STATE */
    .gc-preview-unsupported {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem 1.5rem;
      text-align: center;
      max-width: 540px;
      margin: 0 auto;
    }

    .unsupported-icon-pod {
      width: 72px;
      height: 72px;
      border-radius: 50%;
      background: rgba(239, 68, 68, 0.1);
      color: #ef4444;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2.2rem;
      margin-bottom: 1.25rem;
    }

    .unsupported-title {
      font-size: 1.35rem;
      font-weight: 800;
      color: var(--gc-text-main);
      margin: 0 0 0.5rem 0;
      text-transform: lowercase;
    }

    .unsupported-desc {
      font-size: 0.92rem;
      color: var(--gc-text-sub);
      line-height: 1.5;
      margin: 0 0 1rem 0;
    }

    .unsupported-supported-pill {
      background: var(--gc-surface);
      border: 1px solid var(--gc-border);
      padding: 8px 16px;
      border-radius: 12px;
      font-size: 0.8rem;
      color: var(--gc-text-sub);
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
      justify-content: center;
    }

    .unsupported-supported-pill code {
      font-weight: 700;
      color: #3b82f6;
    }

    /* PDF */
    .gc-pdf-viewer {
      flex: 1;
      width: 100%;
      height: 100%;
    }

    .pdf-frame {
      width: 100%;
      height: 100%;
      border: none;
    }

    /* DOCX */
    .gc-docx-viewer {
      flex: 1;
      padding: 2rem;
      display: flex;
      justify-content: center;
      overflow-y: auto;
    }

    .docx-paper {
      background: #ffffff;
      color: #1e293b;
      max-width: 850px;
      width: 100%;
      min-height: 1000px;
      padding: 3.5rem 4rem;
      border-radius: 6px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
      line-height: 1.65;
      font-family: 'Calibri', 'Segoe UI', Arial, sans-serif;
      font-size: 1rem;
      transition: transform 0.2s ease;
    }

    .docx-paper h1, .docx-paper h2, .docx-paper h3 {
      color: #0f172a;
      margin-top: 1.5rem;
      margin-bottom: 0.75rem;
    }

    .docx-paper table {
      width: 100%;
      border-collapse: collapse;
      margin: 1rem 0;
    }

    .docx-paper td, .docx-paper th {
      border: 1px solid #cbd5e1;
      padding: 8px 12px;
    }

    .legacy-doc-notice {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      max-width: 480px;
      margin: 4rem auto;
    }

    /* IMAGE */
    .gc-image-viewer {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: auto;
      padding: 2rem;
    }

    .image-stage img {
      max-width: 100%;
      max-height: 75vh;
      border-radius: 8px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
      transition: transform 0.2s ease;
    }

    /* TEXT */
    .gc-text-viewer {
      flex: 1;
      padding: 2rem;
      overflow: auto;
    }

    .text-content {
      background: var(--gc-surface);
      border: 1px solid var(--gc-border);
      border-radius: 12px;
      padding: 1.5rem;
      font-family: 'Fira Code', monospace;
      font-size: 0.88rem;
      color: var(--gc-text-main);
      white-space: pre-wrap;
      line-height: 1.6;
    }

    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes scaleUp { from { transform: scale(0.96); opacity: 0; } to { transform: scale(1); opacity: 1; } }
  `]
})
export class DocumentPreviewModalComponent implements OnInit, OnDestroy {
  fileName = '';
  fileExtension = '';
  fileType: 'pdf' | 'docx' | 'doc' | 'image' | 'text' | 'unsupported' = 'unsupported';
  isSupported = false;
  isLoading = false;
  loadError: string | null = null;
  downloadUrl = '';
  safePdfUrl: SafeResourceUrl | null = null;
  renderedDocxHtml: SafeHtml | null = null;
  textContent: string | null = null;
  zoom = 100;
  isFullscreen = false;
  private createdBlobUrl: string | null = null;

  get fileTypeBadgeClass(): string {
    return this.fileType;
  }

  get fileTypeLabel(): string {
    switch (this.fileType) {
      case 'pdf': return 'PDF Document';
      case 'docx': return 'Word Document (.docx)';
      case 'doc': return 'Word Document (.doc)';
      case 'image': return 'Image Preview';
      case 'text': return 'Text Document';
      default: return 'Document';
    }
  }

  constructor(
    public previewService: DocumentPreviewService,
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef
  ) {
    effect(() => {
      const doc = this.previewService.currentDocument();
      if (doc) {
        this.loadDocument(doc.fileUrl, doc.fileName, doc.fileBlob);
      }
    });
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.resetState();
  }

  loadDocument(fileUrl?: string, fileName?: string, fileBlob?: Blob): void {
    this.resetState();
    const name = fileName || fileUrl?.split('/').pop() || 'Document';
    this.fileName = name;

    const clean = name.split('?')[0].split('#')[0];
    this.fileExtension = clean.split('.').pop()?.toLowerCase() || '';

    // Check if supported
    if (!SUPPORTED_PREVIEW_EXTENSIONS.includes(this.fileExtension)) {
      this.isSupported = false;
      this.fileType = 'unsupported';
      this.isLoading = false;
      if (fileUrl) {
        this.downloadUrl = this.resolveFullUrl(fileUrl);
      }
      this.cdr.detectChanges();
      return;
    }

    this.isSupported = true;
    this.isLoading = true;

    // Resolve URL
    let targetUrl = '';
    if (fileBlob) {
      targetUrl = URL.createObjectURL(fileBlob);
      this.createdBlobUrl = targetUrl;
      this.downloadUrl = targetUrl;
    } else if (fileUrl) {
      targetUrl = this.resolveFullUrl(fileUrl);
      this.downloadUrl = targetUrl;
    }

    // Determine type
    if (this.fileExtension === 'pdf') {
      this.fileType = 'pdf';
      if (fileBlob) {
        this.safePdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(targetUrl);
        this.isLoading = false;
        this.cdr.detectChanges();
      } else {
        // Fetch as blob to guarantee same-origin Blob URL, resolving all iframe refusal and mime-type issues
        fetch(targetUrl)
          .then(res => {
            if (!res.ok) throw new Error(`HTTP error ${res.status}: ${res.statusText}`);
            return res.blob();
          })
          .then(blob => {
            const pdfBlob = new Blob([blob], { type: 'application/pdf' });
            const blobUrl = URL.createObjectURL(pdfBlob);
            this.createdBlobUrl = blobUrl;
            this.safePdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(blobUrl);
            this.isLoading = false;
            this.cdr.detectChanges();
          })
          .catch(err => {
            console.warn('PDF blob fetch failed, falling back to direct URL:', err);
            this.safePdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(targetUrl);
            this.isLoading = false;
            this.cdr.detectChanges();
          });
      }
    } else if (this.fileExtension === 'docx') {
      this.fileType = 'docx';
      this.loadDocx(targetUrl, fileBlob);
    } else if (this.fileExtension === 'doc') {
      this.fileType = 'doc';
      this.isLoading = false;
      this.cdr.detectChanges();
    } else if (['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(this.fileExtension)) {
      this.fileType = 'image';
      this.isLoading = false;
      this.cdr.detectChanges();
    } else if (['txt', 'csv', 'md'].includes(this.fileExtension)) {
      this.fileType = 'text';
      this.loadText(targetUrl, fileBlob);
    }
  }

  private resolveFullUrl(path: string): string {
    if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('blob:')) {
      return path;
    }
    const origin = window.location.origin;
    // If running under ng serve (port 4200), default backend is port 8080
    const host = origin.includes(':4200') ? 'http://localhost:8080' : origin;
    const cleanPath = path.startsWith('/') ? path : '/' + path;
    return `${host}${cleanPath}`;
  }

  private loadDocx(url: string, blob?: Blob): void {
    const fetchPromise = blob
      ? blob.arrayBuffer()
      : fetch(url).then(res => {
          if (!res.ok) throw new Error(`HTTP error ${res.status}: ${res.statusText}`);
          return res.arrayBuffer();
        });

    fetchPromise
      .then(buffer => mammoth.convertToHtml({ arrayBuffer: buffer }))
      .then(result => {
        this.isLoading = false;
        this.renderedDocxHtml = this.sanitizer.bypassSecurityTrustHtml(result.value);
        this.cdr.detectChanges();
      })
      .catch(err => {
        this.isLoading = false;
        this.loadError = err.message || 'Failed to render Word document preview.';
        this.cdr.detectChanges();
      });
  }

  private loadText(url: string, blob?: Blob): void {
    const fetchPromise = blob
      ? blob.text()
      : fetch(url).then(res => {
          if (!res.ok) throw new Error(`HTTP error ${res.status}: ${res.statusText}`);
          return res.text();
        });

    fetchPromise
      .then(text => {
        this.isLoading = false;
        this.textContent = text;
        this.cdr.detectChanges();
      })
      .catch(err => {
        this.isLoading = false;
        this.loadError = err.message || 'Failed to load text document.';
        this.cdr.detectChanges();
      });
  }

  adjustZoom(delta: number): void {
    this.zoom = Math.max(50, Math.min(200, this.zoom + delta));
  }

  toggleFullscreen(): void {
    this.isFullscreen = !this.isFullscreen;
  }

  close(): void {
    this.previewService.closePreview();
    this.resetState();
  }

  private resetState(): void {
    if (this.createdBlobUrl) {
      try {
        URL.revokeObjectURL(this.createdBlobUrl);
      } catch (e) {}
      this.createdBlobUrl = null;
    }
    this.fileName = '';
    this.fileExtension = '';
    this.fileType = 'unsupported';
    this.isSupported = false;
    this.isLoading = false;
    this.loadError = null;
    this.downloadUrl = '';
    this.safePdfUrl = null;
    this.renderedDocxHtml = null;
    this.textContent = null;
    this.zoom = 100;
    this.isFullscreen = false;
  }
}
