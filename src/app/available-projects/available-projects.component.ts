import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProjectTrack } from '../classes/project';

import { DendriticControllerService } from '../services/dendritic-controller.service';

@Component({
  selector: 'app-available-projects',
  templateUrl: './available-projects.component.html',
  styleUrls: ['./available-projects.component.scss']
})
export class AvailableProjectsComponent implements OnInit {

  projects: ProjectTrack[] = [];
  constructor(private svc: DendriticControllerService, private router: Router) { }

  ngOnInit(): void {
    this.svc.availableProjects$.subscribe(x => this.projects = x )
  }

  SelectProject(projectTrack: ProjectTrack) {

    this.svc.LoadProject(projectTrack);

    this.router.navigate(['/view', projectTrack.id]);
  }
}
