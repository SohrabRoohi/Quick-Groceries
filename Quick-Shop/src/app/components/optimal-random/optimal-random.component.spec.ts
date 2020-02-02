import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OptimalRandomComponent } from './optimal-random.component';

describe('OptimalRandomComponent', () => {
  let component: OptimalRandomComponent;
  let fixture: ComponentFixture<OptimalRandomComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OptimalRandomComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OptimalRandomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
