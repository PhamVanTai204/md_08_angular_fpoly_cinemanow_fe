import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThongKeComponent } from './thong-ke.component';

describe('ThongKeComponent', () => {
  let component: ThongKeComponent;
  let fixture: ComponentFixture<ThongKeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ThongKeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ThongKeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
