import { Component, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../services/api.service';
import { AuthService } from '../../../services/auth.service';
import { ViewStateService } from '../../../services/view-state.service';
import { Milestone } from '../../../models/milestone.model';
import { Submission } from '../../../models/submission.model';

@Component({
  selector: 'app-stream',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stream.component.html',
  styleUrl: './stream.component.css'
})
export class StreamComponent implements OnInit {
  milestones: Milestone[] = [];
  upcomingMilestones: Milestone[] = [];
  studentSubmissionsMap: { [milestoneId: number]: Submission } = {};

  constructor(
    private apiService: ApiService,
    public authService: AuthService,
    public viewStateService: ViewStateService
  ) {
    effect(() => {
      const currentSubject = this.viewStateService.currentSubject();
      if (currentSubject) {
        this.loadStreamData();
      }
    });
  }

  ngOnInit() {
    this.loadStreamData();
  }

  loadStreamData() {
    const currentSubject = this.viewStateService.currentSubject();
    if (!currentSubject) return;

    this.apiService.getMilestonesBySubject(currentSubject.id).subscribe({
      next: (ms) => {
        this.milestones = ms;
        this.upcomingMilestones = ms.filter(m => !m.isOverdue).slice(0, 3);
      }
    });

    const user = this.authService.currentUser();
    if (user && user.role === 'STUDENT') {
      this.apiService.getSubmissionsByStudent(user.id).subscribe({
        next: (subs) => {
          this.studentSubmissionsMap = {};
          subs.forEach(s => this.studentSubmissionsMap[s.milestoneId] = s);
        }
      });
    }
  }

  goToClasswork() {
    this.viewStateService.setClassTab('classwork');
  }
}
