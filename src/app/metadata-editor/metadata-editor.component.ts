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

  selectedUnit: SelectedUnit | undefined;

  groupedMetadata: { [index: string]: Metadata[]} = {};

  constructor(controller: DendriticControllerService) { 
    super(controller);
  }

  AddMetadata(type: MetadataType) {
    if (this.selectedUnit) {
      const unit = this.selectedUnit.baseUnit as BaseUnit;
      if (unit.metadata === undefined) 
      {
        unit.metadata = [];
      }
      this.selectedUnit.baseUnit.metadata?.push(new Metadata(type));
      this.buildGroup();
    }
  }
  ngOnInit(): void {
    this.controller.currentUnit$.subscribe(x => {
      this.selectedUnit = x;
      this.buildGroup();
    });
  }

  valueChanged(newValue: string) {
    if (this.selectedUnit) {
      this.controller.AddDirt(this.selectedUnit.baseUnit);
    }
  }

  RemoveMetadata(id: string | undefined) {
    if (this.selectedUnit !== undefined && id !== undefined) {
      const unit = this.selectedUnit.baseUnit as BaseUnit;
      
      unit.metadata = unit.metadata?.filter(metaData => metaData.id !== id);
      unit.dirty = true;      
      this.buildGroup();
    }
  }

  buildGroup() {
    this.groupedMetadata = {};
    if (this.selectedUnit && this.concretion?.allowedMetadataTypes) {
      const unit = this.selectedUnit.baseUnit as BaseUnit;
      
      this.concretion?.allowedMetadataTypes.forEach(mt => this.groupedMetadata[mt] = []);
      if (unit.metadata) {
        unit.metadata.forEach(m => this.groupedMetadata[m.type].push(m));
      }
    }
  }

}
