import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LoginRoutingModule } from './login-routing.module';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    LoginRoutingModule,

    FormsModule, // Cần thiết để sử dụng [(ngModel)]
    HttpClientModule, // Để gọi API
  ]
})
export class LoginModule { }
