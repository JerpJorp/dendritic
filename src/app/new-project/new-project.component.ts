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
      this.FakeUpProject(newProject);
    }

    this.indexStore.Save(newProject);
    this.router.navigate(['/view', newProject.id]);


  }

  FakeUpProject(project: Project) {

    
    project.situations = Array(this.getRandomInt(2,7)).fill(0).map(idx => {
      return new Situation({ name: faker.name.findName(), initial: true});
    });

    project.situations.forEach(s => this.FakeUpSituation(project, s));
  }

  FakeUpSituation(project: Project, situation: Situation) {
    
    this.FakeUpMetadata(situation);
    const possibilities = Array(this.getRandomInt(1,3)).fill(0).map(idx => {
      const newP = new Possibility({name: faker.name.findName()});
      this.FakeUpPossibility(newP);
      return newP;
    });

    project.possibilities.push(... possibilities);
    situation.possibilityIds = possibilities.map(p => p.id);

  }

  FakeUpMetadata(baseUnit: BaseUnit) {

    const list: Metadata[] = [];

    const commentMD = new Metadata('comment');
    commentMD.content = faker.lorem.sentences(2);
    list.push(commentMD);
    
    Array(3).fill(0).forEach((x, idx) => {
      const linkMD = new Metadata('link');
      linkMD.description = 'Generate class command in angular';
      linkMD.content = 'https://angular.io/cli/generate#class-command';
      list.push(linkMD);
  
    });

    const codeMD = new Metadata('code');
    codeMD.description = "example snippet";
    codeMD.content = `export interface RectProps {
      type: string | Types;
      width: number;
      height: number;
      x: number;
      y: number;
      text?: TextProps;
      paddingLeft?: number;
      paddingRight?: number;
      borderWidth?: number;
      backgroundColor?: string;
      borderColor?: string;
      borderRadius?: number | string;
      opacity?: number;
  }`;
  list.push(codeMD);

  baseUnit.metadata = list;
}

  FakeUpPossibility(possibility: Possibility) {

    this.FakeUpMetadata(possibility);
    possibility.actions = Array(this.getRandomInt(2,4)).fill(0).map(idx => {
      const newAction = new Action({name: faker.name.findName()});
      this.FakeUpAction(newAction, 0);
      return newAction;
    });
  }

  FakeUpAction(a: Action, depth: number) {
    
    this.FakeUpMetadata(a);

    if (depth < 7) {
      a.conditions = Array(this.getRandomInt(1,3)).fill(0).map(idx => {
        const newCondition = new ActionCondition({name: `if ${idx}`});
        newCondition.action = new Action({name: faker.name.findName()});
        this.FakeUpAction(newCondition.action, ++depth);
        return newCondition;
      });

    }

  }

  getRandomInt(min: number, max: number) : number {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
  }

  
}
