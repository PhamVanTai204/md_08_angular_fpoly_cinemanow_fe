import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComfirmVNPayComponent } from './comfirm-vnpay.component';

describe('ComfirmVNPayComponent', () => {
  let component: ComfirmVNPayComponent;
  let fixture: ComponentFixture<ComfirmVNPayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ComfirmVNPayComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ComfirmVNPayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
