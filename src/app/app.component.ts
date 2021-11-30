import { Component, OnDestroy, OnInit } from '@angular/core';

import { User } from '@angular/fire/auth';

import { NotificationsService } from './services/notifications.service';
import { DendriticControllerService } from './services/dendritic-controller.service';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  user: User | null = null;
  dirtyObjectCount = 0;
  showLoginButton = false;
  showLogoutButton = false;
  projectName = '';

  readOnly = false;
  ready = false;

  constructor(
    private auth: AuthService,
    private controller: DendriticControllerService,
    private notification: NotificationsService,
    private router: Router
  ) {
    this.auth.user$.subscribe((x) => {
      this.user = x;
      this.showLoginButton = this.user === null;
      this.showLogoutButton = !this.showLoginButton;
    });
  }

  ngOnInit() {
    this.controller.dirtyObjectCount$.subscribe(
      (x) => (this.dirtyObjectCount = x)
    );
    this.controller.currentProject$.subscribe((x) => {
      setTimeout(() => {
        this.projectName = x ? x.project.name : '';
      }, 0);
    });

    this.controller.readonly$.subscribe(
      (readonly) => (this.readOnly = readonly)
    );
    this.controller.projects$.subscribe(
      (metadataList) => (this.ready = metadataList !== undefined)
    );
  }

  ViewProject() {
    const id = this.controller.currentProject$.value?.project.id;

    if (id) {
      this.router.navigate(['/view', id]);
    }
  }

  ToggleReadOnly() {
    this.controller.readonly$.next(!this.controller.readonly$.value);
  }

  ngOnDestroy() {}

  login() {
    this.auth.Login();
  }
  logout() {
    this.auth.Logout();
  }
}
