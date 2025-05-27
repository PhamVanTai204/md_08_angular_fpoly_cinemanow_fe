import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginRoutingModule } from './login-routing.module';

@NgModule({
  declarations: [], // Để trống vì LoginComponent là standalone
  imports: [
    CommonModule,
    LoginRoutingModule
    // Không cần FormsModule, HttpClientModule vì LoginComponent tự import
  ]
})
export class LoginModule { }