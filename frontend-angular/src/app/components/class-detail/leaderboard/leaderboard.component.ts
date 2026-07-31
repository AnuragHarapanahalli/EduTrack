import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../services/api.service';
import { ViewStateService } from '../../../services/view-state.service';
import { LeaderboardEntry } from '../../../models/leaderboard.model';

@Component({
  selector: 'app-leaderboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './leaderboard.component.html',
  styleUrl: './leaderboard.component.css'
})
export class LeaderboardComponent implements OnInit {
  leaderboardEntries: LeaderboardEntry[] = [];
  isLoading = true;

  constructor(
    private apiService: ApiService,
    public viewStateService: ViewStateService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadLeaderboard();
  }

  loadLeaderboard() {
    const currentSubject = this.viewStateService.currentSubject();
    if (!currentSubject) return;

    this.isLoading = true;
    this.apiService.getLeaderboard(currentSubject.id).subscribe({
      next: (list) => {
        this.leaderboardEntries = list;
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error loading leaderboard:', err);
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }
}
