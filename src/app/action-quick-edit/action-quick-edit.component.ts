import { Component, OnInit } from '@angular/core';
import { filter } from 'rxjs/operators';
import { Action } from '../classes/action';
import { ActionCondition } from '../classes/action-condition';
import { DendriticControllerService } from '../services/dendritic-controller.service';

@Component({
  selector: 'app-action-quick-edit',
  templateUrl: './action-quick-edit.component.html',
  styleUrls: ['./action-quick-edit.component.scss']
})
export class ActionQuickEditComponent implements OnInit {


  readOnly = false;
  tempActionName = '';
  action: Action | undefined;

  constructor(private controller: DendriticControllerService) { };

  ngOnInit(): void {
    this.controller.currentUnit$.pipe(filter(x => x?.type === 'action')).subscribe(x => {
      this.action = x?.baseUnit as Action
    });
  }

  Select(c: ActionCondition) {
    if (c.action) {
      this.controller.Select(c.action, 'action');
    }
  }

  nameValueChanged(newValue: string) {
    this.controller.AddDirt(this.action as Action);
    // add dirt?
  }

  AddCondition() {
    const parts = this.tempActionName.split('|');

    const condition = parts.length === 1 ? '' : parts[0];
    const action  = parts.length === 1 ? parts[0] : parts[1];

    const newCondition =  this.controller.AddCondition(this.action as Action, condition, action);
    this.Select(newCondition);
    this.tempActionName = '';
  }

  RemoveCondition(c: ActionCondition) {
    this.controller.RemoveCondition(this.action as Action, c);
  }



}
