import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PossibilityQuickEditComponent } from './possibility-quick-edit.component';

describe('PossibilityQuickEditComponent', () => {
  let component: PossibilityQuickEditComponent;
  let fixture: ComponentFixture<PossibilityQuickEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PossibilityQuickEditComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PossibilityQuickEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
