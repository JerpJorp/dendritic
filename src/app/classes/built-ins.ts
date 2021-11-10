import { Action } from "./action";
import { ActionCondition } from "./action-condition";
import { Concretion } from "./concretion";
import { Possibility } from "./possibility";
import { Project } from "./project";
import { Faker} from './faker'

export class BuiltIns {

    private static _defProject: Project | undefined;

    static get DefaultProjects(): Project[] {

        if (this._defProject === undefined) {
            this._defProject = new Project({name: 'Example Code Project', id: 'DefaultEDF', concretion: 'code'});
            const faker: Faker = new Faker();
            faker.FakeUpProject(this._defProject);
        }
        return [ this._defProject ];
    }

    static get DefaultConcretions(): Concretion[] {
        return [
            {
                name: 'code',
                situationName: 'state',
                pluralSituationName: 'states',
                possibilityName: 'trigger',
                pluralPossibilityName: 'triggers',
                actionName: 'step',
                pluralActionName: 'steps',
                allowedMetadataTypes: ['comment', 'code', 'link']   
            },
            {
                name: 'Knowledge Notes',
                situationName: 'Category',
                pluralSituationName: 'Categories',
                possibilityName: 'Area',
                pluralPossibilityName: 'Areas',
                actionName: 'item',
                pluralActionName: 'item',
                allowedMetadataTypes: ['comment', 'link']   
            }
        ];
    }
}
