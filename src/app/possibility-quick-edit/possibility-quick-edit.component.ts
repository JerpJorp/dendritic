import { Component, OnInit } from '@angular/core';
import { debounceTime, filter } from 'rxjs/operators';
import { BaseQuickEditComponent } from '../base-quick-edit/base-quick-edit.component';
import { Action } from '../classes/action';
import { Possibility } from '../classes/possibility';
import { DendriticControllerService } from '../services/dendritic-controller.service';

@Component({
  selector: 'app-possibility-quick-edit',
  templateUrl: './possibility-quick-edit.component.html',
  styleUrls: ['./possibility-quick-edit.component.scss']
})
export class PossibilityQuickEditComponent extends BaseQuickEditComponent implements OnInit {

  tempActionName = '';
  possibility: Possibility | undefined;

  constructor(controller: DendriticControllerService) {
    super(controller);
  };

  onCurrentUnitDelta() {
    if (this.currentUnit?.type === 'possibility') {
      this.possibility = this.currentUnit?.baseUnit as Possibility;
    }
  }

  ngOnInit(): void {
    this.changeDebounce.pipe(debounceTime(300)).subscribe(x => this.controller.AddDirt(this.possibility as Possibility));
  }

  Select(a: Action) {
    this.controller.Select(a, 'action');
  }

  nameValueChanged(newValue: string) {
    this.changeDebounce.next();
  }

  AddAction() {
    this.controller.AddAction(this.possibility as Possibility, this.tempActionName);
    this.tempActionName = '';
  }

  RemoveAction(a: Action) {
    this.controller.RemoveAction(this.possibility as Possibility, a);
  }


}
