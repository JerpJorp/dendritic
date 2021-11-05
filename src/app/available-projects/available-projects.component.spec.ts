import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppRoutingModule } from '../app-routing.module';
import { AppModule } from '../app.module';
import { DendriticControllerService } from '../services/dendritic-controller.service';

import { AvailableProjectsComponent } from './available-projects.component';

describe('AvailableProjectsComponent', () => {
  let component: AvailableProjectsComponent;
  let fixture: ComponentFixture<AvailableProjectsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        AppModule,
        RouterTestingModule.withRoutes([])
      ],
      providers: [DendriticControllerService],
      declarations: [ AvailableProjectsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AvailableProjectsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
