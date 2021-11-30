import { Component } from '@angular/core';
import { Router } from '@angular/router';

import * as dayjs from 'dayjs';

import { Project, ProjectInstance, ProjectMetadata } from '../classes/project';
import { Cycle } from '../classes/cycle';
import { DendriticControllerService } from '../services/dendritic-controller.service';
import { BaseQuickEditComponent } from '../base-quick-edit/base-quick-edit.component';
import { Concretion } from '../classes/concretion';
import { NotificationsService } from '../services/notifications.service';
import { DialogLayoutDisplay } from '@costlydeveloper/ngx-awesome-popup';

@Component({
  selector: 'app-available-projects',
  templateUrl: './available-projects.component.html',
  styleUrls: ['./available-projects.component.scss'],
})
export class AvailableProjectsComponent extends BaseQuickEditComponent {
  dirty = false;
  currentProject: ProjectInstance | undefined;
  rows: { metadata: ProjectMetadata; current: boolean; saveDate: string }[] =
    [];

  newName = '';
  selectedConcretion: Concretion | undefined;

  constructed = false;

  constructor(
    private svc: DendriticControllerService,
    private notification: NotificationsService,
    private router: Router
  ) {
    super(svc);
    this.constructed = true;
    this.Build();
  }

  onProjectsDelta() {
    if (this.constructed) {
      this.Build();
    }
  }
  onCurrentProjectDelta() {
    if (this.constructed) {
      this.Build();
    }
  }

  Build() {
    this.newName = this.currentProject?.project.name || '';

    this.selectedConcretion = this.currentProject
      ? this.controller.currentConcretion$.value
      : undefined;
    const currentId = this.currentProject?.project.id;
    this.dirty = currentId ? this.dirtyObjectCount > 0 : false;
    this.rows = (this.projects || []).map((metadata) => {
      const formattedDate =
        metadata.saveDate == -1
          ? 'never'
          : dayjs(metadata.saveDate).format('YYYYMMDD HH:mm:ss');
      return {
        metadata: metadata,
        current: metadata.id === currentId,
        saveDate: formattedDate,
      };
    });
  }

  OpenProject(metadata: ProjectMetadata) {
    if (this.currentProject && this.dirtyObjectCount > 0) {
      this.notification
        .confirmBox(
          'Opening a new project will cause unsaved changes to be lost.  Are you sure?',
          'Verify lost changes',
          DialogLayoutDisplay.WARNING
        )
        .subscribe((ok) => {
          if (ok) {
            this.router.navigate(['/view', metadata.id]);
          }
        });
    } else {
      this.router.navigate(['/view', metadata.id]);
    }
  }

  Save() {
    if (this.currentProject) {
      this.currentProject.project.name = this.newName;
      this.svc.SaveCurrentProject();
    }
  }

  FromClipboard() {
    if (this.currentProject && this.dirtyObjectCount > 0) {
      this.notification
        .confirmBox(
          'Importing a new project will cause unsaved changes to be lost.  Are you sure?',
          'Verify lost changes',
          DialogLayoutDisplay.WARNING
        )
        .subscribe((ok) => {
          if (ok) {
            this.fromClipboard();
          }
        });
    } else {
      this.fromClipboard();
    }
  }

  private fromClipboard() {
    navigator.clipboard.readText().then((s) => {
      const dto = Cycle.retrocycle(JSON.parse(s));
      const recreated = new Project(dto);
      recreated.dirty = true;
      recreated.NewId();
      this.controller.NewProject(recreated);
    });
  }

  ToClipboard() {
    if (this.controller.currentProject$.value) {
      navigator.clipboard
        .writeText(
          JSON.stringify(
            Cycle.decycle(this.controller.currentProject$.value.project),
            null,
            2
          )
        )
        .then((x) => {
          this.notification.toast(
            'Exported JSON content to your system clipboard.  Use CTRL+V to paste into a text file.',
            'Exported',
            DialogLayoutDisplay.SUCCESS
          );
        });
    }
  }
}
