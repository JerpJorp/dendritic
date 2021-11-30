import { Injectable } from '@angular/core';
import { DialogLayoutDisplay } from '@costlydeveloper/ngx-awesome-popup';
import { StorageMap } from '@ngx-pwa/local-storage';
import { now } from 'd3-timer';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Project, ProjectMetadata } from '../classes/project';
import { NotificationsService } from './notifications.service';

@Injectable({
  providedIn: 'root',
})
export class IndexedDbServiceDEPRECATED {
  readonly PREFIX = '_Dendritic.';
  projects$: BehaviorSubject<ProjectMetadata[] | undefined> = new BehaviorSubject<ProjectMetadata[] | undefined >(undefined);

  constructor(
    private storage: StorageMap,
    private notification: NotificationsService
  ) {
    this.Refresh();
  }

  Refresh() {
    const manifestKey = `${this.PREFIX}manifest`;
    this.storage.has(manifestKey).subscribe((hasKey) => {
      if (hasKey) {
        this.storage.get(`${this.PREFIX}manifest`).subscribe((x) => {
          this.projects$.next((x as { Projects: ProjectMetadata[] }).Projects);
        });
      } else {
        // user has never been to this site and saved anything
        this.projects$.next([]);
      }
    });
  }

  Save(p: Project) {
    const name = `${p.name}::${p.id}`;
    this.storage.set(`${this.PREFIX}${name}`, p).subscribe({
      next: () => {
        this.updateManifest(p);
      },
      error: (error) => {
        this.notification.toast(
          `Project save  error: ${JSON.stringify(error)}`,
          'Error',
          DialogLayoutDisplay.DANGER
        );
      },
    });
  }

  private updateManifest(p: Project) {
    const tracks = this.projects$.value || [];
    let trackMatch = tracks.find((x) => x.id === p.id);
    if (!trackMatch) {
      trackMatch = new ProjectMetadata(p.name, p.id, 0);
    }
    trackMatch.saveDate = Date.now();

    this.storage.set(`${this.PREFIX}manifest`, { Projects: tracks }).subscribe({
      next: () => {
        this.notification.toast(
          `Saved ${p.name}`,
          'Local Save',
          DialogLayoutDisplay.SUCCESS
        );
        this.Refresh();
      },
      error: (error) => {
        this.notification.toast(
          `Manifest save error: ${JSON.stringify(error)}`,
          'Error',
          DialogLayoutDisplay.DANGER
        );
      },
    });
  }

  LoadProject(projectId: string): Observable<Project> {
    return this.storage
      .get(`${this.PREFIX}${projectId}`)
      .pipe(map((x) => x as Project));
  }
}
