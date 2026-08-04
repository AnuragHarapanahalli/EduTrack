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

  isLoginTab = true;
  showPassword = false;
  isSubmitting = false;

  loginEmail = '';
  loginPassword = '';

  regFullName = '';
  regEmail = '';
  regPassword = '';
  regRole: Role = 'STUDENT';

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

  switchTab(isLogin: boolean) {
    this.isLoginTab = isLogin;
    this.errorMessage = '';
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  setRegRole(role: Role) {
    this.regRole = role;
  }

  fillDemo(email: string, password: string) {
    this.isLoginTab = true;
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

  onRegister() {
    if (!this.regFullName || !this.regEmail || !this.regPassword) {
      this.errorMessage = 'Please fill in all required registration fields.';
      return;
    }

    this.errorMessage = '';
    this.isSubmitting = true;

    this.apiService.register(
      this.regFullName.trim(),
      this.regEmail.trim(),
      this.regPassword,
      this.regRole,
      1
    ).subscribe({
      next: ({ user, token }) => {
        this.authService.setCurrentUser(user, token);
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
          err.error?.message || 'Registration failed. Check email or server status.';
      }
    });
  }

}