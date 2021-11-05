import { Action } from "./action";
import { BaseUnit } from "./base-unit";

export class ActionCondition extends BaseUnit {

    action?: Action;

    constructor(dto?: Partial<ActionCondition>) {
        super(dto);
        this.action = dto && dto.action ? new Action(dto.action) : undefined;
    }
}
