# NgListAndGroupSync

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 1.4.7.

Angular 2+ solution that manages groups by syncing in the backend with a SharePoint list. 

The association is by email (The list will have a column for emails and that way it will sync between the list and the SharePoint group).

A Master list is needed, which will hold the main cofiguration:
Master list name:  ListAndGroupSyncConfig
Columns that must have the master list (All single line of text):
"Title": Category or type that is being managed.
"SpGrpName": SharePoint group tied to the category / type.
"WorkerListName": List name that will have / mirror the same group of persons that the SharePoint group does. This list will have a person / entry per item. The value in this column is likely the same for every item entry in the ListAndGroupSyncConfig list.
"FilterColumn": the column in the list that will be used to filter against the title  or category used. If you use spaces in your columns, you need to use 'weird names', example: Referral_x0020_Type.
"EmailColumn": The column that will have the email of the person / worker.
"OwnerGroupLink" : Provides a link to another Sharepoint group. ( won't be managed / synced by the tool)
"OwnerGroupName" : Provides the name of another SharePoint group. ( won't be managed / synced by the tool)

This project depends on access to SharePoint through Web Services [NgSharePointWebServices](https://github.com/isaacchacon/NgSharePointWebServices)


Tested in SharePoint 2010.
## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `-prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).
