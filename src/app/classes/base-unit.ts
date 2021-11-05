
import { Common } from './common';
import { Metadata } from './metadata';

// BaseUnit is an 
export abstract class BaseUnit {

    name: string;
    id: string;
    dirty: boolean;

    // Metadata: 
    //  type: MetadataType = 'comment';
    //  description = '';
    //  content = '';
    metadata: Metadata[] | undefined = [];

    constructor(dto?: Partial<BaseUnit>) {
         this.name = dto && dto.name ? dto.name : '';
         this.id = dto && dto.id ? dto.id : Common.NewID();
         this.metadata = dto && dto.metadata ? dto.metadata : []
         this.dirty = dto && dto.dirty ? dto.dirty : true;
    }
}
