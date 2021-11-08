import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AvailableProjectsComponent } from './available-projects/available-projects.component';
import { CanvasTestComponent } from './canvas-test/canvas-test.component';
import { NewProjectComponent } from './new-project/new-project.component';
import { ProjectCanvasViewComponent } from './project-canvas-view/project-canvas-view.component';
import { ProjectViewComponent } from './project-view/project-view.component';

const routes: Routes = [
  { path: 'available', component: AvailableProjectsComponent },
  { path: 'view/:projectId', component: ProjectCanvasViewComponent },
  { path: 'new', component: NewProjectComponent },
  { path: 'canvas', component: CanvasTestComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
