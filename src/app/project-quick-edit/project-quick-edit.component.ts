import { Component } from '@angular/core';
import { BaseQuickEditComponent } from '../base-quick-edit/base-quick-edit.component';
import { Project } from '../classes/project';
import { Situation } from '../classes/situation';
import { DendriticControllerService } from '../services/dendritic-controller.service';

@Component({
  selector: 'app-project-quick-edit',
  templateUrl: './project-quick-edit.component.html',
  styleUrls: ['./project-quick-edit.component.scss']
})
export class ProjectQuickEditComponent extends BaseQuickEditComponent {

  project: Project | undefined;
  tempSituationName = '';

  situations: Situation[] | undefined;
  constructor(controller: DendriticControllerService) {
    super(controller);
   };

  onCurrentProjectDelta() {
    this.project =  this.currentProject?.project;
    this.situations = this.project ? this.project.situations.filter(x => x.initial) : undefined;
  }

  Select(s: Situation) {
    this.controller.Select(s, 'situation');
  }

  AddInitialSituation() {

    this.controller.AddInitialSituation(this.tempSituationName);
    this.tempSituationName = '';
  }

  RemoveSituation(s: Situation) {
    this.controller.RemoveInitialSituation(s);
  }

}
