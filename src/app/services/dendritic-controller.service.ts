import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { filter, take } from 'rxjs/operators';
import { Action } from '../classes/action';
import { ActionCondition } from '../classes/action-condition';
import { BaseUnit } from '../classes/base-unit';
import { BuiltIns } from '../classes/built-ins';
import { BuType, SelectedUnit } from '../classes/common';
import { Concretion } from '../classes/concretion';
import { Possibility } from '../classes/possibility';
import { Project, ProjectInstance, ProjectMetadata } from '../classes/project';
import { Situation } from '../classes/situation';
import { FirestoreService } from './firestore.service';
import { NotificationsService } from './notifications.service';

@Injectable({
  providedIn: 'root',
})
export class DendriticControllerService {
  currentProject$: BehaviorSubject<ProjectInstance | undefined> =
    new BehaviorSubject<ProjectInstance | undefined>(undefined);

  concretions$: BehaviorSubject<Concretion[]> = new BehaviorSubject<
    Concretion[]
  >([]);
  currentConcretion$: BehaviorSubject<Concretion | undefined> =
    new BehaviorSubject<Concretion | undefined>(undefined);

  currentUnit$: BehaviorSubject<SelectedUnit | undefined> = new BehaviorSubject<
    SelectedUnit | undefined
  >(undefined);

  dirtyObjectCount$: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  readonly$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  allActions$: BehaviorSubject<Action[]> = new BehaviorSubject<Action[]>([]);

  constructor(
    private fireStoreService: FirestoreService,
    public notification: NotificationsService
  ) {
    this.concretions$.next(BuiltIns.DefaultConcretions);

    this.currentProject$.subscribe((projectMetadata) => {
      this.currentConcretion$.next(
        projectMetadata
          ? this.concretions$.value.find(
              (concretion) =>
                concretion.name === projectMetadata.project.concretion
            )
          : undefined
      );

      this.CreateAllActionList();
    });
  }

  get projects$(): BehaviorSubject<ProjectMetadata[] | undefined> {
    return this.fireStoreService.projects$;
  }

  PossibilitiesFor(situation: Situation): Possibility[] {
    const possibilities =
      this.currentProject$.value?.project.possibilities || [];
    return situation.possibilityIds
      .map((x) => possibilities.find((p) => p.id === x))
      .filter((x) => x !== undefined) as Possibility[];
  }

  AddInitialSituation(tempSituationName: any) {
    this.currentProject$.value?.project.situations.push(
      new Situation({ name: tempSituationName, initial: true })
    );
    this.Republish();
  }

  RemoveInitialSituation(s: Situation) {
    if (this.currentProject$.value) {
      this.currentProject$.value.project.situations =
        this.currentProject$.value.project.situations.filter(
          (x) => x.id !== s.id
        );
      this.currentProject$.value.project.dirty = true;
      this.Republish();
    }
  }

  AddPossibility(situation: Situation, tempPossibilityName: string) {
    situation.dirty = true;
    const p = new Possibility({ name: tempPossibilityName });
    situation.possibilityIds.push(p.id);

    this.currentProject$.value?.project.possibilities.push(p);
    if (
      this.currentUnit$.value &&
      this.currentUnit$.value.baseUnit.id === situation.id
    ) {
      this.currentUnit$.next(this.currentUnit$.value);
    }
    this.Republish();
  }

  RemovePossibility(situation: Situation, p: Possibility) {
    situation.dirty = true;
    situation.possibilityIds = situation.possibilityIds.filter(
      (x) => x !== p.id
    );
    this.Republish();
  }

  AddAction(possibility: Possibility, tempActionName: string) {
    possibility.dirty = true;
    const a = new Action({ name: tempActionName });
    possibility.actions.push(a);

    if (
      this.currentUnit$.value &&
      this.currentUnit$.value.baseUnit.id === possibility.id
    ) {
      this.currentUnit$.next(this.currentUnit$.value);
    }
    this.Republish();
  }

