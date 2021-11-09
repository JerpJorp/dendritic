
import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import * as d3 from 'd3';

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

  readOnly = false;
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
    this.controller.readonly$.subscribe(x => this.readOnly = x);
  
  }

  Draw(graph: ProjectToDagre, ctx: CanvasRenderingContext2D) {

    const element = this.canvas?.nativeElement as HTMLCanvasElement;
    this.ctx?.clearRect(0, 0, element.width, element.height);

    ctx.shadowColor = '#AAAAAA';
    ctx.shadowBlur = 10;

    // Rectangle
    ctx.fillStyle = 'blue';

    ctx.font = "18px system-ui";
    ctx.textAlign = 'center'

    graph.edges.forEach(e => {
      const start = graph.graph.node(e.v);
      const end = graph.graph.node(e.w);
      ctx.strokeStyle = 'rgba(250,250,250,.125)';

      const startX = start.x + (start.width / 2);
      const startY = start.y + (start.height / 2);

      const endX = end.x + (end.width / 2);
      const endY = end.y + (end.height / 2)
     
      
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.bezierCurveTo(startX + start.width * 0.8, startY, startX + start.width * 0.8 + 20, endY, endX, endY);
      //ctx.lineTo(endX, endY);
      ctx.stroke();
    });

    graph.nodes.forEach(n => { 
      if (n.color) {
        ctx.fillStyle = n.color ? n.color : 'gray';
      }

      this.roundRect(n.x, n.y, n.width, n.height, 5);
      this.ctx?.fill();
      // ctx.fillRect(n.x, n.y, n.width, n.height) 
      if (n.displayName) {
        ctx.fillStyle ='black';
        ctx.fillText(n.displayName, n.x + (n.width / 2), n.y + 20, n.width - 10);
      }
    });
      
  }

  roundRect (x: number, y: number, w: number, h: number, r: number) {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    this.ctx?.beginPath();
    this.ctx?.moveTo(x+r, y);
    this.ctx?.arcTo(x+w, y,   x+w, y+h, r);
    this.ctx?.arcTo(x+w, y+h, x,   y+h, r);
    this.ctx?.arcTo(x,   y+h, x,   y,   r);
    this.ctx?.arcTo(x,   y,   x+w, y,   r);
    this.ctx?.closePath();
    return this;
  }
  
  canvasMouseDown(event: MouseEvent) {

    if (this.canvas&& this.ctx) {
      
      const element = this.canvas.nativeElement as HTMLCanvasElement;
      const bcr = element.getBoundingClientRect();
      const txfrm = this.ctx.getTransform();

      const offsetLeft =  element.offsetLeft || 0;
      const offSetTop = element.offsetTop || 0;

      const xVal = event.pageX - bcr.x - txfrm.e;
      const yVal = event.pageY - bcr.y - txfrm.f;

      if (this.graph) {
        const matching = this.graph.nodes.find(n => n.x < xVal && xVal < n.x + n.width && n.y < yVal && yVal < n.y + n.height);
        if (matching) {

          if (matching.bu) {
            this.controller.Select(matching.bu, matching.type);
          } else {
            this.controller.currentUnit$.next(undefined);
          }          
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
