import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GiaodichComponent } from './giaodich.component';

describe('GiaodichComponent', () => {
  let component: GiaodichComponent;
  let fixture: ComponentFixture<GiaodichComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GiaodichComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(GiaodichComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
