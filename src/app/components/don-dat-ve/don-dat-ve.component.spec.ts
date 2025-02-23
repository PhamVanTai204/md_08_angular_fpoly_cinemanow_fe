import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DonDatVeComponent } from './don-dat-ve.component';

describe('DonDatVeComponent', () => {
  let component: DonDatVeComponent;
  let fixture: ComponentFixture<DonDatVeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DonDatVeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DonDatVeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
