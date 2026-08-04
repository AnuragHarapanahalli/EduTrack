import { Injectable, signal } from '@angular/core';

export type ThemeMode = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {

  private currentTheme = signal<ThemeMode>('light');

  constructor() {
    const saved = localStorage.getItem('edutrack_theme') as ThemeMode | null;

    if (saved === 'dark') {
      this.setTheme('dark');
    } else {
      this.setTheme('light');
    }
  }

  theme() {
    return this.currentTheme();
  }

  setTheme(theme: ThemeMode) {
    this.currentTheme.set(theme);

    localStorage.setItem('edutrack_theme', theme);

    document.body.classList.remove('light-theme', 'dark-theme');

    document.body.classList.add(
      theme === 'dark'
        ? 'dark-theme'
        : 'light-theme'
    );
  }

  toggleTheme() {

  alert("Theme Service Called");

  if (this.currentTheme() === 'light') {
    this.setTheme('dark');
  } else {
    this.setTheme('light');
  }

}

  isDark() {
    return this.currentTheme() === 'dark';
  }
}