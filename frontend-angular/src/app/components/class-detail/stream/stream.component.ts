import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

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
  styleUrls: ['./stream.component.css']
})
export class StreamComponent implements OnInit {

  milestones: Milestone[] = [];
  upcomingMilestones: Milestone[] = [];

  studentSubmissionsMap: { [milestoneId: number]: Submission } = {};

  loading = true;

  constructor(
    private apiService: ApiService,
    public authService: AuthService,
    public viewStateService: ViewStateService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadStreamData();
  }

  loadStreamData(): void {

    const subject = this.viewStateService.currentSubject();

    if (!subject) {
      this.loading = false;
      return;
    }

    this.loading = true;

    this.apiService.getMilestonesBySubject(subject.id).subscribe({

      next: (milestones) => {

        this.milestones = milestones;

        this.upcomingMilestones = milestones
          .filter(m => !m.isOverdue)
          .sort((a, b) =>
            new Date(a.deadline).getTime() -
            new Date(b.deadline).getTime()
          )
          .slice(0, 3);

        this.loading = false;

        this.cdr.detectChanges();

      },

      error: err => {

        console.error(err);

        this.loading = false;

        this.cdr.detectChanges();

      }

    });

    const user = this.authService.currentUser();

    if (user?.role === 'STUDENT') {

      this.apiService.getSubmissionsByStudent(user.id).subscribe({

        next: submissions => {

          this.studentSubmissionsMap = {};

          submissions.forEach(sub => {

            this.studentSubmissionsMap[sub.milestoneId] = sub;

          });

          this.cdr.detectChanges();

        },

        error: err => {

          console.error(err);

        }

      });

    }

  }

  goToClasswork(): void {

    this.viewStateService.setCurrentTab('CLASSWORK');

  }

  getSubmission(id: number): Submission | undefined {

    return this.studentSubmissionsMap[id];

  }

}