import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Action } from '../classes/action';
import { SelectedUnit } from '../classes/common';
import { Concretion } from '../classes/concretion';
import { ProjectInstance, ProjectMetadata } from '../classes/project';
import { DendriticControllerService } from '../services/dendritic-controller.service';

@Component({
  selector: 'app-base-quick-edit',
  templateUrl: './base-quick-edit.component.html',
  styleUrls: ['./base-quick-edit.component.scss']
})
export class BaseQuickEditComponent implements OnDestroy {

  concretions: Concretion[] = [];
  currentConcretion: Concretion | undefined = undefined;
  readOnly = false;
  projects: ProjectMetadata[]|undefined;
  currentProject: ProjectInstance | undefined;
  dirtyObjectCount: number = 0;
  allActions: Action[] = [];
  currentUnit: SelectedUnit | undefined;

  changeDebounce: Subject<void> = new Subject<void>();

  unsubscribe: Subject<void> = new Subject<void>();

  constructor(protected controller: DendriticControllerService) {
    this.controller.concretions$.pipe(takeUntil(this.unsubscribe)).subscribe(x =>       { this.concretions = x;        this.onConcretionsDelta(); })
    this.controller.currentConcretion$.pipe(takeUntil(this.unsubscribe)).subscribe(x => { this.currentConcretion = x;  this.onCurrentConcretionsDelta(); });
    this.controller.readonly$.pipe(takeUntil(this.unsubscribe)).subscribe(x =>          { this.readOnly = x;           this.onReadOnlyDelta(); });
    this.controller.projects$.pipe(takeUntil(this.unsubscribe)).subscribe(x =>          { this.projects = x;           this.onProjectsDelta(); });
    this.controller.currentProject$.pipe(takeUntil(this.unsubscribe)).subscribe(x =>    { this.currentProject = x;     this.onCurrentProjectDelta(); })
    this.controller.dirtyObjectCount$.pipe(takeUntil(this.unsubscribe)).subscribe(x =>  { this.dirtyObjectCount = x;   this.onDirtyObjectCountDelta(); });
    this.controller.allActions$.pipe(takeUntil(this.unsubscribe)).subscribe(x =>        { this.allActions = x;         this.onAllActionsDelta(); })
    this.controller.currentUnit$.pipe(takeUntil(this.unsubscribe)).subscribe(x =>       { this.currentUnit = x;        this.onCurrentUnitDelta(); })
  }
  ngOnDestroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  // children can implement all of these if they care
  onConcretionsDelta() { }
  onCurrentConcretionsDelta() { }
  onReadOnlyDelta() { }
  onProjectsDelta() { }
  onCurrentProjectDelta() { }
  onDirtyObjectCountDelta() { }
  onAllActionsDelta() { }
  onCurrentUnitDelta() { }

}
