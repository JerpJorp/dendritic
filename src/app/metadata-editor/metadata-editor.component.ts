import { Component, OnInit } from '@angular/core';
import { BaseQuickEditComponent } from '../base-quick-edit/base-quick-edit.component';
import { DendriticControllerService } from '../services/dendritic-controller.service';

@Component({
  selector: 'app-metadata-editor',
  templateUrl: './metadata-editor.component.html',
  styleUrls: ['./metadata-editor.component.scss']
})
export class MetadataEditorComponent extends BaseQuickEditComponent implements OnInit {

  constructor(controller: DendriticControllerService) { 
    super(controller);
  }

  ngOnInit(): void {
  }

}
