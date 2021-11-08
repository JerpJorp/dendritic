import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppModule } from '../app.module';

import { ProjectCanvasViewComponent } from './project-canvas-view.component';

describe('ProjectCanvasViewComponent', () => {
  let component: ProjectCanvasViewComponent;
  let fixture: ComponentFixture<ProjectCanvasViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        AppModule,
        RouterTestingModule.withRoutes([])
      ],
      declarations: [ ProjectCanvasViewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectCanvasViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
