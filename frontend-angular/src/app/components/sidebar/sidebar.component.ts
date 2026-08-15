import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { ViewStateService } from '../../services/view-state.service';
import { Subject } from '../../models/subject.model';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {

  @Output() openCreateSubjectModal = new EventEmitter<void>();

  get isSidebarOpen(): boolean {
    return this.viewStateService.isSidebarOpen();
  }

  constructor(
    public authService: AuthService,
    public viewStateService: ViewStateService
  ) {}

  get user() {
    return this.authService.currentUser();
  }

  get subjects(): Subject[] {
    return this.viewStateService.subjects();
  }

  get selectedSubject(): Subject | null {
    return this.viewStateService.currentSubject();
  }

  toggleSidebar(): void {
    this.viewStateService.toggleSidebar();
  }

  selectSubject(subject: Subject): void {
    this.viewStateService.selectSubject(subject);
    this.viewStateService.closeSidebar();
  }

  goDashboard(): void {
    this.viewStateService.goDashboard();
    this.viewStateService.closeSidebar();
  }

  goToAdminTab(tab: 'USERS' | 'CLASSES' | 'LOGS' | 'STATS'): void {
    this.viewStateService.goAdminPanel(tab);
  }

  createClass(): void {
    this.openCreateSubjectModal.emit();
  }

  logout(): void {
    this.authService.logout();
    this.viewStateService.selectSubject(null);
    this.viewStateService.setView('AUTH');
  }

  getInitials(name: string): string {
    if (!name?.trim()) {
      return '?';
    }

    return name
      .trim()
      .split(/\s+/)
      .map(word => word.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }
}