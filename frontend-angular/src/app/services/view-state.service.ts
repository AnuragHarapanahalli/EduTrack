import { Injectable, signal } from '@angular/core';
import { Subject as SubjectModel } from '../models/subject.model';

export type MainView = 'AUTH' | 'CLASSES_HOME' | 'CLASS_DETAIL';
export type ClassTab = 'stream' | 'classwork' | 'people' | 'leaderboard';

@Injectable({
  providedIn: 'root'
})
export class ViewStateService {
  currentView = signal<MainView>('AUTH');
  activeClassTab = signal<ClassTab>('stream');
  currentSubject = signal<SubjectModel | null>(null);
  userSubjects = signal<SubjectModel[]>([]);
  isSidebarOpen = signal<boolean>(false);

  get currentViewVal(): MainView {
    return this.currentView();
  }

  get activeClassTabVal(): ClassTab {
    return this.activeClassTab();
  }

  get currentSubjectVal(): SubjectModel | null {
    return this.currentSubject();
  }

  get userSubjectsVal(): SubjectModel[] {
    return this.userSubjects();
  }

  get isSidebarOpenVal(): boolean {
    return this.isSidebarOpen();
  }

  setView(view: MainView) {
    this.currentView.set(view);
  }

  setClassTab(tab: ClassTab) {
    this.activeClassTab.set(tab);
  }

  selectSubject(subject: SubjectModel | null) {
    this.currentSubject.set(subject);
    if (subject) {
      this.currentView.set('CLASS_DETAIL');
      this.activeClassTab.set('stream');
    }
  }

  setUserSubjects(subjects: SubjectModel[]) {
    this.userSubjects.set(subjects);
    if (!this.currentSubject() && subjects.length > 0) {
      this.currentSubject.set(subjects[0]);
    }
  }

  toggleSidebar() {
    this.isSidebarOpen.update(v => !v);
  }

  closeSidebar() {
    this.isSidebarOpen.set(false);
  }
}
