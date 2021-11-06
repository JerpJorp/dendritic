import { ColaForceDirectedLayout, Edge, Node } from '@swimlane/ngx-graph';
import { Action } from './action';
import { ActionCondition } from './action-condition';
import { BuType } from './common';
import { Possibility } from './possibility';
import { Project } from './project';
import { Situation } from './situation';

export class ProjectToGraph {

    static readonly SituationColor = "#cfe2ff";
    static readonly PossibilityColor = "#bfd2df";
    static readonly ActionGraphColor =  "#afafbf";

    static readonly ColorLkp: {[index: string]: string;} = {
        'situation': "#cfe2ff",
        'possibility': "#bfd2df",        
        'action': "#afc2bf",
        'condition': "#dff2ff",
    };

    static readonly RootID = 'rootID'
    edges: Edge[] = [];
    nodes: Node[] = [];

    constructor(private project: Project) {
        // Create root node
        this.nodes.push({id: ProjectToGraph.RootID, label: 'Flows', data: undefined, meta: {color: "#BBBBBB"}});
        project.situations.filter(x => x.initial).forEach(x => this.processSituation(x, ProjectToGraph.RootID));
    }

    processSituation(bu: Situation, parentId: string) {
        this.addNodeEdge(bu.id, parentId, bu.name, 'situation', bu);

        bu.PossibilityIds.map(pid => this.project.possibilities.find(x => x.id === pid))
        .filter(x => x !== undefined)
        .map(x => x as Possibility)
        .forEach(possibility => {
            this.processPossibility(possibility, bu.id);
        });
    }

    processPossibility(bu: Possibility, parentId: string) {
        this.addNodeEdge(bu.id, parentId, bu.name, 'possibility', bu);
        bu.actions.forEach(x => this.processAction(x, bu.id));
    }

    processAction(bu: Action, parentId: string): {node: Node, edge: Edge} {
        const returnValue = this.addNodeEdge(bu.id, parentId, bu.name, 'action', bu);
        bu.conditions.forEach(c => this.processCondition(c, bu.id) );
        return returnValue;
    }

    processCondition(bu: ActionCondition, parentId: string) {

        if (bu.action) {
            this.processAction(bu.action, parentId).edge.label = bu.name;
        }

    }

    private addNodeEdge(targetId: string, parentId: string, name: string, type: BuType, data: any): {node: Node, edge: Edge} {

        const color = ProjectToGraph.ColorLkp[type];
        const node = {id: targetId, label: name, data: data, meta: {color: color, type: type}};
        this.nodes.push(node);
        const edge = {id: `${parentId}${targetId}`, source: parentId, target: targetId};
        this.edges.push(edge);
        return {node: node, edge: edge};
    }

}
