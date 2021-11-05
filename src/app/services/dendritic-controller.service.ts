import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Action } from '../classes/action';
import { BaseUnit } from '../classes/base-unit';
import { BuiltIns } from '../classes/built-ins';
import { Concretion } from '../classes/concretion';
import { Possibility } from '../classes/possibility';
import { Project, ProjectTrack } from '../classes/project';
import { Situation } from '../classes/situation';
import { IndexedDbService } from './indexed-db.service';

@Injectable({
  providedIn: 'root'
})
export class DendriticControllerService {
  
  AvailableProjects$: BehaviorSubject<ProjectTrack[]> = new BehaviorSubject<ProjectTrack[]>([]);
  currentProject$: BehaviorSubject<Project | undefined> = new BehaviorSubject<Project | undefined>(undefined);

  currentBaseUnit$: BehaviorSubject<BaseUnit | undefined> = new BehaviorSubject<BaseUnit | undefined>(undefined);

  currentPossibilities$: BehaviorSubject<Possibility[]> = new BehaviorSubject<Possibility[]>([]);
  currentActions$: BehaviorSubject<Action[]> = new BehaviorSubject<Action[]>([]);
  
  concretions$: BehaviorSubject<Concretion[]> = new BehaviorSubject<Concretion[]>([]);
  
  constructor(private indexDbSvc: IndexedDbService) {     
    this.RefreshAvailableProjects();    
  }
  
  RefreshAvailableProjects() {
    this.indexDbSvc.SavedProjects$.subscribe(idbProjectTrackList => {
      let projectList = BuiltIns.DefaultProjects.map(x =>  (new ProjectTrack(x.name, x.id, 'default')));
      projectList.push(... idbProjectTrackList);
      this.AvailableProjects$.next(projectList);
    });
  }

  LoadProjectId(id: string) {

      this.LoadProject(this.AvailableProjects$.value.find(x => x.id === id));
  }

  LoadProject(pTrack: ProjectTrack | undefined) {
    
    if (pTrack === undefined) {
      this.currentProject$.next(undefined);
    } else  if (pTrack.source === 'default') {
      this.currentProject$.next(BuiltIns.DefaultProjects.find(x => x.id === pTrack.id));
    } else if (pTrack.source === 'indexedDb') {
      this.indexDbSvc.GetProject(pTrack).subscribe(x => this.currentProject$.next(x));
    }
    
  }


  SelectSituation(situation: Situation): void {
    const p = this.currentProject$.value;
    if (p == undefined) {
      throw new Error('this.currentProject$.value == undefined');
    } else {      
      const found = situation.PossibilityIds
        .map(pid => p.possibilities.find(p1 => p1.id === pid))
        .filter(x => x !== undefined) as Possibility[];
    this.currentPossibilities$.next(found);
    this.currentBaseUnit$.next(situation);
    }
  }

  SelectPossibility(possibility: Possibility): void {
    const p = this.currentProject$.value;
    if (p == undefined) {
      throw new Error('this.currentProject$.value == undefined');
    } else {      
      this.currentActions$.next(possibility.Actions);
      this.currentBaseUnit$.next(possibility);
    }
  }
}
