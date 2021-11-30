import { Injectable, Optional } from '@angular/core';

import { Auth, authState, signOut, User, GoogleAuthProvider, signInWithPopup } from '@angular/fire/auth';
import { traceUntilFirst } from '@angular/fire/performance';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  ready$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  user$: BehaviorSubject<User | null> = new BehaviorSubject<User | null>(null);;
  
  constructor(@Optional() private auth: Auth) { 
    if (this.auth) {     
      authState(this.auth)
        .pipe( traceUntilFirst('auth') )
        .subscribe(user =>  this.user$.next(user) ); }
  }

  async Login() {
    return await signInWithPopup(this.auth, new GoogleAuthProvider());
  }
  
  async Logout() {
    return await signOut(this.auth);
  }
  
}
