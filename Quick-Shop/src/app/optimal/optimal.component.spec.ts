import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OptimalComponent } from './optimal.component';

describe('OptimalComponent', () => {
  let component: OptimalComponent;
  let fixture: ComponentFixture<OptimalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OptimalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OptimalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
