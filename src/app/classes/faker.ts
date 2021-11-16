import * as faker from "faker";
import { Action } from "./action";
import { ActionCondition } from "./action-condition";
import { BaseUnit } from "./base-unit";
import { Metadata } from "./metadata";
import { Possibility } from "./possibility";
import { Project } from "./project";
import { Situation } from "./situation";

export class Faker {

    FakeUpProject(project: Project) {
        project.situations = Array(this.getRandomInt(2, 7)).fill(0).map(idx => {
            return new Situation({ name: faker.name.findName(), initial: true });
        });
        project.situations.forEach(s => this.FakeUpSituation(project, s));
    }

    FakeUpSituation(project: Project, situation: Situation) {

        this.FakeUpMetadata(situation);
        const possibilities = Array(this.getRandomInt(1, 3)).fill(0).map(idx => {
            const newP = new Possibility({ name: faker.name.findName() });
            this.FakeUpPossibility(newP);
            return newP;
        });

        project.possibilities.push(...possibilities);
        situation.possibilityIds = possibilities.map(p => p.id);

    }

    FakeUpMetadata(baseUnit: BaseUnit) {

        const list: Metadata[] = [];

        const commentMD = new Metadata('comment');
        commentMD.content = faker.lorem.sentences(2);
        list.push(commentMD);

        Array(3).fill(0).forEach((x, idx) => {

            const fake = this.getFakeLink();
            const linkMD = new Metadata('link');
            linkMD.description = fake.description;
            linkMD.content = fake.content;
            list.push(linkMD);

        });

        const codeMD = new Metadata('code');
        const fakeCode = this.getFakeCode();
        codeMD.description = fakeCode.description;
        codeMD.content = fakeCode.content;
        list.push(codeMD);

        baseUnit.metadata = list;
    }

    FakeUpPossibility(possibility: Possibility) {

        this.FakeUpMetadata(possibility);
        possibility.actions = Array(this.getRandomInt(1, 2)).fill(0).map(idx => {
            const newAction = new Action({ name: faker.lorem.words(3) });
            this.FakeUpAction(newAction, 0);
            return newAction;
        });
    }

    FakeUpAction(a: Action, depth: number) {

        this.FakeUpMetadata(a);

        if (depth < 7) {
            a.conditions = Array(this.getRandomInt(1, 3)).fill(0).map(idx => {
                const newCondition = new ActionCondition({ name: `if ${idx}` });
                newCondition.action = new Action({ name: faker.lorem.words(3) });
                this.FakeUpAction(newCondition.action, ++depth);
                return newCondition;
            });

        }

    }
    
    getFakeLink() {
        const index = this.getRandomInt(0, FakeData.links.length - 1);
        return FakeData.links[index];
    }

    getFakeCode() {
        const index = this.getRandomInt(0, FakeData.code.length - 1);
        return FakeData.code[index];
    }

    getRandomInt(min: number, max: number): number {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
    }
}

class FakeData {

    
    static links: {description: string, content: string}[] = [
        {description: 'Dagre is a JavaScript library that makes it easy to lay out directed graphs on the client-side', content: 'https://github.com/dagrejs/dagre/wiki'},
        { description: 'An API of 5 methods which provide granular control over the output of newly generated sentences', content: 'https://www.npmjs.com/package/sentence-generator' },
        { description: 'Bootstrap 5 select documentation', content: 'https://getbootstrap.com/docs/5.0/forms/select/' },
        { description: 'Integrate D3 with Angular 9', content: 'https://www.geekstrick.com/integrate-d3-with-angular-9/' },
        { description: 'generate massive amounts of fake data in the browser and node.js', content: 'https://www.npmjs.com/package/faker' },
        { description: 'Data visualization in Angular using D3.js', content: 'https://blog.logrocket.com/data-visualization-angular-d3/' },
        { description: 'How to draw points and connect them with lines HTML on click', content: 'https://stackoverflow.com/questions/60487974/how-to-draw-points-and-connect-them-with-lines-html-on-click' },
        { description: 'HTML canvas with scrollbar', content: 'HTML canvas with scrollbar' },
        { description: 'TypeScript configuration', content: 'https://angular.io/guide/typescript-configuration' }
    ];

    static code: {description: string, content: string}[] = [
        {description: 'getRandomInt', content: `getRandomInt(min: number, max: number): number {
            min = Math.ceil(min);
            max = Math.floor(max);
            return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
        }`},
        {description: 'FakeUpPossibility', content: `FakeUpPossibility(possibility: Possibility) {

            this.FakeUpMetadata(possibility);
            possibility.actions = Array(this.getRandomInt(2, 4)).fill(0).map(idx => {
                const newAction = new Action({ name: faker.lorem.words(3) });
                this.FakeUpAction(newAction, 0);
                return newAction;
            });
        }`},
        {description: 'Canvas view component HTML', content: `<div class="container-fluid">
        <div class="row">
            <div class="col-md-7">
                <div class="canvas-container">
                    <canvas #myCanvas 
                        (mousedown)="canvasMouseDown($event)" 
                        (mouseup)="drag=false" 
                        (mousemove)="canvasMouseMove($event)"
                        (mouseleave)="drag=false"
                        (click)="canvasMouseClick($event)"
                        width="2500" height="3500"></canvas>
                </div>
            </div>
    
           
            <div *ngIf="selectedUnit && !readOnly" class="col-md-2">
    
                <div [ngSwitch]="selectedUnit.type">
                    <app-situation-quick-edit *ngSwitchCase="'situation'"></app-situation-quick-edit>
                    <app-possibility-quick-edit *ngSwitchCase="'possibility'"></app-possibility-quick-edit>
                    <app-action-quick-edit *ngSwitchCase="'action'"></app-action-quick-edit>                                
                </div>
            </div>
    
            <app-project-quick-edit *ngIf="!selectedUnit" class="col-md-3"></app-project-quick-edit>
    
            
    
            <!-- class="col-md-3"  -->
            <div *ngIf="selectedUnit" [ngClass]="{'col-md-3': readOnly === false, 'col-md-5': readOnly === true}">
              <app-metadata-editor></app-metadata-editor>
            </div>
        </div>
    </div>
    
    
    `},
        {description: 'README', content: `## Abstractions
        ### Situation
        A situation is just a starting point.  Your project can have a set of initial situations and they can be the endpoint of an action
        
        ### Possibility
        A possibility is something that can happen in a situation.  The possibility has an action that can occur if the possibility materializes
        
        ### Action
        An action is something that occurs.  Possibilities that are realized start with an action and actions can then lead to other actions.  A set of actions and their relationships constitute what would normally be seen as a flow diagram with sequences, branches, conditions, etc.
        
        Actions will lead to other actions (action flows) OR to a situation (end state).  
        
        ### BaseUnit
        Abstract class that the other three classes inherit from with all the common properties all should have. (Name, list of annotations, identifier)
        
        ### Annotation
        An annotation is a description and chunk of text with a type identifier. The application has to know about the possible type identifiers and has a built in 
        rendering pattern for each.  Types known by the app are link, comment, and code
        
        ## Concretions
        There are a number of built in concrete transformation of the abstract  Situation/Possibility/Action classes.  Common/default types are comments and links, but 
        additional predefined types can be added to each concretion if it makes sense.
        `},
        {description: 'IExtendedNode', content: `export interface IExtendedNode {

            type: BuType;
            bu: BaseUnit;
            displayName: string;
            color: string;
        }`}
    ];
}