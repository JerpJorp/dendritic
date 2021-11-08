
import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';

import { ActivatedRoute } from '@angular/router';

import { SelectedUnit } from '../classes/common';

import { Project } from '../classes/project';
import { ProjectToDagre } from '../classes/project-to-dagre';

import { DendriticControllerService } from '../services/dendritic-controller.service';

import * as dagre from "dagre";

@Component({
  selector: 'app-project-canvas-view',
  templateUrl: './project-canvas-view.component.html',
  styleUrls: ['./project-canvas-view.component.scss']
})
export class ProjectCanvasViewComponent implements OnInit {

  @ViewChild('myCanvas', { static: true })
  canvas: ElementRef<HTMLCanvasElement> | undefined;  

  ctx: CanvasRenderingContext2D | null | undefined = undefined;

  projectId: string | undefined = '';
  project: Project | undefined = undefined;

  selectedUnit: SelectedUnit | undefined;

  graph: ProjectToDagre | undefined;

  drag = false;
  dragStart: {x: number, y: number} = {x: 0, y: 0};
  dragEnd: {x: number, y: number} = {x: 0, y: 0};

  constructor(private route: ActivatedRoute, private controller: DendriticControllerService) { }

  ngOnInit(): void {

    this.ctx = this.canvas?.nativeElement.getContext('2d');
    // const routeParams = this.route.snapshot.paramMap;
    // this.projectId = routeParams.get('projectId');

    this.route.params.subscribe(routeParams => {
      this.projectId = routeParams.projectId;
      this.controller.LoadProjectId(this.projectId || '');
    });

    this.controller.currentProject$.subscribe(x => {
      this.project = x;
      this.graph = this.project ? new ProjectToDagre(this.project) : undefined;
      if (this.graph && this.ctx) {this.Draw(this.graph, this.ctx);}
    });

    this.controller.currentUnit$.subscribe(x => this.selectedUnit = x);
  
  }

  Draw(graph: ProjectToDagre, ctx: CanvasRenderingContext2D) {

    ctx.shadowColor = '#AAAAAA';
    ctx.shadowBlur = 10;

    // Rectangle
    ctx.fillStyle = 'blue';

    ctx.font = "12px system-ui";
    ctx.textAlign = 'center'

    graph.edges.forEach(e => {
      const start = graph.graph.node(e.v);
      const end = graph.graph.node(e.w)
      ctx.beginPath();
      ctx.moveTo(start.x + (start.width / 2), start.y + (start.height /2));
      ctx.lineTo(end.x + (end.width / 2), end.y + (end.height / 2));
      ctx.stroke();
    });

    graph.nodes.forEach(n => { 
      if (n.color) {
        ctx.fillStyle = n.color ? n.color : 'gray';
      }
      ctx.fillRect(n.x, n.y, n.width, n.height) 
      if (n.displayName) {
        ctx.fillStyle ='black';
        ctx.fillText(n.displayName, n.x + (n.width / 2), n.y + 14, n.width - 10);
      }
    });
      
  }

  canvasMouseDown(event: MouseEvent) {

    if (this.canvas&& this.ctx) {
      
      const element = this.canvas.nativeElement as HTMLCanvasElement;


      const bcr = element.getBoundingClientRect();

      const txfrm = this.ctx.getTransform();

      console.log('getTransform: ' + JSON.stringify(this.ctx.getTransform()));

      const offsetLeft =  element.offsetLeft || 0;
      const offSetTop = element.offsetTop || 0;


      console.log('Bounding client rect: ' + JSON.stringify(element.getBoundingClientRect()));
      console.log('Bounding page x/y: ' + event.pageX + ', ' + event.pageY);

      
     

      

      const xVal = event.pageX - bcr.x - txfrm.e;
      const yVal = event.pageY - bcr.y - txfrm.f;

      if (this.graph) {
        const matching = this.graph.nodes.find(n => n.x < xVal && xVal < n.x + n.width && n.y < yVal && yVal < n.y + n.height);
        if (matching?.bu) {
          this.controller.Select(matching.bu, matching.type);
        }
      }
      
      this.dragStart = {
        x: event.pageX - element.offsetLeft,
        y: event.pageY - element.offsetTop
      }

      this.drag = true;
    }
  }
  canvasMouseClick(event: any) {
    
  }

  canvasMouseMove(event: any) {
    

    if (this.drag) {

      const element = this.canvas?.nativeElement as HTMLCanvasElement;
      this.dragEnd = {
        x: event.pageX - element.offsetLeft,
        y: event.pageY - element.offsetTop
      }

      this.ctx?.clearRect(0, 0, element.width, element.height);
      this.ctx?.translate(this.dragEnd.x - this.dragStart.x, this.dragEnd.y - this.dragStart.y);
      this.dragStart = this.dragEnd;

      if (this.graph && this.ctx) {
        this.Draw(this.graph, this.ctx)
      }     
    }
  }

  NodeClick(node: dagre.Node) {

    if (node.label === ProjectToDagre.RootID) {
      this.controller.currentUnit$.next(undefined);
    } else {
      //this.controller.Select(node.data, node.meta.type);
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

  MouseOver(node: dagre.Node) {
    // if (this.stickyNode === undefined) {
    //   this.SelectBaseUnit(node);
    // }    
  }
}
