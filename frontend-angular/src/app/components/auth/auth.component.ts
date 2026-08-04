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

  fillDemo(email: string, password: string) {
    this.loginEmail = email;
    this.loginPassword = password;
  }

  onLogin() {

    this.errorMessage = '';

    this.apiService.login(this.loginEmail, this.loginPassword).subscribe({

      next: ({ user, token }) => {

        this.authService.setCurrentUser(user, token);

        const request =
          user.role === 'INSTRUCTOR'
            ? this.apiService.getSubjectsForInstructor(user.id)
            : this.apiService.getSubjectsForStudent(user.id);

        request.subscribe({

          next: subjects => {

            this.viewStateService.setUserSubjects(subjects);
            this.viewStateService.setView('CLASSES_HOME');

          },

          error: () => this.viewStateService.setView('CLASSES_HOME')

        });

      },

      error: err => {

        this.errorMessage =
          err.error?.message || 'Login failed. Check server status.';

      }

    });

  }

}