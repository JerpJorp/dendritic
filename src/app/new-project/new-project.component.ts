import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { BaseQuickEditComponent } from '../base-quick-edit/base-quick-edit.component';
import { Action } from '../classes/action';
import { ActionCondition } from '../classes/action-condition';
import { Concretion } from '../classes/concretion';
import { Possibility } from '../classes/possibility';
import { Project } from '../classes/project';
import { Situation } from '../classes/situation';
import { DendriticControllerService } from '../services/dendritic-controller.service';
import { IndexedDbService } from '../services/indexed-db.service';

import * as faker from 'faker'
import { BaseUnit } from '../classes/base-unit';
import { Metadata } from '../classes/metadata';
import { Meta } from '@angular/platform-browser';
import { Faker } from '../classes/faker';

@Component({
  selector: 'app-new-project',
  templateUrl: './new-project.component.html',
  styleUrls: ['./new-project.component.scss']
})
export class NewProjectComponent extends BaseQuickEditComponent implements OnInit {

  concretions: Concretion[] = [];
  newName = 'My New Project';
  selectedConcretion: Concretion | undefined;

  generateFakeStructure = false;

  constructor(controller: DendriticControllerService, private indexStore: IndexedDbService, private router: Router) {  super(controller); }

  ngOnInit(): void {
    this.controller.concretions$.subscribe(x => {
      this.concretions = x;
    })
  }

  CreateProject() {
    const newProject = new Project({name: this.newName, concretion: this.concretion?.name});
    if (this.generateFakeStructure) {
      const faker: Faker = new Faker();
      faker.FakeUpProject(newProject);
    }

    this.indexStore.Save(newProject);
    this.router.navigate(['/view', newProject.id]);


  }

  

  
}
