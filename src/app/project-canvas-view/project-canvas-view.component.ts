
import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import * as d3 from 'd3';

import { SelectedUnit } from '../classes/common';
import { Project } from '../classes/project';
import { ProjectToDagre } from '../classes/project-to-dagre';
import { DendriticControllerService } from '../services/dendritic-controller.service';

import * as dagre from "dagre";
import { debounceTime } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { CanvasHelper, NgxCanvasGraphService } from 'ngx-canvas-graph';
import { ProjectToCanvasGraph } from '../classes/project-to-canvas-graph';
import { BaseUnit } from '../classes/base-unit';


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
  dragStart: { x: number, y: number } = { x: 0, y: 0 };
  dragEnd: { x: number, y: number } = { x: 0, y: 0 };

  readOnly = false;

  moveDebounce: Subject<MouseEvent> = new Subject<MouseEvent>();

  constructor(private route: ActivatedRoute, private controller: DendriticControllerService, private graphSvc: NgxCanvasGraphService) { }

  ngOnInit(): void {
    this.route.params.subscribe(routeParams => {
      this.projectId = routeParams.projectId;
      this.controller.LoadProjectId(this.projectId || '');
    });

    this.controller.currentProject$.subscribe(x => {
      this.project = x;
      if (this.project) {
        const builder = ProjectToCanvasGraph.Build(this.project);
        this.graphSvc.RenderBuilder(builder);
      }
     
    });

    this.graphSvc.nodeClick$.subscribe(x => {
      if (x?.properties?.selectedUnit) {
        this.controller.currentUnit$.next(x.properties.selectedUnit as SelectedUnit);
      } else {
        this.controller.currentUnit$.next(undefined);
      }
    });
    this.controller.currentUnit$.subscribe(x => this.selectedUnit = x);
    this.controller.readonly$.subscribe(x => this.readOnly = x);
  }

  // ngOnInit(): void {

  //   this.ctx = this.canvas?.nativeElement.getContext('2d');

  //   this.route.params.subscribe(routeParams => {
  //     this.projectId = routeParams.projectId;
  //     this.controller.LoadProjectId(this.projectId || '');
  //   });

  //   this.controller.currentProject$.subscribe(x => {
  //     this.project = x;
  //     this.graph = this.project ? new ProjectToDagre(this.project) : undefined;
  //     if (this.graph && this.ctx) { this.Draw(this.graph, this.ctx); }
  //   });

  //   this.controller.currentUnit$.subscribe(x => this.selectedUnit = x);
  //   this.controller.readonly$.subscribe(x => this.readOnly = x);

  //   this.moveDebounce.pipe(debounceTime(1)).subscribe(x => this.debounceMouseMove(x))
  // }

  Draw(graph: ProjectToDagre, ctx: CanvasRenderingContext2D) {

    const element = this.canvas?.nativeElement as HTMLCanvasElement;

    if (this.ctx) {
      const txfrm = this.ctx.getTransform();

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
          ctx.fillStyle = 'black';
          ctx.fillText(n.displayName, n.x + (n.width / 2), n.y + 20, n.width - 10);
        }
      });

    }

  }

  roundRect(x: number, y: number, w: number, h: number, r: number) {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    this.ctx?.beginPath();
    this.ctx?.moveTo(x + r, y);
    this.ctx?.arcTo(x + w, y, x + w, y + h, r);
    this.ctx?.arcTo(x + w, y + h, x, y + h, r);
    this.ctx?.arcTo(x, y + h, x, y, r);
    this.ctx?.arcTo(x, y, x + w, y, r);
    this.ctx?.closePath();
    return this;
  }

  canvasWheel(event: WheelEvent) {
    console.log(event.deltaY);

    // positive is zoom, negative is shrink\

    const inverter = event.deltaY > 0 ? 0.1 : -0.1;

    this.ctx?.scale(1+inverter, 1+inverter)
    if (this.graph && this.ctx) {
      this.Draw(this.graph, this.ctx)
    }
    return false
  }

  private abt(n: number): number {
    return Math.round(n * 100) / 100;
  }

  canvasMouseDown(event: MouseEvent) {

    if (this.canvas && this.ctx && this.graph) {

      const element = this.canvas.nativeElement as HTMLCanvasElement;
      const translatedXY = CanvasHelper.MouseToCanvas(element, this.ctx, event);
      
      const matching = this.graph.nodes.find(n => 
          n.x < translatedXY.x && translatedXY.x < n.x + n.width && 
          n.y < translatedXY.y && translatedXY.y < n.y + n.height);

      if (matching) {
        if (matching.bu) {
          this.controller.Select(matching.bu, matching.type);
        } else {
          this.controller.currentUnit$.next(undefined);
        }
      }

      this.dragStart = {
        x: event.pageX - element.offsetLeft,
        y: event.pageY - element.offsetTop
      }

      this.drag = true;
    }
  }

 

  canvasMouseClick(event: MouseEvent) {
    this.drag = false;
  }

  canvasMouseMove(event: MouseEvent) {
    if (this.drag) {
      this.moveDebounce.next(event);
    }
  }

  debounceMouseMove(event: MouseEvent) {

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

  MouseOver(node: dagre.Node) {
    // if (this.stickyNode === undefined) {
    //   this.SelectBaseUnit(node);
    // }    
  }
}
