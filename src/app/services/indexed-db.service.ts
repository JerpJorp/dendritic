import { Injectable } from '@angular/core';
import { StorageMap } from '@ngx-pwa/local-storage';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Project, ProjectTrack } from '../classes/project';

@Injectable({
  providedIn: 'root'
})
export class IndexedDbService {

  readonly PREFIX = '_Dendritic.';
  
  SavedProjects$: BehaviorSubject<ProjectTrack[]> = new BehaviorSubject<ProjectTrack[]>([]);

  constructor(private storage: StorageMap) { 
    this.RefreshKeys();
  }

  GetProject(pTrack: ProjectTrack): Observable<Project> {
    const name = `${pTrack.name}::${pTrack.id}`;    
    return this.storage.get(`${this.PREFIX}${name}`).pipe(map(x => x as Project));
  }

  

  RefreshKeys() {
    const keys: string[] = [];

    this.storage.keys().subscribe({
      next: (key) =>  { keys.push(key); },
      complete: () => { 
        this.SavedProjects$.next(
          keys
            .filter(k => k.startsWith(this.PREFIX) )
            .map(x => x.replace(this.PREFIX, ''))
            .map(x => {
              const parts = x.split('::');
              return new ProjectTrack(parts[0], parts[1], 'indexedDb')
            }));
      },
    });    
  }

}
