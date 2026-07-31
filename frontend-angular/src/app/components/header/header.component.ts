import { Component, ChangeDetectorRef } from '@angular/core';
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
    public viewStateService: ViewStateService,
    private cdr: ChangeDetectorRef
  ) {}

  onLogoClick() {
    this.viewStateService.setView('CLASSES_HOME');
    this.cdr.detectChanges();
  }

  onTabClick(tab: ClassTab) {
    this.viewStateService.setClassTab(tab);
    this.cdr.detectChanges();
  }

  toggleSidebar() {
    this.viewStateService.toggleSidebar();
    this.cdr.detectChanges();
  }
}
