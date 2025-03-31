import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { NguoiDungComponent } from './nguoi-dung.component';
import { NguoiDungRoutingModule } from './nguoi-dung-routing.module';

@NgModule({
  declarations: [
    NguoiDungComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    NguoiDungRoutingModule
  ],
  providers: [
    DatePipe
  ]
})
export class NguoiDungModule { }