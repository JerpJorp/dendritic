import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getStorage, provideStorage } from '@angular/fire/storage';
import { getAnalytics, provideAnalytics } from '@angular/fire/analytics';

import { environment } from '../environments/environment';
import { AvailableProjectsComponent } from './available-projects/available-projects.component';
import { NewProjectComponent } from './new-project/new-project.component';
import { NgxGraphModule } from '@swimlane/ngx-graph';
import { ProjectQuickEditComponent } from './project-quick-edit/project-quick-edit.component';
import { SituationQuickEditComponent } from './situation-quick-edit/situation-quick-edit.component';
import { PossibilityQuickEditComponent } from './possibility-quick-edit/possibility-quick-edit.component';
import { ActionQuickEditComponent } from './action-quick-edit/action-quick-edit.component';
import { MetadataEditorComponent } from './metadata-editor/metadata-editor.component';
import { BaseQuickEditComponent } from './base-quick-edit/base-quick-edit.component';
import { CanvasTestComponent } from './canvas-test/canvas-test.component';
import { ProjectCanvasViewComponent } from './project-canvas-view/project-canvas-view.component';
import { RepositoryComponent } from './repository/repository.component';

@NgModule({
  declarations: [
    AppComponent,
    AvailableProjectsComponent,
    NewProjectComponent,
    ProjectQuickEditComponent,
    SituationQuickEditComponent,
    PossibilityQuickEditComponent,
    ActionQuickEditComponent,
    MetadataEditorComponent,
    BaseQuickEditComponent,
    CanvasTestComponent,
    ProjectCanvasViewComponent,
    RepositoryComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    NgxGraphModule,
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideFirestore(() => getFirestore()),
    provideAuth(() => getAuth()),
    provideStorage(() => getStorage()),
    provideAnalytics(() => getAnalytics())    
  ],
  providers: [ ],
  bootstrap: [AppComponent]
})
export class AppModule { }
