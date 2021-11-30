import { Component, OnInit } from '@angular/core';
import { debounceTime, filter } from 'rxjs/operators';
import { BaseQuickEditComponent } from '../base-quick-edit/base-quick-edit.component';
import { Possibility } from '../classes/possibility';
import { Situation } from '../classes/situation';
import { DendriticControllerService } from '../services/dendritic-controller.service';

@Component({
  selector: 'app-situation-quick-edit',
  templateUrl: './situation-quick-edit.component.html',
  styleUrls: ['./situation-quick-edit.component.scss'],
})
export class SituationQuickEditComponent
  extends BaseQuickEditComponent
  implements OnInit
{
  situation: Situation | undefined;
  possibilities: Possibility[] = [];
  tempPossibilityName = '';
  constructor(controller: DendriticControllerService) {
    super(controller);
  }

  onCurrentUnitDelta() {
    if (this.currentUnit?.type === 'situation') {
      this.situation = this.currentUnit?.baseUnit as Situation;
      setTimeout(() => {
        this.possibilities = this.situation
          ? this.controller.PossibilitiesFor(this.situation)
          : [];
      }, 0);
    }
  }

  ngOnInit(): void {
    this.changeDebounce
      .pipe(debounceTime(300))
      .subscribe((x) => this.controller.AddDirt(this.situation as Situation));
  }

  Select(p: Possibility) {
    this.controller.Select(p, 'possibility');
  }

  nameValueChanged(newValue: string) {
    this.changeDebounce.next();
  }

  AddPossibility() {
    this.controller.AddPossibility(
      this.situation as Situation,
      this.tempPossibilityName
    );
    this.tempPossibilityName = '';
  }

  RemovePossibility(p: Possibility) {
    this.controller.RemovePossibility(this.situation as Situation, p);
  }
}
