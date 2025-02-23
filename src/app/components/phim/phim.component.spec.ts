import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PhimComponent } from './phim.component';

describe('PhimComponent', () => {
  let component: PhimComponent;
  let fixture: ComponentFixture<PhimComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PhimComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PhimComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
