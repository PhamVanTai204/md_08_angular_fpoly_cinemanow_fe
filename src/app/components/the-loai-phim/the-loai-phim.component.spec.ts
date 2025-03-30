import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TheLoaiPhimComponent } from './the-loai-phim.component';

describe('TheLoaiPhimComponent', () => {
  let component: TheLoaiPhimComponent;
  let fixture: ComponentFixture<TheLoaiPhimComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TheLoaiPhimComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(TheLoaiPhimComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
