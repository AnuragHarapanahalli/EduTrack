import { Component, ChangeDetectorRef, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';
import { ViewStateService } from '../../services/view-state.service';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {

  showUserMenu = false;
  showChangePasswordModal = false;

  newPassword = '';
  confirmPassword = '';
  showNewPassword = false;
  showConfirmPassword = false;
  isSubmittingPassword = false;
  changePasswordError = '';
  changePasswordSuccess = '';

  constructor(
    public authService: AuthService,
    private apiService: ApiService,
    public viewStateService: ViewStateService,
    public themeService: ThemeService,
    private cdr: ChangeDetectorRef,
    private elementRef: ElementRef
  ) {}

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (this.showUserMenu && !this.elementRef.nativeElement.querySelector('.gc-user-dropdown-container')?.contains(event.target as Node)) {
      this.showUserMenu = false;
      this.cdr.detectChanges();
    }
  }

  // Current logged-in user
  get user() {
    return this.authService.currentUser();
  }

  // Avatar initials
  get initials(): string {

    const fullName = this.user?.fullName?.trim();

    if (!fullName) {
      return 'U';
    }

    return fullName
      .split(' ')
      .filter(name => name.length > 0)
      .map(name => name[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }

  toggleUserMenu(event?: MouseEvent): void {
    if (event) {
      event.stopPropagation();
    }
    this.showUserMenu = !this.showUserMenu;
    this.cdr.detectChanges();
  }

  openChangePasswordModal(): void {
    this.showUserMenu = false;
    this.newPassword = '';
    this.confirmPassword = '';
    this.showNewPassword = false;
    this.showConfirmPassword = false;
    this.changePasswordError = '';
    this.changePasswordSuccess = '';
    this.isSubmittingPassword = false;
    this.showChangePasswordModal = true;
    this.cdr.detectChanges();
  }

  closeChangePasswordModal(): void {
    this.showChangePasswordModal = false;
    this.changePasswordError = '';
    this.changePasswordSuccess = '';
    this.cdr.detectChanges();
  }

  toggleNewPasswordVisibility(): void {
    this.showNewPassword = !this.showNewPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  submitChangePassword(): void {
    if (!this.user?.id) {
      this.changePasswordError = 'User session not found. Please sign in again.';
      this.cdr.detectChanges();
      return;
    }

    if (!this.newPassword) {
      this.changePasswordError = 'Please enter a new password.';
      this.cdr.detectChanges();
      return;
    }

    if (this.newPassword.length < 6) {
      this.changePasswordError = 'Password must be at least 6 characters long.';
      this.cdr.detectChanges();
      return;
    }

    if (this.newPassword.length > 30) {
      this.changePasswordError = 'Password cannot exceed 30 characters.';
      this.cdr.detectChanges();
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.changePasswordError = 'Passwords do not match. Please re-enter.';
      this.cdr.detectChanges();
      return;
    }

    this.changePasswordError = '';
    this.changePasswordSuccess = '';
    this.isSubmittingPassword = true;
    this.cdr.detectChanges();

    this.apiService.changePassword(this.user.id, this.newPassword).subscribe({
      next: () => {
        this.isSubmittingPassword = false;
        this.changePasswordSuccess = 'Password updated successfully!';
        if (this.user) {
          this.user.needsPasswordReset = false;
        }
        setTimeout(() => {
          this.closeChangePasswordModal();
        }, 1200);
        this.cdr.detectChanges();
      },
      error: err => {
        this.isSubmittingPassword = false;
        console.error('Change password error:', err);
        if (err.error && typeof err.error === 'object' && err.error.message) {
          this.changePasswordError = err.error.message;
        } else if (err.error && typeof err.error === 'string') {
          try {
            const parsed = JSON.parse(err.error);
            this.changePasswordError = parsed.message || 'Failed to update password.';
          } catch (e) {
            this.changePasswordError = err.error;
          }
        } else {
          this.changePasswordError = err.message || 'Failed to update password. Please try again.';
        }
        this.cdr.detectChanges();
      }
    });
  }

  // Logo click
  goToDashboard(): void {
    this.viewStateService.goDashboard();
    this.cdr.detectChanges();
  }

  // Tabs
  openStream(): void {
    this.viewStateService.setClassTab('STREAM');
    this.cdr.detectChanges();
  }

  openClasswork(): void {
    this.viewStateService.setClassTab('CLASSWORK');
    this.cdr.detectChanges();
  }

  openPeople(): void {
    this.viewStateService.setClassTab('PEOPLE');
    this.cdr.detectChanges();
  }

  openLeaderboard(): void {
    this.viewStateService.setClassTab('LEADERBOARD');
    this.cdr.detectChanges();
  }

  toggleSidebar(): void {
    this.viewStateService.toggleSidebar();
    this.cdr.detectChanges();
  }

  logout(): void {
    this.showUserMenu = false;
    this.authService.logout();
    this.viewStateService.selectSubject(null);
    this.viewStateService.setView('AUTH');
    this.cdr.detectChanges();
  }
}