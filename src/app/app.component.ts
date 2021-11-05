import { Component, OnDestroy, OnInit, Optional } from '@angular/core';

import { EMPTY, Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

import { Auth, authState, signInAnonymously, signOut, User, GoogleAuthProvider, signInWithPopup } from '@angular/fire/auth';
import { traceUntilFirst } from '@angular/fire/performance';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy{
  
  private readonly userDisposable: Subscription|undefined;
  public readonly user: Observable<User | null> = EMPTY;

  showLoginButton = false;
  showLogoutButton = false;

  constructor(@Optional() private auth: Auth) {
    if (auth) {
      this.user = authState(this.auth);
      this.userDisposable = authState(this.auth).pipe(
        traceUntilFirst('auth'),
        
      ).subscribe(user => {        
        const isLoggedIn = user !== null;
        this.showLoginButton = !isLoggedIn;
        this.showLogoutButton = isLoggedIn;
      });
    }
  }

  ngOnInit() {

  }

  log(msg: string) {
    console.log(msg);
  }
  ngOnDestroy() {
    if (this.userDisposable) {
      this.userDisposable.unsubscribe();
    }
  }

  async login() {
    return await signInWithPopup(this.auth, new GoogleAuthProvider());
  }
  
  async logout() {
    return await signOut(this.auth);
  }
  
}
