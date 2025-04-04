import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LichChieuComponent } from './lich-chieu.component';

describe('LichChieuComponent', () => {
  let component: LichChieuComponent;
  let fixture: ComponentFixture<LichChieuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LichChieuComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(LichChieuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
