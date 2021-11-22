import { Component, OnInit } from '@angular/core';
import { debounceTime, filter } from 'rxjs/operators';
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

  allActions: Action[] = [];
  theseActions: Action[] = [];
  selectedChildAction: Action | undefined;
  
  constructor(controller: DendriticControllerService) { 
    super(controller);
  };

  ngOnInit(): void {
    this.controller.currentUnit$.pipe(filter(x => x?.type === 'action')).subscribe(x => {
      this.action = x?.baseUnit as Action;
      this.filterAllActions();
      this.selectedChildAction = undefined;
    });

    this.controller.allActions$.subscribe(x => {

      this.allActions = x;
      this.filterAllActions();

    });
    this.changeDebounce.pipe(debounceTime(300)).subscribe(x => this.controller.AddDirt(this.action as Action));
  }

  filterAllActions() {
    if (this.action !== undefined && this.allActions) {

      const invalidActionIds = [this.action.id];

      // cant pick  existing child
      this.action.conditions.forEach(condition => {
        if (condition.action) {
          invalidActionIds.push(condition.action.id);
        }
      });

      //cant pick immediate parent
      if (this.action.pathToRoot.length > 2) {
        const l = this.action.pathToRoot.length;
        invalidActionIds.push(this.action.pathToRoot[l - 2].id)
      }





      this.theseActions = this.allActions.filter(a => !invalidActionIds.find(invalid => invalid === a.id) )
    } else {
      this.theseActions = [];
    }
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
    
    this.changeDebounce.next();
    
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

  childActionChanged() {
    if (this.selectedChildAction) {
      this.controller.AddConditionToExistingAction(this.action as Action, '', this.selectedChildAction);
      this.selectedChildAction = undefined;
    }
    
  }


}
