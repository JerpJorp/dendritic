import { Project } from "./project";

import * as dagre from "dagre";
import { ActionCondition } from "./action-condition";
import { Action } from "./action";
import { Situation } from "./situation";
import { Possibility } from "./possibility";
import { BuType } from "./common";
import { BaseUnit } from "./base-unit";

export class ProjectToDagre {

    static readonly RootID = 'rootID';

    static readonly ColorLkp: {[index: string]: string;} = {
        'situation': "#5dbecd",
        'possibility': "#4dd0af",        
        'action': "#ee8277",
        'condition': "#dff2ff",
    };

    nodes: dagre.Node<IExtendedNode>[] = [];
    edges: dagre.Edge[] = [];

    graph: dagre.graphlib.Graph;
    
    constructor(private project: Project) {

        this.graph = new dagre.graphlib.Graph();
        this.graph.setGraph({width: 1800, height: 1000, nodesep: 20, ranksep: 15, rankdir: 'LR'});

        // Create root node
        this.graph.setNode(ProjectToDagre.RootID,  { 
            
                displayName: 'flows',
                color: 'white',                 
                width: 90, height: 30});

        // Process initial situations, which kicks off everything else 
        project.situations.filter(x => x.initial).forEach(x => this.processSituation(x, ProjectToDagre.RootID));
        dagre.layout(this.graph);
        this.nodes = this.graph.nodes().map(n => this.graph.node(n) as dagre.Node<IExtendedNode>);
        this.edges = this.graph.edges();
    }

    processSituation(bu: Situation, parentId: string) {
        this.addNodeEdge(bu.id, parentId, bu.name, 'situation', bu);

        bu.possibilityIds.map(pid => this.project.possibilities.find(x => x.id === pid))
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

    processAction(bu: Action, parentId: string): {node: dagre.Node, edge: dagre.GraphEdge} {
        const returnValue = this.addNodeEdge(bu.id, parentId, bu.name, 'action', bu);
        bu.conditions.forEach(c => this.processCondition(c, bu.id) );
        return returnValue;
    }

    processCondition(bu: ActionCondition, parentId: string) {

        if (bu.action) {
            this.processAction(bu.action, parentId);
            // this.processAction(bu.action, parentId).edge.label = bu.name;
        }

    }
    private addNodeEdge(targetId: string, parentId: string, name: string, type: BuType, bu: BaseUnit): {node: dagre.Node, edge: dagre.GraphEdge} {
        const color = ProjectToDagre.ColorLkp[type];
        this.graph.setNode(targetId,  
            { 
                type: type,
                bu: bu,
                displayName: name,
                color: color,                 
                width:  5 + name.length*10, height: 40 });
        this.graph.setEdge(parentId, targetId, {});
        return {node: this.graph.node(targetId), edge: this.graph.edge(targetId, parentId)};
    }
    
}

export interface IExtendedNode {

    type: BuType;
    bu: BaseUnit;
    displayName: string;
    color: string;
}
