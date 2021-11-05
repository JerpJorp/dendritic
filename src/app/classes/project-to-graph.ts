import { Edge, Node } from '@swimlane/ngx-graph';
import { Project } from './project';

export class ProjectToGraph {

    static readonly SituationColor = "#cfe2ff";
    static readonly PossibilityColor = "#bfd2df";
    static readonly ActionGraphColor =  "#afc2bf";

    edges: Edge[] = [];
    nodes: Node[] = [];

    constructor(project: Project) {
    // Create root node
    this.nodes.push({id: 'root', label: 'Flows', meta: {color: "#BBBBBB"}});
    }

}
