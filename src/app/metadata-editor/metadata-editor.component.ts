import { Component, OnInit } from '@angular/core';
import { BaseQuickEditComponent } from '../base-quick-edit/base-quick-edit.component';
import { BaseUnit } from '../classes/base-unit';
import { BuType, MetadataType, SelectedUnit } from '../classes/common';
import { Metadata } from '../classes/metadata';
import { DendriticControllerService } from '../services/dendritic-controller.service';

@Component({
  selector: 'app-metadata-editor',
  templateUrl: './metadata-editor.component.html',
  styleUrls: ['./metadata-editor.component.scss']
})
export class MetadataEditorComponent extends BaseQuickEditComponent implements OnInit {

  groupedMetadata: { [index: string]: Metadata[]} = {};

  constructor(controller: DendriticControllerService) {
    super(controller);
  }

  AddMetadata(type: MetadataType) {
    if (this.currentUnit) {
      const unit = this.currentUnit.baseUnit as BaseUnit;
      if (unit.metadata === undefined)
      {
        unit.metadata = [];
      }
      this.currentUnit.baseUnit.metadata?.push(new Metadata(type));
      this.buildGroup();
    }
  }

  onCurrentUnitDelta() {
    this.buildGroup();
  }
  ngOnInit(): void {
    this.controller.currentUnit$.subscribe(x => {
    });
  }

  valueChanged(newValue: string) {
    if (this.currentUnit) {
      this.controller.AddDirt(this.currentUnit.baseUnit);
    }
  }

  RemoveMetadata(id: string | undefined) {
    if (this.currentUnit !== undefined && id !== undefined) {
      const unit = this.currentUnit.baseUnit as BaseUnit;

      unit.metadata = unit.metadata?.filter(metaData => metaData.id !== id);
      unit.dirty = true;
      this.controller.DirtyCheck();
      this.buildGroup();
    }
  }

  buildGroup() {
    this.groupedMetadata = {};
    if (this.currentUnit && this.currentConcretion?.allowedMetadataTypes) {
      const unit = this.currentUnit.baseUnit as BaseUnit;

      this.currentConcretion?.allowedMetadataTypes.forEach(mt => this.groupedMetadata[mt] = []);
      if (unit.metadata) {
        unit.metadata.forEach(m => this.groupedMetadata[m.type].push(m));
      }
    }
  }

}
