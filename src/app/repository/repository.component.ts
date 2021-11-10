import { Component, OnInit } from '@angular/core';
import { ProjectTrack, Project} from '../classes/project';
import { DendriticControllerService } from '../services/dendritic-controller.service';

@Component({
  selector: 'app-repository',
  templateUrl: './repository.component.html',
  styleUrls: ['./repository.component.scss']
})
export class RepositoryComponent implements OnInit {

  project: Project | undefined;
  availableProjects: ProjectTrack[] | undefined;

  constructor(
    private controller: DendriticControllerService,    
  ) { }

  ngOnInit(): void {
    this.controller.currentProject$.subscribe(x => this.project = x);
    this.controller.availableProjects$.subscribe(x => this.availableProjects = x);
  }


}
