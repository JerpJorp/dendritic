import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Edge, Node, ClusterNode } from '@swimlane/ngx-graph';

import { Project } from '../classes/project';
import { ProjectToGraph } from '../classes/project-to-graph';
import { DendriticControllerService } from '../services/dendritic-controller.service';

@Component({
  selector: 'app-project-view',
  templateUrl: './project-view.component.html',
  styleUrls: ['./project-view.component.scss']
})
export class ProjectViewComponent implements OnInit {

  projectId: string | undefined = '';
  project: Project | undefined = undefined;

  graph: ProjectToGraph | undefined;

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
      this.graph = this.project ? new ProjectToGraph(this.project) : undefined;
    });
  
  }

  NodeClick(node: Node) {

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
