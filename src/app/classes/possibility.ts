import { Action } from "./action";
import { BaseUnit } from "./base-unit";

export class Possibility extends BaseUnit {
    actions: Action[];

    constructor(dto?: Partial<Possibility>) {
        super(dto);
        this.actions = dto && dto.actions ? dto.actions.map(a => new Action(a)) : [];
    }

    get Actions(): Action[] {
        return this.actions  || [];
    }
}
