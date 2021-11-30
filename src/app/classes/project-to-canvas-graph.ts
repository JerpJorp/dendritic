import { Project } from "./project";
import { Action } from "./action";
import { Possibility } from "./possibility";
import { BuiltNode, GraphBuilder, Link, Node } from "@dendrityc/ngx-canvas-graph";
import { BuType, SelectedUnit } from "./common";
import { BaseUnit } from "./base-unit";

export class ProjectToCanvasGraph {

    static readonly RootID = 'rootID';

    static readonly ColorLkp: {[index: string]: {backColor: string, textColor: string};} = {
        'situation':    {backColor: '#0c515c', textColor: '#5dbecd'},
        'possibility':  {backColor: '#005e46', textColor: '#4dd0af'},       
        'action':       {backColor: '#74261e', textColor: '#ee8277'},
        'condition':    {backColor: '#74261e', textColor: '#ee8277'},
    };

    static seenActionNodes: {id: string, node: Node}[];

    static Build(project: Project): GraphBuilder {
        this.seenActionNodes = [];
        const builder: GraphBuilder = new GraphBuilder();
        const rootNode = new Node('Flows', '#313131', '#919191', {path: 'Flows'}, 'idROOT' );
        
        const root = builder.AddNode(new Node('Flows', '#313131', '#919191', {path: 'Flows'}, 'idROOT' ));
        project.situations.filter(x => x.initial).forEach(situation => {
            const s = root.AddLinkTo(this.LinkFactory('--'), this.newNode(situation, 'situation', root.node));
            situation.possibilityIds.map(pid => project.possibilities.find(x => x.id === pid))
                .filter(x => x !== undefined)
                .map(x => x as Possibility)
                .forEach(possibility => {
                    const p = s.endNode.AddLinkTo(this.LinkFactory('--'), this.newNode(possibility, 'possibility', s.endNode.node));
                    possibility.actions.forEach(action => {
                        const s = p.endNode.AddLinkTo(this.LinkFactory('--'), this.newNode(action, 'action', p.endNode.node)); 
                        this.seenActionNodes.push({id: action.id, node: s.endNode.node})
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

                // this action might already exist 
                const existing = this.seenActionNodes.find(x => x.id === targetAction.id);
                
                if (existing) {
                    const tabn = actionBuiltNode.AddLinkTo(this.LinkFactory(condition.name, '#555555'), existing.node);
                    
                } else {
                    const tabn = actionBuiltNode.AddLinkTo(this.LinkFactory(condition.name), this.newNode(targetAction, 'action', actionBuiltNode.node));
                    this.seenActionNodes.push({id: targetAction.id, node: tabn.endNode.node})
                    this.addActionConditions(builder, targetAction, tabn.endNode);
                }
        });
    }   

    private static LinkFactory(displayName: string, specialColor?: string) {
        return new Link(displayName, specialColor || "#DDDDDD", "#404040", "#B5B5B5")
    }

    private static newNode(bu: BaseUnit, type: BuType, parentNode: Node) {

        const lkp = ProjectToCanvasGraph.ColorLkp[type];
        
        const parentBu = parentNode.properties?.selectedUnit?.baseUnit;

        if (parentBu !== undefined) {
            bu.pathToRoot = [... (parentBu as BaseUnit).pathToRoot, bu];
        } else {
            bu.pathToRoot = [bu] ;
        }
        
        return new Node(bu.name, lkp.backColor, lkp.textColor, {selectedUnit: new SelectedUnit(bu, type)}, bu.id );
    }
}
