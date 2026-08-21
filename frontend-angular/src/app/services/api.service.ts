import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { AuthResponse, User } from '../models/auth.model';
import { Subject, CreateSubjectRequest } from '../models/subject.model';
import { Milestone, CreateMilestoneRequest } from '../models/milestone.model';
import {
  Submission,
  MilestoneRosterEntry,
  ReviewSubmissionRequest
} from '../models/submission.model';
import { LeaderboardEntry } from '../models/leaderboard.model';
import {
  AdminUser,
  CreateAdminUserRequest,
  UpdateAdminUserRequest,
  CreateSubjectAdminRequest,
  SystemStats,
  AuditLog
} from '../models/admin.model';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private readonly baseUrl = window.location.port === '4200'
    ? 'http://localhost:8080/api'
    : '/api';


  constructor(private http: HttpClient) {}


  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('edutrack_jwt_token');

    return token
      ? new HttpHeaders().set('Authorization', `Bearer ${token}`)
      : new HttpHeaders();
  }


  private get options() {
    return {
      headers: this.getHeaders()
    };
  }


  // ---------------- AUTH ----------------

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
      `${this.baseUrl}/auth/login`,
      { email, password }
    );
  }
  changePassword(userId: number, newPassword: string): Observable<void> {
    return this.http.post<void>(
      `${this.baseUrl}/auth/change-password`,
      { userId, newPassword }
    );
  }


  getUserById(id: number): Observable<User> {
    return this.http.get<User>(
      `${this.baseUrl}/auth/users/${id}`,
      this.options
    );
  }



  // ---------------- SUBJECTS ----------------

  getAllSubjects(): Observable<Subject[]> {
    return this.http.get<Subject[]>(
      `${this.baseUrl}/subjects`,
      this.options
    );
  }

  getSubjectsForStudent(studentId: number): Observable<Subject[]> {
    return this.http.get<Subject[]>(
      `${this.baseUrl}/subjects/student/${studentId}`,
      this.options
    );
  }


  getSubjectsForInstructor(instructorId: number): Observable<Subject[]> {
    return this.http.get<Subject[]>(
      `${this.baseUrl}/subjects/instructor/${instructorId}`,
      this.options
    );
  }


  createSubject(
    subjectData: CreateSubjectRequest,
    instructorId: number
  ): Observable<Subject> {

    const params = new HttpParams()
      .set('instructorId', instructorId.toString());

    return this.http.post<Subject>(
      `${this.baseUrl}/subjects`,
      subjectData,
      {
        ...this.options,
        params
      }
    );
  }


  addStudentToSubjectManual(
    subjectId: number,
    fullName: string,
    email: string
  ): Observable<User> {

    const params = new HttpParams()
      .set('fullName', fullName)
      .set('email', email);

    return this.http.post<User>(
      `${this.baseUrl}/subjects/${subjectId}/students/manual`,
      {},
      {
        ...this.options,
        params
      }
    );
  }


  exportSubjectMarksCsv(subjectId: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/subjects/${subjectId}/marks/export`, {
      ...this.options,
      responseType: 'blob'
    });
  }


  getEnrolledStudents(subjectId: number): Observable<User[]> {
    return this.http.get<User[]>(
      `${this.baseUrl}/subjects/${subjectId}/students`,
      this.options
    );
  }



  // ---------------- MILESTONES ----------------

  getMilestonesBySubject(subjectId: number): Observable<Milestone[]> {
    return this.http.get<Milestone[]>(
      `${this.baseUrl}/milestones/subject/${subjectId}`,
      this.options
    );
  }


  createMilestone(
    milestoneData: CreateMilestoneRequest
  ): Observable<Milestone> {

    return this.http.post<Milestone>(
      `${this.baseUrl}/milestones`,
      milestoneData,
      this.options
    );
  }


  updateMilestone(
    id: number,
    milestoneData: CreateMilestoneRequest
  ): Observable<Milestone> {

    return this.http.put<Milestone>(
      `${this.baseUrl}/milestones/${id}`,
      milestoneData,
      this.options
    );
  }


  deleteMilestone(id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.baseUrl}/milestones/${id}`,
      this.options
    );
  }



  // ---------------- SUBMISSIONS ----------------

  getSubmissionsByStudent(studentId: number): Observable<Submission[]> {
    return this.http.get<Submission[]>(
      `${this.baseUrl}/submissions/student/${studentId}`,
      this.options
    );
  }

  lockAllSubmissions(milestoneId: number): Observable<void> {
    return this.http.post<void>(
      `${this.baseUrl}/submissions/milestone/${milestoneId}/lock-all`,
      {},
      this.options
    );
  }

  uploadSubmission(formData: FormData): Observable<Submission> {
    return this.http.post<Submission>(
      `${this.baseUrl}/submissions/upload`,
      formData,
      this.options
    );
  }


  getMilestoneRoster(
    milestoneId: number
  ): Observable<MilestoneRosterEntry[]> {

    return this.http.get<MilestoneRosterEntry[]>(
      `${this.baseUrl}/submissions/milestone/${milestoneId}/roster`,
      this.options
    );
  }


  reviewSubmission(
    submissionId: number,
    reviewData: ReviewSubmissionRequest
  ): Observable<Submission> {

    return this.http.put<Submission>(
      `${this.baseUrl}/submissions/${submissionId}/review`,
      reviewData,
      this.options
    );
  }



  // ---------------- LEADERBOARD ----------------

  getLeaderboard(subjectId: number): Observable<LeaderboardEntry[]> {

    return this.http.get<LeaderboardEntry[]>(
      `${this.baseUrl}/leaderboard/subject/${subjectId}`,
      this.options
    );
  }

  getValidationLimits(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/validation-limits`);
  }

  // ---------------- ADMIN APIS ----------------

  getAdminUsers(search?: string, role?: string, active?: boolean): Observable<AdminUser[]> {
    let params = new HttpParams();
    if (search && search.trim()) {
      params = params.set('search', search.trim());
    }
    if (role && role !== 'ALL') {
      params = params.set('role', role);
    }
    if (active !== undefined && active !== null) {
      params = params.set('active', active.toString());
    }

    return this.http.get<AdminUser[]>(
      `${this.baseUrl}/admin/users`,
      {
        ...this.options,
        params
      }
    );
  }

  createAdminUser(userData: CreateAdminUserRequest): Observable<AdminUser> {
    return this.http.post<AdminUser>(
      `${this.baseUrl}/admin/users`,
      userData,
      this.options
    );
  }

  updateAdminUser(id: number, userData: UpdateAdminUserRequest): Observable<AdminUser> {
    return this.http.put<AdminUser>(
      `${this.baseUrl}/admin/users/${id}`,
      userData,
      this.options
    );
  }

  toggleUserStatus(id: number, active: boolean): Observable<AdminUser> {
    return this.http.patch<AdminUser>(
      `${this.baseUrl}/admin/users/${id}/status`,
      { active },
      this.options
    );
  }

  enrollStudentInSubject(subjectId: number, studentId: number): Observable<void> {
    return this.http.post<void>(
      `${this.baseUrl}/admin/subjects/${subjectId}/students/${studentId}`,
      {},
      this.options
    );
  }

  unenrollStudentFromSubject(subjectId: number, studentId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.baseUrl}/admin/subjects/${subjectId}/students/${studentId}`,
      this.options
    );
  }

  bulkEnrollStudentsInSubject(subjectId: number, studentIds: number[]): Observable<void> {
    return this.http.post<void>(
      `${this.baseUrl}/admin/subjects/${subjectId}/students/bulk`,
      { studentIds },
      this.options
    );
  }

  createAdminSubject(subjectData: CreateSubjectAdminRequest): Observable<Subject> {
    return this.http.post<Subject>(
      `${this.baseUrl}/admin/subjects`,
      subjectData,
      this.options
    );
  }

  getAdminStats(): Observable<SystemStats> {
    return this.http.get<SystemStats>(
      `${this.baseUrl}/admin/stats`,
      this.options
    );
  }

  getAuditLogs(page: number = 0, size: number = 50): Observable<AuditLog[]> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<AuditLog[]>(
      `${this.baseUrl}/admin/logs`,
      {
        ...this.options,
        params
      }
    );
  }

  changeSubjectInstructor(subjectId: number, instructorId: number): Observable<Subject> {
    return this.http.put<Subject>(
      `${this.baseUrl}/admin/subjects/${subjectId}/instructor/${instructorId}`,
      {},
      this.options
    );
  }

  uploadUsersCsv(file: File, role: string): Observable<AdminUser[]> {
    const formData = new FormData();
    formData.append('file', file);
    const params = new HttpParams().set('role', role);
    return this.http.post<AdminUser[]>(
      `${this.baseUrl}/admin/users/bulk`,
      formData,
      {
        ...this.options,
        params
      }
    );
  }

}