import { Action } from "./action";
import { ActionCondition } from "./action-condition";
import { Concretion } from "./concretion";
import { Possibility } from "./possibility";
import { Project } from "./project";
import { Situation } from "./situation";

export class BuiltIns {

    static codeProject: Project = new Project({
                name: 'Example Code Flow',
                id: 'DefaultEDF',
                concretion: 'code',
                situations: [
                    {name: 'Click one', initial: true,
                        metadata: [
                            {type: 'comment', description: 'This is a comment', content: 'Like I said this is a comment'},
                            {type: 'link', description: 'Narcissistic reference', content: 'https://dendritic-kb.web.app/'}
                        ],
                    possibilityIds: ['PA']}
                ],
                possibilities: [ 
                    new Possibility({name: 'Possibility A', id: 'PA', actions: [
                        new Action({name: 'A1', conditions: [
                            new ActionCondition({name: 'if A', action: new Action({name: 'A1.1' })}),
                            new ActionCondition({name: 'if B', action: new Action({name: 'A1.2' })}),
                            new ActionCondition({name: 'if C', action: new Action({name: 'A1.3' })}),
                            new ActionCondition({name: 'if D', action: new Action({name: 'A1.4' })})
                        ]})
                    ]})
                ]
            });
    static get DefaultProjects(): Project[] {
        return [
            this.codeProject
        ];
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
