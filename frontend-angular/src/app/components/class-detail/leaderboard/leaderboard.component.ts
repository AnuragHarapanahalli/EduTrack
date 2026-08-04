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

  ngOnInit(): void {
    this.loadLeaderboard();
  }

  loadLeaderboard(): void {
    const currentSubject = this.viewStateService.currentSubject();

    if (!currentSubject) {
      this.isLoading = false;
      return;
    }

    this.isLoading = true;

    this.apiService.getLeaderboard(currentSubject.id).subscribe({
      next: (entries) => {
        this.leaderboardEntries = entries;
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error loading leaderboard:', err);
        this.leaderboardEntries = [];
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  getProgress(entry: LeaderboardEntry): number {
    if (!entry.totalPoints || entry.totalPoints <= 0) {
      return 0;
    }

    return entry.completionPercentage ?? 0;
  }

  getRankClass(index: number): string {
    switch (index) {
      case 0:
        return 'rank-1';
      case 1:
        return 'rank-2';
      case 2:
        return 'rank-3';
      default:
        return '';
    }
  }
}