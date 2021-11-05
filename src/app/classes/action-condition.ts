import { Action } from "./action";
import { BaseUnit } from "./base-unit";

export class ActionCondition extends BaseUnit {

    action?: Action;

    constructor(dto?: Partial<ActionCondition>) {
        super(dto);
        this.action = dto && dto.action ? new Action(dto.action) : undefined;
    }

    DirtyCount(): number {
        let count  = this.dirty ? 1 : 0;
        if (this.action) {
            count += this.action.DirtyCount();
        }
        return count;
    }

}
