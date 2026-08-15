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

  showPassword = false;
  isSubmitting = false;

  loginEmail = '';
  loginPassword = '';

  errorMessage = '';

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

  fillDemo(email: string, password: string) {
    this.loginEmail = email;
    this.loginPassword = password;
    this.errorMessage = '';
    this.cdr.detectChanges();
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