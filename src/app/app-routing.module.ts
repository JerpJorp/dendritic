import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AvailableProjectsComponent } from './available-projects/available-projects.component';
import { NewProjectComponent } from './new-project/new-project.component';
import { ProjectViewComponent } from './project-view/project-view.component';

const routes: Routes = [
  { path: 'available', component: AvailableProjectsComponent },
  { path: 'view/:projectId', component: ProjectViewComponent },
  { path: 'new', component: NewProjectComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
