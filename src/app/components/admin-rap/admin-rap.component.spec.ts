import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminRapComponent } from './admin-rap.component';

describe('AdminRapComponent', () => {
  let component: AdminRapComponent;
  let fixture: ComponentFixture<AdminRapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AdminRapComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminRapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
