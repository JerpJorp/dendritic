import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectQuickEditComponent } from './project-quick-edit.component';

describe('ProjectQuickEditComponent', () => {
  let component: ProjectQuickEditComponent;
  let fixture: ComponentFixture<ProjectQuickEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProjectQuickEditComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectQuickEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
