import { Injectable, signal } from '@angular/core';

export const SUPPORTED_PREVIEW_EXTENSIONS = [
  'pdf',
  'docx',
  'doc',
  'png',
  'jpg',
  'jpeg',
  'webp',
  'gif',
  'txt',
  'csv',
  'md'
];

export interface PreviewDocument {
  fileUrl?: string;
  fileName?: string;
  fileBlob?: Blob;
}

@Injectable({
  providedIn: 'root'
})
export class DocumentPreviewService {
  readonly currentDocument = signal<PreviewDocument | null>(null);
  readonly isVisible = signal<boolean>(false);

  static isSupported(urlOrName?: string): boolean {
    if (!urlOrName) return false;
    const clean = urlOrName.split('?')[0].split('#')[0];
    const ext = clean.split('.').pop()?.toLowerCase() || '';
    return SUPPORTED_PREVIEW_EXTENSIONS.includes(ext);
  }

  static getExtension(urlOrName?: string): string {
    if (!urlOrName) return '';
    const clean = urlOrName.split('?')[0].split('#')[0];
    return clean.split('.').pop()?.toLowerCase() || '';
  }

  openPreview(fileUrl: string, fileName?: string, fileBlob?: Blob): void {
    const derivedName = fileName || fileUrl.split('/').pop() || 'Document';
    this.currentDocument.set({
      fileUrl,
      fileName: derivedName,
      fileBlob
    });
    this.isVisible.set(true);
  }

  closePreview(): void {
    this.isVisible.set(false);
    this.currentDocument.set(null);
  }
}
