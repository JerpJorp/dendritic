
import * as uuid from 'uuid';
import { BaseUnit } from './base-unit';

export class Common {
    static NewID() : string {
        return 'ID' + uuid.v4();
    }
}

export type MetadataType = 'link' | 'comment' | 'code' | 'table';
export type BuType = 'situation' | 'possibility' | 'action' | 'condition';


export class SelectedUnit {
    constructor(public baseUnit: BaseUnit, public type: BuType) {}
}