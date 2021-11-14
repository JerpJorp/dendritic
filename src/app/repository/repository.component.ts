import { Component, OnInit } from '@angular/core';
import { ProjectTrack, Project} from '../classes/project';
import { DendriticControllerService } from '../services/dendritic-controller.service';
import { FirestoreService } from '../services/firestore.service';

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
    private fsSvc: FirestoreService
  ) { }

  ngOnInit(): void {
    this.controller.currentProject$.subscribe(x => this.project = x);
    this.controller.availableProjects$.subscribe(x => this.availableProjects = x);
  }

  Save(): void {
    if (this.project) {
      this.fsSvc.Upsert(this.project);
    }
  }

}
