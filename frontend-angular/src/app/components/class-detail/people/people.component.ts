import { Component, OnInit, Output, EventEmitter, ChangeDetectorRef, effect } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ApiService } from '../../../services/api.service';
import { AuthService } from '../../../services/auth.service';
import { ViewStateService } from '../../../services/view-state.service';

import { User } from '../../../models/auth.model';

@Component({
  selector: 'app-people',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './people.component.html',
  styleUrl: './people.component.css'
})
export class PeopleComponent implements OnInit {

  @Output() openAddStudentsModal = new EventEmitter<void>();

  teacherName: string = '';
  students: User[] = [];

  constructor(
    private apiService: ApiService,
    public authService: AuthService,
    public viewStateService: ViewStateService,
    private cdr: ChangeDetectorRef
  ) {
    effect(() => {
      // Trigger reload when currentSubject signal reference changes (e.g. on manual/excel add refresh)
      const subject = this.viewStateService.currentSubject();
      if (subject) {
        this.loadPeople();
      }
    });

  }

  ngOnInit(): void {
    this.loadPeople();
  }

  loadPeople(): void {

    const subject = this.viewStateService.currentSubject();

    if (!subject) {
      this.teacherName = '';
      this.students = [];
      return;
    }

    this.teacherName = subject.instructorName || 'Faculty Instructor';

    this.apiService.getEnrolledStudents(subject.id).subscribe({
      next: (students) => {

        this.students = students.sort((a, b) =>
          a.fullName.localeCompare(b.fullName)
        );

        this.cdr.markForCheck();
      },

      error: (err) => {
        console.error('Error loading students:', err);
        this.students = [];
        this.cdr.markForCheck();
      }
    });

  }

  triggerAddStudents(): void {
    this.openAddStudentsModal.emit();
  }

}