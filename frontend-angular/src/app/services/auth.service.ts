import { Injectable, signal } from '@angular/core';
import { User } from '../models/auth.model';


@Injectable({
  providedIn: 'root'
})
export class AuthService {


  private currentUserSignal = signal<User | null>(null);


  constructor() {
    this.loadUserFromStorage();
  }


  get currentUser() {
    return this.currentUserSignal.asReadonly();
  }


  get currentUserVal(): User | null {
    return this.currentUserSignal();
  }


  setCurrentUser(
    user: User | null,
    token?: string
  ) {

    this.currentUserSignal.set(user);


    if (user && token) {

      localStorage.setItem(
        'edutrack_jwt_token',
        token
      );

      localStorage.setItem(
        'edutrack_user',
        JSON.stringify(user)
      );

    }
  }



  logout() {

    this.currentUserSignal.set(null);

    localStorage.removeItem(
      'edutrack_jwt_token'
    );

    localStorage.removeItem(
      'edutrack_user'
    );

  }



  private loadUserFromStorage() {

    const savedUser =
      localStorage.getItem('edutrack_user');

    const savedToken =
      localStorage.getItem('edutrack_jwt_token');


    if (savedUser && savedToken) {

      try {

        this.currentUserSignal.set(
          JSON.parse(savedUser)
        );

      } catch {

        this.logout();

      }

    }

  }

}