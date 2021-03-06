import {
  Component,
  ViewChild,
  ElementRef,
  OnInit,
  AfterViewInit,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { SelectedUnit } from '../classes/common';
import { Project } from '../classes/project';

import { DendriticControllerService } from '../services/dendritic-controller.service';

import { ProjectToCanvasGraph } from '../classes/project-to-canvas-graph';

import {
  Node,
  GraphData,
  NgxCanvasGraphComponent,
  INodeCustomPostDraw,
} from '@dendrityc/ngx-canvas-graph';
import { CanvasHelper } from '@dendrityc/ngx-smart-canvas';

@Component({
  selector: 'app-project-canvas-view',
  templateUrl: './project-canvas-view.component.html',
  styleUrls: ['./project-canvas-view.component.scss'],
})
export class ProjectCanvasViewComponent implements OnInit, AfterViewInit {
  @ViewChild(NgxCanvasGraphComponent)
  private canvasGraphComponent!: NgxCanvasGraphComponent;

  projectId: string | undefined = '';
  project: Project | undefined = undefined;

  selectedUnit: SelectedUnit | undefined;

  stickyNode: Node | undefined;

  drag = false;
  dragStart: { x: number; y: number } = { x: 0, y: 0 };
  dragEnd: { x: number; y: number } = { x: 0, y: 0 };

  readOnly = false;

  graphData: GraphData = new GraphData();

  initialCollapseDepth = 3;

  constructor(
    private route: ActivatedRoute,
    private controller: DendriticControllerService
  ) {}
  ngAfterViewInit(): void {
    this.controller.currentProject$.subscribe((metadata) => {
      if (metadata && this.project && metadata.project.id === this.projectId) {
        //refresh;
        this.initialCollapseDepth = 99;
      } else {
        this.initialCollapseDepth = 3;
      }

      this.project = metadata?.project;
      if (this.project) {
        this.stickyNode = undefined;
        const oldInternalState = this.graphData
          ? this.graphData.nodes.map((old) => ({
              id: old.id,
              internalDisplayState: old.internalDisplayState,
            }))
          : [];

        const builder = ProjectToCanvasGraph.Build(this.project);

        if (oldInternalState) {
          oldInternalState
            .map((oldNode) => ({
              old: oldNode,
              new: builder.graphData.nodes.find(
                (newNode) => newNode.id === oldNode.id
              ),
            }))
            .filter((pair) => pair.new !== undefined)
            .forEach((pair) => {
              if (pair.old.internalDisplayState !== 'last' && pair.new) {
                pair.new.internalDisplayState = pair.old.internalDisplayState;
              }
            });
        }

        setTimeout(() => {
          this.graphData = builder.graphData;
        }, 0);
      }
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe((routeParams) => {
      this.projectId = routeParams.projectId;

      this.controller.LoadProjectId(this.projectId || '');
    });

    this.controller.currentUnit$.subscribe((x) => (this.selectedUnit = x));
    this.controller.readonly$.subscribe((x) => (this.readOnly = x));
  }

  nodeClick(node: Node) {
    if (this.stickyNode) {
      if (this.stickyNode.id === node.id) {
        this.stickyNode = undefined;
      } else {
        this.stickyNode = node;
      }
    } else {
      this.stickyNode = node;
    }

    this.canvasGraphComponent?.Draw();
    this.canvasGraphComponent?.mainLayer?.parentViewport.render();
    const selectedUnit = node.properties?.selectedUnit;
    if (selectedUnit) {
      this.controller.currentUnit$.next(selectedUnit as SelectedUnit);
    } else {
      this.controller.currentUnit$.next(undefined);
    }
  }

  nodeMouseOver(node: Node) {
    if (this.stickyNode === undefined) {
      const selectedUnit = node.properties?.selectedUnit;
      if (selectedUnit) {
        this.controller.currentUnit$.next(selectedUnit as SelectedUnit);
      } else {
        this.controller.currentUnit$.next(undefined);
      }
    }
  }

  nodePostDraw(params: INodeCustomPostDraw) {
    const n = params.extNode;
    const ctx = params.ctx;

    if (n.source && this.stickyNode && n.source.id === this.stickyNode.id) {
      ctx.lineWidth = 3;
      CanvasHelper.roundRect(
        ctx,
        n.x - 1,
        n.y - 1,
        n.width + 2,
        n.height + 2,
        6
      );
      params.ctx.strokeStyle = 'white';
      params.ctx.stroke();
    }
  }
}
