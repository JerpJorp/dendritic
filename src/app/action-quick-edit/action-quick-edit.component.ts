import { Component, OnInit } from '@angular/core';
import { filter } from 'rxjs/operators';
import { BaseQuickEditComponent } from '../base-quick-edit/base-quick-edit.component';
import { Action } from '../classes/action';
import { ActionCondition } from '../classes/action-condition';
import { DendriticControllerService } from '../services/dendritic-controller.service';

@Component({
  selector: 'app-action-quick-edit',
  templateUrl: './action-quick-edit.component.html',
  styleUrls: ['./action-quick-edit.component.scss']
})
export class ActionQuickEditComponent extends BaseQuickEditComponent implements OnInit {

  lineMode = true;
  tempActionName = '';
  action: Action | undefined;

  constructor(controller: DendriticControllerService) { 
    super(controller);
  };

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

  ToggleLineMode() {
    this.lineMode = !this.lineMode;
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

    if (this.lineMode) {
      this.Select(newCondition);
    }
    
    this.tempActionName = '';
  }

  RemoveCondition(c: ActionCondition) {
    this.controller.RemoveCondition(this.action as Action, c);
  }



}
