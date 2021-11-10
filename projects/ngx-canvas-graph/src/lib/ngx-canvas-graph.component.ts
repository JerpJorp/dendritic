import { Component, ViewChild, ElementRef, OnInit, OnDestroy } from '@angular/core';

import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';

import * as dagre from "dagre";

import { NgxCanvasGraphService } from './ngx-canvas-graph.service';

import { Node } from './node';

import { CanvasHelper } from './canvas-helper';


@Component({
  selector: 'lib-ngx-canvas-graph',
  templateUrl: './ngx-canvas-graph.component.html',
  styles: [
    '.canvas-container { height: 90vh; border: 1px solid rgba(250,250,250,.125); overflow: hidden;}'
  ]
})
export class NgxCanvasGraphComponent implements OnInit, OnDestroy {

  @ViewChild('myCanvas', { static: true })
  canvas: ElementRef<HTMLCanvasElement> | undefined;

  ctx: CanvasRenderingContext2D | null | undefined = undefined;

  destroyed$: Subject<void> = new Subject<void>();

  edges: { start: dagre.Node, end: dagre.Node }[] = [];
  nodes: dagre.Node<IExtendedNode>[] = [];

  drag = false;

  dragStart: { x: number, y: number } = { x: 0, y: 0 };
  dragEnd: { x: number, y: number } = { x: 0, y: 0 };

  moveDebounce: Subject<MouseEvent> = new Subject<MouseEvent>();

  constructor(private svc: NgxCanvasGraphService) { }

  ngOnInit(): void {

    this.ctx = this.canvas?.nativeElement.getContext('2d');

    this.moveDebounce.pipe(debounceTime(1)).subscribe(x => this.debounceMouseMove(x))

    this.svc.nodes$
      .pipe(takeUntil(this.destroyed$))
      .subscribe(nodes => this.ProcessNodes());
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
  }

  ProcessNodes(): void {
    if (this.svc.nodes$.value) {
      const nodes = this.svc.nodes$.value.nodes;
      const links = this.svc.nodes$.value.links;
      const graph = new dagre.graphlib.Graph();
      graph.setGraph({ width: 1800, height: 1000, nodesep: 20, ranksep: 15, rankdir: 'LR' });
      nodes.forEach(node => graph.setNode(node.id, { width: 120, height: 40, source: node }));
      links.forEach(link => graph.setEdge(link.fromNodeId as string, link.toNodeId as string, { source: link }));
      dagre.layout(graph);
      this.edges = graph.edges().map(e => ({ start: graph.node(e.v), end: graph.node(e.w) }));
      this.nodes = graph.nodes().map(n => graph.node(n) as dagre.Node<IExtendedNode>);
    }
    if (this.ctx) {
      this.Draw(this.ctx);
    }
  }

  Draw(ctx: CanvasRenderingContext2D) {
    const element = this.canvas?.nativeElement as HTMLCanvasElement;    
    this.clear(ctx);
    ctx.shadowColor = '#AAAAAA';
    ctx.shadowBlur = 10;

    ctx.font = "18px system-ui";
    ctx.textAlign = 'center'
    this.edges.forEach(e => this.drawEdge(e, this.ctx as CanvasRenderingContext2D));
    this.nodes.forEach(n => this.drawNode(n, this.ctx as CanvasRenderingContext2D))

  }

  private drawEdge(e: { start: dagre.Node, end: dagre.Node }, ctx: CanvasRenderingContext2D) {
    ctx.strokeStyle = 'rgba(250,250,250,.125)';

    const startX = e.start.x + (e.start.width / 2);
    const startY = e.start.y + (e.start.height / 2);

    const endX = e.end.x + (e.end.width / 2);
    const endY = e.end.y + (e.end.height / 2)

    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.bezierCurveTo(startX + e.start.width * 0.8, startY, startX + e.start.width * 0.8 + 20, endY, endX, endY);
    ctx.stroke();
  }

  private drawNode(n: dagre.Node<IExtendedNode>, ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = n.source.backColor ? n.source.backColor : 'gray';
    this.roundRect(n.x, n.y, n.width, n.height, 5);
    this.ctx?.fill();
    if (n.source.displayText) {
      ctx.fillStyle = n.source.textColor ? n.source.textColor : 'black';
      ctx.fillText(n.source.displayText, n.x + (n.width / 2), n.y + 20, n.width - 10);
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

  canvasMouseDown(event: MouseEvent) {

    if (this.canvas && this.nodes.length > 0) {


      const matching = this.findMatchingNode(event);
      this.svc.nodeClick$.next(matching);

      const element = this.canvas.nativeElement as HTMLCanvasElement;

      this.dragStart = {
        x: event.pageX - element.offsetLeft,
        y: event.pageY - element.offsetTop
      }

      this.drag = true;
    }
  }

  canvasWheel(event: WheelEvent) {
    const inverter = event.deltaY > 0 ? 0.1 : -0.1;

    this.ctx?.scale(1 + inverter, 1 + inverter)
    if (this.ctx) {
      this.Draw(this.ctx)
    }
    return false
  }

  private findMatchingNode(event: MouseEvent): Node | undefined {

    if (this.canvas && this.ctx) {
      const element = this.canvas.nativeElement as HTMLCanvasElement;
      const translatedXY = CanvasHelper.MouseToCanvas(element, this.ctx, event);

      const matching = this.nodes.find(n =>
        n.x < translatedXY.x && translatedXY.x < n.x + n.width &&
        n.y < translatedXY.y && translatedXY.y < n.y + n.height);

      return matching ? matching.source : undefined;
    } else {
      return undefined;
    }


  }

  canvasMouseClick(event: MouseEvent) {
    this.drag = false;
  }

  canvasMouseMove(event: MouseEvent) {
    if (this.drag) {
      this.moveDebounce.next(event);
    } else if (this.canvas && this.nodes.length > 0) {
      const matching = this.findMatchingNode(event);
      this.svc.mouseOver$.next(matching);
    }
  }

  debounceMouseMove(event: MouseEvent) {

    const element = this.canvas?.nativeElement as HTMLCanvasElement;

    this.dragEnd = {
      x: event.pageX - element.offsetLeft,
      y: event.pageY - element.offsetTop
    }

    if (this.ctx) {      
      this.clear(this.ctx);
      const txfrm = this.ctx.getTransform();
      
      this.ctx?.translate((this.dragEnd.x - this.dragStart.x) / txfrm.a, (this.dragEnd.y - this.dragStart.y) / txfrm.d);
      this.dragStart = this.dragEnd;
      this.Draw(this.ctx);
    }
  }

  clear(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.setTransform(1,0,0,1,0,0);
    // Will always clear the right space
    ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height);
    ctx.restore();
    
  }
}


export interface IExtendedNode {
  source: Node;
}
