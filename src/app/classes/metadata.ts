import { Common, MetadataType } from "./common";

export class Metadata {
    
    id: string;
    description = '';
    content = '';

    constructor(public type: MetadataType) {
        this.id = Common.NewID();
    }
}