  RemoveAction(possibility: Possibility, a: Action) {
    possibility.dirty = true;
    possibility.actions = possibility.actions.filter((x) => x.id !== a.id);
    this.Republish();
  }

  RemoveCondition(action: Action, c: ActionCondition) {
    action.dirty = true;
    action.conditions = action.conditions.filter((x) => x.id !== c.id);
    this.Republish();
  }

  AddConditionToExistingAction(
    parentAction: Action,
    conditionName: string,
    childAction: Action
  ): ActionCondition {
    const newCondition = new ActionCondition({ name: conditionName });
    newCondition.action = childAction;
    parentAction.conditions.push(newCondition);
    parentAction.dirty = true;
    this.Republish();
    return newCondition;
  }

  AddCondition(
    parentAction: Action,
    conditionName: string,
    actionName: string
  ): ActionCondition {
    const newCondition = new ActionCondition({ name: conditionName });
    newCondition.action = new Action({ name: actionName });
    parentAction.conditions.push(newCondition);
    parentAction.dirty = true;
    this.Republish();
    return newCondition;
  }

  Republish() {
    this.currentProject$.next(this.currentProject$.value);
    this.DirtyCheck();
  }

  CreateAllActionList() {
    if (this.currentProject$.value) {
      const project = this.currentProject$.value.project;
      const possibilities = project.possibilities;
      const actions: Action[] = [];
      possibilities.forEach((p) =>
        p.actions.forEach((a) => this.ActionLoadRecurse(a, actions))
      );
      this.allActions$.next(actions);
    }
  }

  ActionLoadRecurse(action: Action, list: Action[]) {
    if (list.find((x) => x.id === action.id)) {
      return; // already processed
    }
    list.push(action);
    action.conditions
      .map((c) => c.action)
      .filter(
        (x) => x !== undefined && !list.find((listItem) => listItem.id === x.id)
      )
      .map((x) => x as Action)
      .forEach((childAction) => this.ActionLoadRecurse(childAction, list));
  }

  NewProject(newProject: Project) {
    const existing = this.projects$.value || [];
    const metaData = new ProjectMetadata(newProject.name, newProject.id, -1);
    existing.push(metaData);

    this.projects$.next(existing);
    this.currentProject$.next(new ProjectInstance(metaData, newProject));
    this.DirtyCheck();
  }

  LoadProjectId(projectId: string) {
    const match = this.projects$.value?.find((x) => x.id === projectId);
    if (match == undefined) {
      this.notification.toast(
        `Project id ${projectId} does not exist or you do not have access.`
      );
    } else if (this.currentProject$.value?.project.id !== projectId) {
      this.LoadProject(match);
    }
  }

  LoadProject(projectMetadata: ProjectMetadata) {
    this.fireStoreService
      .LoadProject(projectMetadata.id)
      .pipe(take(1))
      .subscribe((p) => {
        const project = new Project(p);
        this.currentProject$.next(
          new ProjectInstance(projectMetadata, project)
        );
      });
  }

  SaveCurrentProject() {
    if (this.currentProject$.value) {
      this.fireStoreService.Save(this.currentProject$.value.project);
      this.currentProject$.value.project.CleanProject();
      this.Republish();
    }
  }

  Select(bu: BaseUnit, type: BuType) {
    this.currentUnit$.next({ baseUnit: bu, type: type });
  }

  AddDirt(bu: BaseUnit, skipRepublish?: boolean) {
    bu.dirty = true;
    if (!skipRepublish) {
      this.Republish();
    }
  }

  CleanProject() {
    if (this.currentProject$.value) {
      this.currentProject$.value.project.CleanProject();
      this.DirtyCheck();
    }
  }

  DirtyCheck() {
    if (this.currentProject$.value) {
      const project = this.currentProject$.value.project;

      let count = project.dirty ? 1 : 0;
      count += project.situations.filter((x) => x.dirty).length;
      count += project.possibilities.filter((x) => x.dirty).length;
      count += this.allActions$.value.filter((x) => x.dirty).length;
      this.dirtyObjectCount$.next(count);
    }
  }
}
