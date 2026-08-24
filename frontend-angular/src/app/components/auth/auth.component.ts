import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { ViewStateService } from '../../services/view-state.service';
import { ThemeService } from '../../services/theme.service';

import { Role } from '../../models/auth.model';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.css'
})
export class AuthComponent {

  mode: 'login' | 'forgot-password' = 'login';

  showPassword = false;
  isSubmitting = false;

  loginEmail = '';
  loginPassword = '';

  errorMessage = '';

  // Forgot Password state
  forgotEmail = '';
  forgotNewPassword = '';
  forgotConfirmPassword = '';
  showForgotNewPassword = false;
  showForgotConfirmPassword = false;
  forgotErrorMessage = '';
  forgotSuccessMessage = '';
  isForgotSubmitting = false;

  constructor(
    private authService: AuthService,
    private apiService: ApiService,
    public viewStateService: ViewStateService,
    public themeService: ThemeService,
    private cdr: ChangeDetectorRef
  ) {}

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleForgotNewPasswordVisibility() {
    this.showForgotNewPassword = !this.showForgotNewPassword;
  }

  toggleForgotConfirmPasswordVisibility() {
    this.showForgotConfirmPassword = !this.showForgotConfirmPassword;
  }

  switchToForgotPassword() {
    this.mode = 'forgot-password';
    if (this.loginEmail) {
      this.forgotEmail = this.loginEmail;
    }
    this.forgotErrorMessage = '';
    this.forgotSuccessMessage = '';
    this.errorMessage = '';
    this.cdr.detectChanges();
  }

  switchToLogin() {
    this.mode = 'login';
    this.errorMessage = '';
    this.forgotErrorMessage = '';
    this.forgotSuccessMessage = '';
    this.cdr.detectChanges();
  }

  fillDemo(email: string, password: string) {
    if (this.mode === 'forgot-password') {
      this.forgotEmail = email;
      this.forgotErrorMessage = '';
      this.forgotSuccessMessage = '';
    } else {
      this.loginEmail = email;
      this.loginPassword = password;
      this.errorMessage = '';
    }
    this.cdr.detectChanges();
  }

  onResetPassword() {
    if (!this.forgotEmail || !this.forgotEmail.trim()) {
      this.forgotErrorMessage = 'Please enter your email address.';
      this.cdr.detectChanges();
      return;
    }

    if (!this.forgotNewPassword) {
      this.forgotErrorMessage = 'Please enter a new password.';
      this.cdr.detectChanges();
      return;
    }

    if (this.forgotNewPassword.length < 6) {
      this.forgotErrorMessage = 'Password must be at least 6 characters long.';
      this.cdr.detectChanges();
      return;
    }

    if (this.forgotNewPassword.length > 30) {
      this.forgotErrorMessage = 'Password cannot exceed 30 characters.';
      this.cdr.detectChanges();
      return;
    }

    if (this.forgotNewPassword !== this.forgotConfirmPassword) {
      this.forgotErrorMessage = 'Passwords do not match. Please re-enter.';
      this.cdr.detectChanges();
      return;
    }

    this.forgotErrorMessage = '';
    this.forgotSuccessMessage = '';
    this.isForgotSubmitting = true;
    this.cdr.detectChanges();

    this.apiService.forgotPassword(this.forgotEmail.trim(), this.forgotNewPassword).subscribe({
      next: () => {
        this.isForgotSubmitting = false;
        this.forgotSuccessMessage = 'Password reset successfully! You can now sign in with your new password.';
        this.loginEmail = this.forgotEmail.trim();
        this.loginPassword = this.forgotNewPassword;
        this.forgotNewPassword = '';
        this.forgotConfirmPassword = '';
        this.cdr.detectChanges();
      },
      error: err => {
        this.isForgotSubmitting = false;
        console.error('Forgot password error:', err);
        if (err.error && typeof err.error === 'object' && err.error.message) {
          this.forgotErrorMessage = err.error.message;
        } else if (err.error && typeof err.error === 'string') {
          try {
            const parsed = JSON.parse(err.error);
            this.forgotErrorMessage = parsed.message || 'Failed to reset password.';
          } catch (e) {
            this.forgotErrorMessage = err.error;
          }
        } else {
          this.forgotErrorMessage = err.message || 'Failed to reset password. Please check your email and try again.';
        }
        this.cdr.detectChanges();
      }
    });
  }

  onLogin() {
    if (!this.loginEmail || !this.loginPassword) {
      this.errorMessage = 'Please enter both email and password.';
      this.cdr.detectChanges();
      return;
    }

    this.errorMessage = '';
    this.isSubmitting = true;
    this.cdr.detectChanges();

    this.apiService.login(this.loginEmail, this.loginPassword).subscribe({
      next: ({ user, token }) => {
        this.authService.setCurrentUser(user, token);
        if (user.role === 'ADMIN') {
          this.isSubmitting = false;
          this.viewStateService.setView('ADMIN_PANEL');
          this.cdr.detectChanges();
          return;
        }

        const request =
          user.role === 'INSTRUCTOR'
            ? this.apiService.getSubjectsForInstructor(user.id)
            : this.apiService.getSubjectsForStudent(user.id);

        request.subscribe({
          next: subjects => {
            this.isSubmitting = false;
            this.viewStateService.setUserSubjects(subjects);
            this.viewStateService.setView('CLASSES_HOME');
            this.cdr.detectChanges();
          },
          error: () => {
            this.isSubmitting = false;
            this.viewStateService.setView('CLASSES_HOME');
            this.cdr.detectChanges();
          }
        });
      },
      error: err => {
        this.isSubmitting = false;
        console.error('Login error:', err);
        if (err.error && typeof err.error === 'object' && err.error.message) {
          this.errorMessage = err.error.message;
        } else if (err.error && typeof err.error === 'string') {
          try {
            const parsed = JSON.parse(err.error);
            this.errorMessage = parsed.message || 'Login failed.';
          } catch (e) {
            this.errorMessage = err.error;
          }
        } else {
          this.errorMessage = err.message || 'Login failed. Invalid credentials or server offline.';
        }
        this.cdr.detectChanges(); // Force immediate template update
      }
    });
  }

}