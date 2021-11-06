import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BaseQuickEditComponent } from './base-quick-edit.component';

describe('BaseQuickEditComponent', () => {
  let component: BaseQuickEditComponent;
  let fixture: ComponentFixture<BaseQuickEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BaseQuickEditComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BaseQuickEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
