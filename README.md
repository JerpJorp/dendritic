# Dendritic

Dendritic is an application to map out things like code, complex ideas, notes on things you are learning about, cheat sheets, etc.  
* At the core are a set of abstract classes and relationships.  
* These can be 'themed' into different concepts so that the names of the components conceptually match the kind of project


## Abstractions
### Situation
A situation is just a starting point.  Your project can have a set of initial situations and they can be the endpoint of an action

### Possibility
A possibility is something that can happen in a situation.  The possibility has an action that can occur if the possibility materializes

### Action
An action is something that occurs.  Possibilities that are realized start with an action and actions can then lead to other actions.  A set of actions and their relationships constitute what would normally be seen as a flow diagram with sequences, branches, conditions, etc.

Actions will lead to other actions (action flows) OR to a situation (end state).  

### BaseUnit
Abstract class that the other three classes inherit from with all the common properties all should have. (Name, list of annotations, identifier)

### Annotation
An annotation is a description and chunk of text with a type identifier. The application has to know about the possible type identifiers and has a built in 
rendering pattern for each.  Types known by the app are link, comment, and code

## Concretions
There are a number of built in concrete transformation of the abstract  Situation/Possibility/Action classes.  Common/default types are comments and links, but 
additional predefined types can be added to each concretion if it makes sense.

### Code:
* Situation => application state
* Possibility => trigger/event
* action => chunks of code

### Knowledge Notes:
* Situation => Area
* Possibility => Concepts 
* action => narrative around how concept works 

### How concretions work
 Depending on the concretion configuration, 
 *  abstract classes will have display names that match the concept (see map examples above)
 *  metadata types are defined as to those that are allowed and how they are displayed. For examplee, 'Code' Concretions can have metatdata types of 'snippet', which are displayed as code blocks.  
 
 
 
 
 

# Technical notes
## Development server
Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding
Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.


## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.
