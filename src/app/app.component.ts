import { Component, OnDestroy, OnInit, Optional } from '@angular/core';

import { EMPTY, Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

import { Auth, authState, signInAnonymously, signOut, User, GoogleAuthProvider, signInWithPopup } from '@angular/fire/auth';
import { traceUntilFirst } from '@angular/fire/performance';
import { DendriticControllerService } from './services/dendritic-controller.service';
import { Project } from './classes/project';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy{
  
  private readonly userDisposable: Subscription|undefined;
  public readonly user: Observable<User | null> = EMPTY;

  dirtyObjectCount = 0;
  showLoginButton = false;
  showLogoutButton = false;
  projectName = '';

  constructor(@Optional() private auth: Auth, private controller: DendriticControllerService) {
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
    this.controller.dirtyObjectCount$.subscribe(x => this.dirtyObjectCount = x);
    this.controller.currentProject$.subscribe(x => {
      setTimeout(() => {
        this.projectName = x ? x.name : '';
        console.log(this.projectName);        
      }, 0);
      
    });
  }

  ToggleReadOnly() {
    this.controller.readonly$.next(!this.controller.readonly$.value);
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
