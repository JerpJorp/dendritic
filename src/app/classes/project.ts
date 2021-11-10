import { Action } from "./action";
import { Common } from "./common";
import { Possibility } from "./possibility";
import { Situation } from "./situation";

export class Project {
    id = '';
    name = '';
    concretion = '';
    situations: Situation[] = [];
    possibilities: Possibility[] = [];
    origin: 'default' | 'custom';

    dirty = false;

    constructor(dto?: any) {
        this.id = dto && dto.id ? dto.id: Common.NewID();
        this.origin = dto && dto.origin ? dto.origin: 'custom';
        this.dirty = dto && dto.dirty ? dto.dirty: false;
        this.name = dto && dto.name ? dto.name : 'NEW PROJECT';
        this.concretion = dto && dto.concretion ? dto.concretion : 'code';
        this.situations = dto && dto.situations ? (dto.situations as Partial<Situation>[]).map(s => new Situation(s)) : [];
        this.possibilities = dto && dto.possibilities ?  (dto.possibilities as Partial<Possibility>[]).map(p => new Possibility(p)) : [];
    }

    CleanProject() {
        this.dirty = false;
        this.situations.forEach(s => s.Clean())
        this.possibilities.forEach(p => p.Clean());
    }
}

export class ProjectTrack {
    
    constructor(
        public name: string, 
        public id: string, 
        public source: 'default' | 'unsaved' | 'indexedDb' | 'fireStore' ) {

    }

}