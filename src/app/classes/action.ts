import { ActionCondition } from "./action-condition";
import { BaseUnit } from "./base-unit";

export class Action extends BaseUnit {

    conditions: ActionCondition[];

    constructor(dto?: Partial<Action>) {
        super(dto);
        this.conditions = dto && dto.conditions ? dto.conditions.map(c => new ActionCondition(c)) : [];
    }
    
    DirtyCount(): number {
        let count  = this.dirty ? 1 : 0;
        this.conditions.forEach(c => count += c.DirtyCount());
        return count;
    }
}
