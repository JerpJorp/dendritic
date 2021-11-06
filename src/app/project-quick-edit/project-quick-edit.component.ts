import { Component, OnInit } from '@angular/core';
import { Project } from '../classes/project';
import { Situation } from '../classes/situation';
import { DendriticControllerService } from '../services/dendritic-controller.service';
@Component({
  selector: 'app-project-quick-edit',
  templateUrl: './project-quick-edit.component.html',
  styleUrls: ['./project-quick-edit.component.scss']
})
export class ProjectQuickEditComponent implements OnInit {

  
                  
  readOnly = false;
  project: Project | undefined;
  tempSituationName = '';

  situations: Situation[] | undefined;
  constructor(private controller: DendriticControllerService) { };

  ngOnInit(): void {

    this.controller.currentProject$.subscribe(x => {
      this.project = x;
      this.situations = this.project ? this.project.situations.filter(x => x.initial) : undefined;
    });
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
