import { Component } from '@angular/core';
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
    public themeService: ThemeService
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
  }

  onLogin() {
    if (!this.loginEmail || !this.loginPassword) {
      this.errorMessage = 'Please enter both email and password.';
      return;
    }

    this.errorMessage = '';
    this.isSubmitting = true;

    this.apiService.login(this.loginEmail, this.loginPassword).subscribe({
      next: ({ user, token }) => {
        this.authService.setCurrentUser(user, token);
        if (user.role === 'ADMIN') {
          this.isSubmitting = false;
          this.viewStateService.setView('ADMIN_PANEL');
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
          },
          error: () => {
            this.isSubmitting = false;
            this.viewStateService.setView('CLASSES_HOME');
          }
        });
      },
      error: err => {
        this.isSubmitting = false;
        this.errorMessage =
          err.error?.message || 'Login failed. Invalid credentials or server offline.';
      }
    });
  }

}