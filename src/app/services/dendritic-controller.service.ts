import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { Action } from '../classes/action';
import { BaseUnit } from '../classes/base-unit';
import { BuiltIns } from '../classes/built-ins';
import { BuType, Common, SelectedUnit } from '../classes/common';
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

  concretions$: BehaviorSubject<Concretion[]> = new BehaviorSubject<Concretion[]>([]);
  currentConcretion$: BehaviorSubject<Concretion | undefined> = new BehaviorSubject<Concretion| undefined>(undefined);
  currentUnit$: BehaviorSubject<SelectedUnit | undefined> = new BehaviorSubject<SelectedUnit | undefined>(undefined);
  dirtyObjectCount$: BehaviorSubject<number> = new BehaviorSubject<number>(0);

  constructor(private indexDbSvc: IndexedDbService) {     
    this.RefreshAvailableProjects();    

    this.currentProject$.subscribe( p => {      
      this.currentConcretion$.next (p ? this.concretions$.value.find(x => x.name === p.concretion) : undefined);
    });
    
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

  PossibilitiesFor(situation: Situation): Possibility[] {
    const possibilities = this.currentProject$.value?.possibilities || [];
    return situation.possibilityIds.map(x => ( possibilities.find(p => p.id === x) ))
      .filter(x => x !== undefined) as Possibility[];
  }

  AddPossibility(situation: Situation, tempPossibilityName: string) {
    situation.dirty = true;
    const p = new Possibility({name: tempPossibilityName});
    situation.possibilityIds.push(p.id);

    this.currentProject$.value?.possibilities.push(p);
    if (this.currentUnit$.value && this.currentUnit$.value.baseUnit.id === situation.id) {
      this.currentUnit$.next(this.currentUnit$.value);
    }
    this.Republish();
  }

  RemovePossibility(situation: Situation, p: Possibility) {
    situation.dirty = true;
    situation.possibilityIds = situation.possibilityIds.filter(x => x !== p.id);
    this.Republish();
  }

  AddAction(possibility: Possibility, tempActionName: string) {
    possibility.dirty = true;
    const a = new Action({name: tempActionName});
    possibility.actions.push(a);

    if (this.currentUnit$.value && this.currentUnit$.value.baseUnit.id === possibility.id) {
      this.currentUnit$.next(this.currentUnit$.value);
    }
    this.Republish();
  }

  RemoveAction(possibility: Possibility, a: Action) {
    possibility.dirty = true;
    possibility.actions = possibility.actions.filter(x => x.id !== a.id);
    this.Republish();
  }

  Republish() {
    this.currentProject$.next(this.currentProject$.value);
    this.DirtyCheck();
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

  Select(bu: BaseUnit, type: BuType) {
    this.currentUnit$.next({baseUnit: bu, type: type});
  }

  AddDirt(bu: BaseUnit) {
    bu.dirty = true;    
  }

  DirtyCheck() {
      if (this.currentProject$.value) {
        const project = this.currentProject$.value;
        let count = project.situations.filter(x => x.dirty).length;

        project.possibilities.forEach(possibility => {
          count += possibility.DirtyCount();
        });
        this.dirtyObjectCount$.next(count);
      }

  }
}
