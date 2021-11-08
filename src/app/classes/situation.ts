import { BaseUnit } from "./base-unit";
import { Project } from "./project";

export class Situation extends BaseUnit {
    
    possibilityIds: string[];
    initial: boolean;

    constructor(dto?: Partial<Situation>) {
        super(dto);
        this.possibilityIds = dto && dto.possibilityIds ? dto.possibilityIds : [];
        this.initial = dto && dto.initial ? dto.initial : false;
    }

    get Initial(): boolean {
        return this.initial === undefined ? false : this.initial;
    }
}
