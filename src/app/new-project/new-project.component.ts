import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { BaseQuickEditComponent } from '../base-quick-edit/base-quick-edit.component';
import { Concretion } from '../classes/concretion';
import { Project } from '../classes/project';
import { DendriticControllerService } from '../services/dendritic-controller.service';

import { Faker } from '../classes/faker';
import { NotificationsService } from '../services/notifications.service';
import { DialogLayoutDisplay } from '@costlydeveloper/ngx-awesome-popup';

@Component({
  selector: 'app-new-project',
  templateUrl: './new-project.component.html',
  styleUrls: ['./new-project.component.scss'],
})
export class NewProjectComponent extends BaseQuickEditComponent {
  newName = 'My New Project';
  selectedConcretion: Concretion | undefined;

  generateFakeStructure = false;

  constructor(
    controller: DendriticControllerService,
    private notification: NotificationsService,
    private router: Router
  ) {
    super(controller);
  }

  CreateProject() {
    if (
      this.controller.currentProject$.value &&
      this.controller.dirtyObjectCount$.value > 0
    ) {
      this.notification
        .confirmBox(
          'Creating a new project will cause unsaved changes to be lost.  Are you sure?',
          'Verify lost changes',
          DialogLayoutDisplay.WARNING
        )
        .subscribe((ok) => {
          if (ok) {
            this.Generate();
          }
        });
    } else {
      this.Generate();
    }
  }

  private Generate() {
    const newProject = new Project({
      name: this.newName,
      concretion: this.selectedConcretion?.name,
    });
    if (this.generateFakeStructure) {
      const faker: Faker = new Faker();
      faker.FakeUpProject(newProject);
    }

    this.controller.NewProject(newProject);
    this.controller.readonly$.next(false);
    this.router.navigate(['/view', newProject.id]);
  }
}
