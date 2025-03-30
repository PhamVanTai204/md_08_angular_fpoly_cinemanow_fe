import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { NhanVienRoutingModule } from './nhan-vien-routing.module';
import { NhanVienComponent } from './nhan-vien.component';

@NgModule({
  declarations: [
    NhanVienComponent
  ],
  imports: [
    CommonModule,
    FormsModule,        // Cần thiết cho [(ngModel)]
    HttpClientModule,   // Cần thiết cho HttpClient
    NhanVienRoutingModule
  ],
  providers: []
})
export class NhanVienModule { }