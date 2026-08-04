import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { ViewStateService } from '../../services/view-state.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {

  constructor(
    public authService: AuthService,
    public viewStateService: ViewStateService,
    private cdr: ChangeDetectorRef
  ) {}

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
    this.authService.logout();
  }
}