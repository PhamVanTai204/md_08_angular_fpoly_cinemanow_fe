import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { NguoiDungComponent } from './nguoi-dung.component';

describe('NguoiDungComponent', () => {
  let component: NguoiDungComponent;
  let fixture: ComponentFixture<NguoiDungComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NguoiDungComponent],
      imports: [
        HttpClientTestingModule,
        FormsModule
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(NguoiDungComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});