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


@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private readonly baseUrl = 'http://localhost:8080/api';


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


  register(
    fullName: string,
    email: string,
    password: string,
    role: string,
    batchId = 1
  ): Observable<AuthResponse> {

    return this.http.post<AuthResponse>(
      `${this.baseUrl}/auth/register`,
      {
        fullName,
        email,
        password,
        role,
        batchId
      }
    );
  }


  getUserById(id: number): Observable<User> {
    return this.http.get<User>(
      `${this.baseUrl}/auth/users/${id}`,
      this.options
    );
  }



  // ---------------- SUBJECTS ----------------

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

}