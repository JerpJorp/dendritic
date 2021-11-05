import { Component, OnInit } from '@angular/core';
import { filter } from 'rxjs/operators';
import { Action } from '../classes/action';
import { Possibility } from '../classes/possibility';
import { DendriticControllerService } from '../services/dendritic-controller.service';

@Component({
  selector: 'app-possibility-quick-edit',
  templateUrl: './possibility-quick-edit.component.html',
  styleUrls: ['./possibility-quick-edit.component.scss']
})
export class PossibilityQuickEditComponent implements OnInit {

  readOnly = false;
  tempActionName = '';
  possibility: Possibility | undefined;

  constructor(private controller: DendriticControllerService) { };

  ngOnInit(): void {
    this.controller.currentUnit$.pipe(filter(x => x?.type === 'possibility')).subscribe(x => {
      this.possibility = x?.baseUnit as Possibility
    });
  }

  Select(a: Action) {
    this.controller.Select(a, 'action');
  }

  nameValueChanged(newValue: string) {
    this.controller.AddDirt(this.possibility as Possibility);
    // add dirt?
  }

  AddAction() {
    this.controller.AddAction(this.possibility as Possibility, this.tempActionName);
    this.tempActionName = '';
  }

  RemoveAction(a: Action) {
    this.controller.RemoveAction(this.possibility as Possibility, a);
  }


}
