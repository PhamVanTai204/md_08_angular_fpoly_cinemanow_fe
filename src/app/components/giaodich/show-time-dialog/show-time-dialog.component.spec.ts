import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowTimeDialogComponent } from './show-time-dialog.component';

describe('ShowTimeDialogComponent', () => {
  let component: ShowTimeDialogComponent;
  let fixture: ComponentFixture<ShowTimeDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ShowTimeDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShowTimeDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
