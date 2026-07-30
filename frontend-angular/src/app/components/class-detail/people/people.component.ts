import { Component, OnInit, Output, EventEmitter, effect } from '@angular/core';
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

  teacherName = '';
  students: User[] = [];

  constructor(
    private apiService: ApiService,
    public authService: AuthService,
    public viewStateService: ViewStateService
  ) {
    effect(() => {
      const currentSubject = this.viewStateService.currentSubject();
      if (currentSubject) {
        this.loadPeople();
      }
    });
  }

  ngOnInit() {
    this.loadPeople();
  }

  loadPeople() {
    const currentSubject = this.viewStateService.currentSubject();
    if (!currentSubject) return;

    this.teacherName = currentSubject.instructorName || 'Faculty Instructor';

    this.apiService.getEnrolledStudents(currentSubject.id).subscribe({
      next: (list) => {
        this.students = list;
      }
    });
  }

  triggerAddStudents() {
    this.openAddStudentsModal.emit();
  }
}
