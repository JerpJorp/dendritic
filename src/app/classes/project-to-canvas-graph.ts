import { Project } from "./project";
import { Action } from "./action";
import { Possibility } from "./possibility";
import { BuiltNode, GraphBuilder, Link, Node } from "ngx-canvas-graph";
import { BuType, SelectedUnit } from "./common";
import { BaseUnit } from "./base-unit";

export class ProjectToCanvasGraph {

    static readonly RootID = 'rootID';

    static readonly ColorLkp: {[index: string]: string;} = {
        'situation': "#5dbecd",
        'possibility': "#4dd0af",        
        'action': "#ee8277",
        'condition': "#dff2ff",
    };

    static Build(project: Project): GraphBuilder {

        const builder: GraphBuilder = new GraphBuilder();
        const root = builder.AddNode(new Node('Flows', 'white'));
        project.situations.filter(x => x.initial).forEach(situation => {
            const s = root.AddLinkTo(new Link(''), this.newNode(situation, 'situation'));
            situation.possibilityIds.map(pid => project.possibilities.find(x => x.id === pid))
                .filter(x => x !== undefined)
                .map(x => x as Possibility)
                .forEach(possibility => {
                    const p = s.endNode.AddLinkTo(new Link(''), this.newNode(possibility, 'possibility'));
                    possibility.actions.forEach(action => {
                        const s = p.endNode.AddLinkTo(new Link(''), this.newNode(action, 'action')); 
                        this.addActionConditions(builder, action, s.endNode);
                    });
                });
        });

        return builder;
    }

    private static addActionConditions(builder: GraphBuilder, action: Action, actionBuiltNode: BuiltNode) {
        action.conditions
            .filter(c => c.action !== undefined)
            .forEach(condition => {
                const targetAction = condition.action as Action; 
                const tabn = actionBuiltNode.AddLinkTo(new Link(''), this.newNode(targetAction, 'action')); 
                this.addActionConditions(builder, targetAction, tabn.endNode);
        });
    }   

    private static newNode(bu: BaseUnit, type: BuType) {
        return new Node(bu.name, ProjectToCanvasGraph.ColorLkp[type], undefined,  {selectedUnit: new SelectedUnit(bu, type)} )
    }
}
