import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { ViewStateService, ClassTab } from '../../services/view-state.service';

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
    public viewStateService: ViewStateService
  ) {}

  onLogoClick() {
    this.viewStateService.setView('CLASSES_HOME');
  }

  onTabClick(tab: ClassTab) {
    this.viewStateService.setClassTab(tab);
  }

  toggleSidebar() {
    this.viewStateService.toggleSidebar();
  }
}
