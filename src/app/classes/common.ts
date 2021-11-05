
import * as uuid from 'uuid';

export class Common {
    static NewID() : string {
        return 'ID' + uuid.v4();
    }
}

export type MetadataType = 'link' | 'comment' | 'code' | 'table';


