import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SituationQuickEditComponent } from './situation-quick-edit.component';

describe('SituationQuickEditComponent', () => {
  let component: SituationQuickEditComponent;
  let fixture: ComponentFixture<SituationQuickEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SituationQuickEditComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SituationQuickEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
