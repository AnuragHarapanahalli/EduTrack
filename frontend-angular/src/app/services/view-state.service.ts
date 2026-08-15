import { Injectable, signal } from '@angular/core';
import { Subject as SubjectModel } from '../models/subject.model';

export type MainView =
  | 'AUTH'
  | 'CLASSES_HOME'
  | 'CLASS_DETAIL'
  | 'ADMIN_PANEL';

export type ClassTab =
  | 'STREAM'
  | 'CLASSWORK'
  | 'PEOPLE'
  | 'LEADERBOARD';

export type AdminTab =
  | 'USERS'
  | 'CLASSES'
  | 'LOGS'
  | 'STATS';

@Injectable({
  providedIn: 'root'
})
export class ViewStateService {

  // ---------------- Signals ----------------

  currentView = signal<MainView>('AUTH');

  currentTab = signal<ClassTab>('STREAM');

  adminTab = signal<AdminTab>('USERS');

  currentSubject = signal<SubjectModel | null>(null);

  subjects = signal<SubjectModel[]>([]);

  isSidebarOpen = signal(false);

  // ---------------- Getters ----------------

  get currentViewVal(): MainView {
    return this.currentView();
  }

  get currentTabVal(): ClassTab {
    return this.currentTab();
  }

  get adminTabVal(): AdminTab {
    return this.adminTab();
  }

  // Compatibility with new UI
  get activeClassTabVal(): string {
    return this.currentTab().toLowerCase();
  }

  get currentSubjectVal(): SubjectModel | null {
    return this.currentSubject();
  }

  get subjectsVal(): SubjectModel[] {
    return this.subjects();
  }

  get isSidebarOpenVal(): boolean {
    return this.isSidebarOpen();
  }

  // ---------------- View ----------------

  setView(view: MainView): void {
    this.currentView.set(view);
  }

  setAdminTab(tab: AdminTab): void {
    this.adminTab.set(tab);
  }

  goAdminPanel(tab: AdminTab = 'USERS'): void {
    this.currentSubject.set(null);
    this.adminTab.set(tab);
    this.currentView.set('ADMIN_PANEL');
    this.closeSidebar();
  }

  goDashboard(): void {
    this.currentSubject.set(null);
    const userJson = localStorage.getItem('edutrack_user');
    const user = userJson ? JSON.parse(userJson) : null;
    if (user?.role === 'ADMIN') {
      this.currentView.set('ADMIN_PANEL');
    } else {
      this.currentView.set('CLASSES_HOME');
    }
    this.closeSidebar();
  }

  // ---------------- Tabs ----------------

  setCurrentTab(tab: ClassTab): void {
    this.currentTab.set(tab);
  }

  // Compatibility with old code
  setClassTab(tab: string): void {
    this.currentTab.set(tab.toUpperCase() as ClassTab);
  }

  // ---------------- Subject ----------------

  selectSubject(subject: SubjectModel | null): void {

    this.currentSubject.set(subject);

    if (subject) {
      this.currentView.set('CLASS_DETAIL');
      const userJson = localStorage.getItem('edutrack_user');
      const user = userJson ? JSON.parse(userJson) : null;
      if (user?.role === 'STUDENT') {
        this.currentTab.set('CLASSWORK');
      } else {
        this.currentTab.set('STREAM');
      }
    } else {
      this.currentView.set('CLASSES_HOME');
    }

    this.closeSidebar();
  }

  // ---------------- Subjects ----------------

  setUserSubjects(subjects: SubjectModel[]): void {

    this.subjects.set(subjects);

    if (!this.currentSubject() && subjects.length > 0) {
      const userJson = localStorage.getItem('edutrack_user');
      const user = userJson ? JSON.parse(userJson) : null;
      if (user?.role !== 'STUDENT') {
        this.currentSubject.set(subjects[0]);
      }
    }
  }
  // Compatibility with old components
userSubjects(): SubjectModel[] {
  return this.subjects();
}

  // ---------------- Sidebar ----------------

  toggleSidebar(): void {
    this.isSidebarOpen.update(open => !open);
  }

  openSidebar(): void {
    this.isSidebarOpen.set(true);
  }

  closeSidebar(): void {
    this.isSidebarOpen.set(false);
  }

  refreshTrigger = signal<number>(0);

  triggerRefresh(): void {
    this.refreshTrigger.update(v => v + 1);
  }

  validationLimits = signal<any>({
    subjectNameMin: 3,
    subjectNameMax: 100,
    subjectCodeMin: 3,
    subjectCodeMax: 20,
    subjectDescriptionMax: 500,

    milestoneTitleMin: 3,
    milestoneTitleMax: 150,
    milestoneDescriptionMin: 5,
    milestoneDescriptionMax: 1000,
    milestonePointsMin: 10,
    milestonePointsMax: 1000,

    userFullnameMin: 2,
    userFullnameMax: 100,
    userEmailMax: 100,
    userPasswordMin: 6,
    userPasswordMax: 30,

    submissionCommentsMax: 500,
    submissionLinkMax: 255,
    submissionFileMaxBytes: 26214400
  });
}