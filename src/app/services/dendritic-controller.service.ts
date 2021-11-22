import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { Action } from '../classes/action';
import { ActionCondition } from '../classes/action-condition';
import { BaseUnit } from '../classes/base-unit';
import { BuiltIns } from '../classes/built-ins';
import { BuType, Common, SelectedUnit } from '../classes/common';
import { Concretion } from '../classes/concretion';
import { Possibility } from '../classes/possibility';
import { Project, ProjectTrack } from '../classes/project';
import { Situation } from '../classes/situation';
import { FirestoreService } from './firestore.service';
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

  readonly$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);

  allActions$: BehaviorSubject<Action[]> = new BehaviorSubject<Action[]>([]);
  
  Initialized$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  lastProjectId: string | undefined;
  
  constructor(private indexDbSvc: IndexedDbService, private fireStoreService: FirestoreService) {     

    this.concretions$.next(BuiltIns.DefaultConcretions);

    this.fireStoreService.projects$.subscribe(x => {
      console.log(x);
    });
    this.currentProject$.subscribe( p => {      
      this.currentConcretion$.next (p ? this.concretions$.value.find(x => x.name === p.concretion) : undefined);
      this.CreateAllActionList();
    });

    combineLatest([this.fireStoreService.projects$, this.indexDbSvc.SavedProjects$]).subscribe(x => {
        const [fpt, ltp] = x;

        let projectList = BuiltIns.DefaultProjects.map(x =>  (new ProjectTrack(x.name, x.id, 'default')));
        if (fpt) {
          projectList.push(... fpt);
        }
        if (ltp) {
          projectList.push(... ltp);
        }
        this.availableProjects$.next(projectList);
        this.Initialized$.next(fpt !== undefined && ltp !== undefined ? true : false);
        this.delayProjectLoadCheck();
    });
  }

  delayProjectLoadCheck() {
    if (this.lastProjectId !== undefined && this.Initialized$.value) {      
      const found = this.availableProjects$.value.find(x => x.id === this.lastProjectId);
      if (found) {
        if (this.currentProject$.value === undefined || this.currentProject$.value.id !== found.id) {
          this.LoadProjectId(found.id);
        }
      }
    }

  }

  checkReady() {
    const ready = this.indexDbSvc.Initialized$.value; // AND with any other things that need to be initialized

    if (ready !== this.Initialized$.value) {
      this.Initialized$.next(ready);
    }
  }

  LoadProjectId(id: string) {
    this.lastProjectId = id;
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

  AddConditionToExistingAction(parentAction: Action, conditionName: string, childAction: Action): ActionCondition {
    const newCondition = new ActionCondition({name: conditionName});
    newCondition.action = childAction;
    parentAction.conditions.push(newCondition);
    this.Republish();
    return newCondition;
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

  CreateAllActionList() {
    if (this.currentProject$.value) {
      const project = this.currentProject$.value;
      const possibilities = project.possibilities;
      const actions: Action[] = [];
      possibilities.forEach(p => p.actions.forEach(a => this.ActionLoadRecurse(a, actions)));
      this.allActions$.next(actions);
    }
  }

  ActionLoadRecurse(action: Action, list: Action[]) {
    if (list.find(x => x.id === action.id)) {
      return; // already processed
    }
    list.push(action)
    action.conditions
      .map(c => c.action)
      .filter(x => x !== undefined && !list.find(listItem => listItem.id === x.id))
      .map(x => x as Action)
      .forEach(childAction => this.ActionLoadRecurse(childAction, list));
  }
  LoadProject(pTrack: ProjectTrack | undefined) {
    this.currentUnit$.next(undefined);
    if (pTrack === undefined) {
      this.currentProject$.next(undefined);
    } else  if (pTrack.source === 'default') {
      this.currentProject$.next(BuiltIns.DefaultProjects.find(x => x.id === pTrack.id));
    } else if (pTrack.source === 'indexedDb') {
      this.indexDbSvc.GetProject(pTrack).subscribe(x => this.currentProject$.next(new Project(x)));
    } else if (pTrack.source === 'fireStore') {
      this.currentProject$.next(
        this.fireStoreService.actualProjects$.value.find(x => x.id === pTrack.id));
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

  CleanProject() {
    if (this.currentProject$.value) {
      const project = this.currentProject$.value;
      project.dirty = false;


      this.DirtyCheck();
    }
  }

  DirtyCheck() {
      if (this.currentProject$.value) {
        const project = this.currentProject$.value;

        let count = project.dirty ? 1 : 0;
        count += project.situations.filter(x => x.dirty).length;
        count += project.possibilities.filter(x => x.dirty).length;
        count += this.allActions$.value.filter(x => x.dirty).length;
        this.dirtyObjectCount$.next(count);
      }

  }
}
