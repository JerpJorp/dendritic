import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { Action } from '../classes/action';
import { ActionCondition } from '../classes/action-condition';
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

  
  availableProjects$: BehaviorSubject<ProjectTrack[]> = new BehaviorSubject<ProjectTrack[]>([]);
  currentProject$: BehaviorSubject<Project | undefined> = new BehaviorSubject<Project | undefined>(undefined);

  concretions$: BehaviorSubject<Concretion[]> = new BehaviorSubject<Concretion[]>([]);
  currentConcretion$: BehaviorSubject<Concretion | undefined> = new BehaviorSubject<Concretion| undefined>(undefined);
  currentUnit$: BehaviorSubject<SelectedUnit | undefined> = new BehaviorSubject<SelectedUnit | undefined>(undefined);
  dirtyObjectCount$: BehaviorSubject<number> = new BehaviorSubject<number>(0);

  readonly$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  
  constructor(private indexDbSvc: IndexedDbService) {     
    this.RefreshAvailableProjects();    

    this.currentProject$.subscribe( p => {      
      this.currentConcretion$.next (p ? this.concretions$.value.find(x => x.name === p.concretion) : undefined);
    });
    
  }
  
  RefreshAvailableProjects() {

    this.concretions$.next(BuiltIns.DefaultConcretions);
    
    this.indexDbSvc.SavedProjects$.subscribe(idbProjectTrackList => {
      let projectList = BuiltIns.DefaultProjects.map(x =>  (new ProjectTrack(x.name, x.id, 'default')));
      projectList.push(... idbProjectTrackList);
      this.availableProjects$.next(projectList);
    });
  }

  LoadProjectId(id: string) {
      this.LoadProject(this.availableProjects$.value.find(x => x.id === id));
  }

  PossibilitiesFor(situation: Situation): Possibility[] {
    const possibilities = this.currentProject$.value?.possibilities || [];
    return situation.possibilityIds.map(x => ( possibilities.find(p => p.id === x) ))
      .filter(x => x !== undefined) as Possibility[];
  }

  AddInitialSituation(tempSituationName: any) {
    this.currentProject$.value?.situations.push(new Situation({name: tempSituationName, initial: true}));
    this.Republish();
  }

  RemoveInitialSituation(s: Situation) {

    if (this.currentProject$.value) {
      this.currentProject$.value.situations = this.currentProject$.value.situations.filter(x => x.id !== s.id);
      this.Republish();
    }
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

  RemoveCondition(action: Action, c: ActionCondition) {
    action.dirty = true;
    action.conditions = action.conditions.filter(x => x.id !== c.id)
    this.Republish();
  }

  AddCondition(parentAction: Action, conditionName: string, actionName: string): ActionCondition {

    const newCondition = new ActionCondition({name: conditionName});
    newCondition.action = new Action({name: actionName});
    parentAction.conditions.push(newCondition);
    this.Republish();
    return newCondition;
    
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

  AddDirt(bu: BaseUnit, skipRepublish?: boolean) {
    bu.dirty = true;    

    if (!skipRepublish) {
      this.Republish();
    } 
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
