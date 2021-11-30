import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { BehaviorSubject, from, Observable } from 'rxjs';
import { Project, ProjectMetadata } from '../classes/project';

import { getDownloadURL, ref, Storage, uploadString } from '@angular/fire/storage';
import { AuthService } from '../auth.service';
import { Cycle } from '../classes/cycle';
import { concatMap, map } from 'rxjs/operators';

import { NotificationsService } from './notifications.service';
import { DialogLayoutDisplay } from '@costlydeveloper/ngx-awesome-popup';

@Injectable({
  providedIn: 'root',
})
export class FirestoreService {
  currentUserId: string | undefined;

  projects$: BehaviorSubject<ProjectMetadata[] | undefined>
    = new BehaviorSubject<ProjectMetadata[] | undefined>(undefined);

  constructor(
    private storage: Storage,
    private auth: AuthService,
    private http: HttpClient,
    private notification: NotificationsService
  ) {
    this.auth.user$.subscribe((user) => {
      const id = user === null ? undefined : user.uid;
      if (this.currentUserId !== id) {
        this.currentUserId = id;
        this.Refresh();
      }
    });
  }

  Refresh() {
    if (this.currentUserId !== null) {
      const manifestRef = ref(
        this.storage,
        `${this.currentUserId}/manifest.json`
      );


      getDownloadURL(manifestRef).then(
        (url) => {
          this.http.get(url).subscribe((json) => {
            const x = json as { Projects: ProjectMetadata[] };
            this.projects$.next(x.Projects);
          });
        },
        (errorReason) => {
          if (errorReason.code === 'storage/object-not-found') {
            //user hasn't ever synced anything, no biggie, push out empty list.
            this.projects$.next([]);
          }
        }
      );
    } else {
      // user isn't logged in, has no project access in cloud
      this.projects$.next([]);
    }
  }

  Save(p: Project) {
    if (this.currentUserId) {
      const projectRef = ref(
        this.storage,
        `${this.currentUserId}/${p.id}.json`
      );

      uploadString(projectRef, JSON.stringify(Cycle.decycle(p))).then(
        (result) => {
          this.updateManifest(p);
        },
        (rejectReason) => {
          this.notification.toast(
            `Project sync error: ${JSON.stringify(rejectReason)}`,
            'Error',
            DialogLayoutDisplay.DANGER
          );
        }
      );
    } else {
      this.notification.toast(
        'You must be signed in to sync project content to the cloud',
        'Unsynchronized',
        DialogLayoutDisplay.WARNING,
        400
      );
    }
  }

  private updateManifest(p: Project) {
    const manifestRef = ref(
      this.storage,
      `${this.currentUserId}/manifest.json`
    );
    const tracks = this.projects$.value || [];
    let trackMatch = tracks.find((x) => x.id === p.id);
    if (!trackMatch) {
      trackMatch = new ProjectMetadata(p.name, p.id, 0);
    }
    trackMatch.saveDate = Date.now();
    trackMatch.name = p.name;

    uploadString(manifestRef, JSON.stringify({ Projects: tracks })).then(
      (result) => {
        this.notification.toast(
          `Synced ${p.name}`,
          'Cloud Sync',
          DialogLayoutDisplay.SUCCESS
        );
        this.Refresh();
      },
      (rejectReason) => {
        this.notification.toast(
          `Manifest sync error: ${JSON.stringify(rejectReason)}`,
          'Error',
          DialogLayoutDisplay.DANGER
        );
      }
    );
  }

  LoadProject(projectId: string): Observable<Project> {
    const projectRef = ref(this.storage, `${this.currentUserId}/${projectId}.json`);
    const url$ = from(getDownloadURL(projectRef));
    return url$.pipe(
      concatMap((url) =>
        this.http.get(url).pipe(map((obj) => Cycle.retrocycle(obj) as Project))
      )
    );
  }
}
