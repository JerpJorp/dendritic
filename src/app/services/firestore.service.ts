import { Injectable } from '@angular/core';

import { BehaviorSubject, Observable } from 'rxjs';
import { Project, ProjectTrack } from '../classes/project';

import { Firestore, collectionData, collection, doc, setDoc, query } from '@angular/fire/firestore';

import { map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {
  
  projects$: BehaviorSubject<ProjectTrack[]|undefined> 
    = new BehaviorSubject<ProjectTrack[]|undefined>(undefined);
    
  actualProjects$: BehaviorSubject<Project[]> = new BehaviorSubject<Project[]>([])

  constructor(private fireStore: Firestore) { 

    const col = collection(fireStore, 'projects');
    
    collectionData(col).subscribe(x => {
      this.actualProjects$.next(x as Project[]);
      this.projects$.next(this.actualProjects$.value.map(p => ({name: p.name, id: p.id, source: 'fireStore'})))
    });

  }

  Upsert(project: Project) {
    setDoc(doc(this.fireStore, `projects/${project.id}`), project);
  }
}