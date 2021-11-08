import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import * as d3 from 'd3';
import * as d3Scale from 'd3';
import * as d3Shape from 'd3';
import * as d3Array from 'd3';
import * as d3Axis from 'd3';

import * as dagre from "dagre";



@Component({
  selector: 'app-canvas-test',
  templateUrl: './canvas-test.component.html',
  styleUrls: ['./canvas-test.component.scss']
})
export class CanvasTestComponent implements OnInit {

  
  @ViewChild('myCanvas', { static: true })
  canvas: ElementRef<HTMLCanvasElement> | undefined;  

  ctx: CanvasRenderingContext2D | null | undefined = undefined;

  ngOnInit(): void {

    this.ctx = this.canvas?.nativeElement.getContext('2d');

    if (this.ctx) {
      this.ctx.fillStyle = "#D74022";
      this.ctx.fillRect(25, 25, 150, 150);

      this.ctx.fillStyle = "rgba(0,0,0,0.5)";
      this.ctx.clearRect(60, 60, 120, 120);
      this.ctx.fillRect(90, 90, 80, 80);
    }
  }

  animate(): void {}


}
