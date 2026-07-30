import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { ViewStateService } from '../../services/view-state.service';
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
  loginEmail = '';
  loginPassword = '';

  regFullName = '';
  regEmail = '';
  regPassword = '';
  regRole: Role = 'STUDENT';

  errorMessage = '';

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private viewStateService: ViewStateService
  ) {}

  switchTab(isLogin: boolean) {
    this.isLoginTab = isLogin;
    this.errorMessage = '';
  }

  fillDemo(email: string, pass: string) {
    this.loginEmail = email;
    this.loginPassword = pass;
  }

  onLogin() {
    this.errorMessage = '';
    this.apiService.login(this.loginEmail, this.loginPassword).subscribe({
      next: (res) => {
        this.authService.setCurrentUser(res.user, res.token);
        this.loadUserSubjects(res.user.id, res.user.role);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Login failed. Check server status.';
      }
    });
  }

  onRegister() {
    this.errorMessage = '';
    this.apiService.register(this.regFullName, this.regEmail, this.regPassword, this.regRole, 1).subscribe({
      next: (res) => {
        this.authService.setCurrentUser(res.user, res.token);
        this.loadUserSubjects(res.user.id, res.user.role);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Registration failed.';
      }
    });
  }

  private loadUserSubjects(userId: number, role: Role) {
    const stream = (role === 'INSTRUCTOR')
      ? this.apiService.getSubjectsForInstructor(userId)
      : this.apiService.getSubjectsForStudent(userId);

    stream.subscribe({
      next: (subjects) => {
        this.viewStateService.setUserSubjects(subjects);
        this.viewStateService.setView('CLASSES_HOME');
      },
      error: () => {
        this.viewStateService.setView('CLASSES_HOME');
      }
    });
  }
}
