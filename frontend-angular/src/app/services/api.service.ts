import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthResponse, User } from '../models/auth.model';
import { Subject, CreateSubjectRequest } from '../models/subject.model';
import { Milestone, CreateMilestoneRequest } from '../models/milestone.model';
import { Submission, MilestoneRosterEntry, ReviewSubmissionRequest } from '../models/submission.model';
import { LeaderboardEntry } from '../models/leaderboard.model';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly baseUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('edutrack_jwt_token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  // Auth APIs
  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/login`, { email, password });
  }

  register(fullName: string, email: string, password: string, role: string, batchId = 1): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/register`, { fullName, email, password, role, batchId });
  }

  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/auth/users/${id}`, { headers: this.getHeaders() });
  }

  // Subject APIs
  getSubjectsForStudent(studentId: number): Observable<Subject[]> {
    return this.http.get<Subject[]>(`${this.baseUrl}/subjects/student/${studentId}`, { headers: this.getHeaders() });
  }

  getSubjectsForInstructor(instructorId: number): Observable<Subject[]> {
    return this.http.get<Subject[]>(`${this.baseUrl}/subjects/instructor/${instructorId}`, { headers: this.getHeaders() });
  }

  createSubject(subjectData: CreateSubjectRequest, instructorId: number): Observable<Subject> {
    const params = new HttpParams().set('instructorId', instructorId.toString());
    return this.http.post<Subject>(`${this.baseUrl}/subjects`, subjectData, { headers: this.getHeaders(), params });
  }

  addStudentToSubjectManual(subjectId: number, fullName: string, email: string): Observable<User> {
    const params = new HttpParams()
      .set('fullName', fullName)
      .set('email', email);
    return this.http.post<User>(`${this.baseUrl}/subjects/${subjectId}/students/manual`, {}, { headers: this.getHeaders(), params });
  }

  getEnrolledStudents(subjectId: number): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}/subjects/${subjectId}/students`, { headers: this.getHeaders() });
  }

  // Milestone APIs
  getMilestonesBySubject(subjectId: number): Observable<Milestone[]> {
    return this.http.get<Milestone[]>(`${this.baseUrl}/milestones/subject/${subjectId}`, { headers: this.getHeaders() });
  }

  createMilestone(milestoneData: CreateMilestoneRequest): Observable<Milestone> {
    return this.http.post<Milestone>(`${this.baseUrl}/milestones`, milestoneData, { headers: this.getHeaders() });
  }

  updateMilestone(id: number, milestoneData: CreateMilestoneRequest): Observable<Milestone> {
    return this.http.put<Milestone>(`${this.baseUrl}/milestones/${id}`, milestoneData, { headers: this.getHeaders() });
  }

  deleteMilestone(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/milestones/${id}`, { headers: this.getHeaders() });
  }

  // Submission APIs
  getSubmissionsByStudent(studentId: number): Observable<Submission[]> {
    return this.http.get<Submission[]>(`${this.baseUrl}/submissions/student/${studentId}`, { headers: this.getHeaders() });
  }

  uploadSubmission(formData: FormData): Observable<Submission> {
    return this.http.post<Submission>(`${this.baseUrl}/submissions/upload`, formData, { headers: this.getHeaders() });
  }

  getMilestoneRoster(milestoneId: number): Observable<MilestoneRosterEntry[]> {
    return this.http.get<MilestoneRosterEntry[]>(`${this.baseUrl}/submissions/milestone/${milestoneId}/roster`, { headers: this.getHeaders() });
  }

  reviewSubmission(submissionId: number, reviewData: ReviewSubmissionRequest): Observable<Submission> {
    return this.http.put<Submission>(`${this.baseUrl}/submissions/${submissionId}/review`, reviewData, { headers: this.getHeaders() });
  }

  // Leaderboard APIs
  getLeaderboard(subjectId: number): Observable<LeaderboardEntry[]> {
    return this.http.get<LeaderboardEntry[]>(`${this.baseUrl}/leaderboard/subject/${subjectId}`, { headers: this.getHeaders() });
  }
}
