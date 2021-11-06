import { Component, OnInit } from '@angular/core';
import { Concretion } from '../classes/concretion';
import { DendriticControllerService } from '../services/dendritic-controller.service';

@Component({
  selector: 'app-base-quick-edit',
  templateUrl: './base-quick-edit.component.html',
  styleUrls: ['./base-quick-edit.component.scss']
})
export class BaseQuickEditComponent {

  readOnly = false;

  concretion: Concretion | undefined = undefined;

  constructor(protected controller: DendriticControllerService) { 
    this.controller.currentConcretion$.subscribe(x => this.concretion = x);
    this.controller.readonly$.subscribe(x => this.readOnly = x);
  }


}
