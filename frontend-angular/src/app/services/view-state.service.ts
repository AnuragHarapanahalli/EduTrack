import { Injectable, signal } from '@angular/core';
import { Subject as SubjectModel } from '../models/subject.model';

export type MainView =
  | 'AUTH'
  | 'CLASSES_HOME'
  | 'CLASS_DETAIL';

export type ClassTab =
  | 'STREAM'
  | 'CLASSWORK'
  | 'PEOPLE'
  | 'LEADERBOARD';

@Injectable({
  providedIn: 'root'
})
export class ViewStateService {

  // ---------------- Signals ----------------

  currentView = signal<MainView>('AUTH');

  currentTab = signal<ClassTab>('STREAM');

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

  goDashboard(): void {
    this.currentSubject.set(null);
    this.currentView.set('CLASSES_HOME');
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
}