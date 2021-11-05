import { Action } from "./action";
import { BaseUnit } from "./base-unit";

export class Possibility extends BaseUnit {
    actions: Action[];

    constructor(dto?: Partial<Possibility>) {
        super(dto);
        this.actions = dto && dto.actions ? dto.actions.map(a => new Action(a)) : [];
    }

    DirtyCount(): number {
        let count  = this.dirty ? 1 : 0;
        this.actions.forEach(a => count += a.DirtyCount());
        return count;
    }

}
