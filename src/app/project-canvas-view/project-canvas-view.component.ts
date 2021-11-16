
import { Component, ViewChild, ElementRef, OnInit, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import * as d3 from 'd3';

import { SelectedUnit } from '../classes/common';
import { Project } from '../classes/project';
import { ProjectToDagre } from '../classes/project-to-dagre';
import { DendriticControllerService } from '../services/dendritic-controller.service';


import { ProjectToCanvasGraph } from '../classes/project-to-canvas-graph';

import { GraphBuilder, Node, BuiltNode, Link, GraphData, INodeOverrideParameters, ILinkOverrideParameters, IClearOverrideParameters  } from 'ngx-canvas-graph';

@Component({
  selector: 'app-project-canvas-view',
  templateUrl: './project-canvas-view.component.html',
  styleUrls: ['./project-canvas-view.component.scss']
})
export class ProjectCanvasViewComponent implements OnInit, AfterViewInit {

  @ViewChild('myCanvas', { static: true })
  canvas: ElementRef<HTMLCanvasElement> | undefined;

  ctx: CanvasRenderingContext2D | null | undefined = undefined;

  projectId: string | undefined = '';
  project: Project | undefined = undefined;

  selectedUnit: SelectedUnit | undefined;

  graph: ProjectToDagre | undefined;

  drag = false;
  dragStart: { x: number, y: number } = { x: 0, y: 0 };
  dragEnd: { x: number, y: number } = { x: 0, y: 0 };

  readOnly = false;

  graphData: GraphData = new GraphData();



  constructor(private route: ActivatedRoute, private controller: DendriticControllerService) { }
  ngAfterViewInit(): void {
    this.controller.currentProject$.subscribe(x => {
      this.project = x;
      if (this.project) {
        const builder = ProjectToCanvasGraph.Build(this.project);
        this.graphData = builder.graphData;
      }     
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(routeParams => {
      this.projectId = routeParams.projectId;
      this.controller.LoadProjectId(this.projectId || '');
    });



    this.controller.currentUnit$.subscribe(x => this.selectedUnit = x);
    this.controller.readonly$.subscribe(x => this.readOnly = x);
  }


  nodeClick(node: Node) {
    const selectedUnit = node.properties?.selectedUnit;
    if (selectedUnit) {
      this.controller.currentUnit$.next(selectedUnit as SelectedUnit);
    } else {
      this.controller.currentUnit$.next(undefined);
    }
  }

  nodeMouseOver(node: Node) {
    
  }

  
}
