import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Node } from '@swimlane/ngx-graph';
import { SelectedUnit } from '../classes/common';

import { Project } from '../classes/project';
import { ProjectToGraphDeprecated } from '../classes/project-to-graph';
import { DendriticControllerService } from '../services/dendritic-controller.service';

@Component({
  selector: 'app-project-view',
  templateUrl: './project-view.component.html',
  styleUrls: ['./project-view.component.scss']
})
export class ProjectViewComponent implements OnInit {

  projectId: string | undefined = '';
  project: Project | undefined = undefined;

  selectedUnit: SelectedUnit | undefined;

  graph: ProjectToGraphDeprecated | undefined;

  constructor(private route: ActivatedRoute, private controller: DendriticControllerService) { }

  ngOnInit(): void {
    // const routeParams = this.route.snapshot.paramMap;
    // this.projectId = routeParams.get('projectId');

    this.route.params.subscribe(routeParams => {
      this.projectId = routeParams.projectId;
      this.controller.LoadProjectId(this.projectId || '');
    });

    this.controller.currentProject$.subscribe(x => {
      this.project = x;
      this.graph = this.project ? new ProjectToGraphDeprecated(this.project) : undefined;
    });

    this.controller.currentUnit$.subscribe(x => this.selectedUnit = x);
  
  }

  NodeClick(node: Node) {

    if (node.id === ProjectToGraphDeprecated.RootID) {
      this.controller.currentUnit$.next(undefined);
    } else {
      this.controller.Select(node.data, node.meta.type);
    }
    

    // if (node.id === 'application') {
    //   this.SetSticky(undefined);
    // } else if (this.stickyNode === undefined) {      
    //   this.SetSticky(node);
    // } else {
    //   this.SetSticky(this.stickyNode.id !== node.id ? node : undefined);      
    // } 
  }

  // SetSticky(node: Node | undefined) {
  //   this.stickyNode = node;
  //   this.nodes.forEach(x => {
  //     x.meta.sticky = this.stickyNode === undefined ? 
  //       false : 
  //         this.stickyNode.id === x.id ? 
  //           true : 
  //           false;      
  //   });

  //   this.nodes == [... this.nodes];
  //   if (this.stickyNode !== undefined) {
  //     this.SelectBaseUnit(this.stickyNode);
  //   }
  // }

  MouseOver(node: Node) {
    // if (this.stickyNode === undefined) {
    //   this.SelectBaseUnit(node);
    // }    
  }

}
