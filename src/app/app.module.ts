import { NgModule } from '@angular/core'; 
import { BrowserModule } from '@angular/platform-browser'; 
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'; 
import { AppRoutingModule } from './app-routing.module'; 
import { AppComponent } from './app.component'; 
import { FormsModule } from '@angular/forms'; 
import { HttpClientModule } from '@angular/common/http'; 
import { ButtonModule } from 'primeng/button'; 
import { CommonModule } from '@angular/common'; 
import { ModalModule } from 'ngx-bootstrap/modal'; 

// Guards
import { AuthGuard } from '../shared/guards/auth.guard';
import { AdminGuard } from '../shared/guards/admin.guard';
import { RoleGuard } from '../shared/guards/role.guard';

// Services
import { UserService } from '../shared/services/user.service';
import { PhanQuyenService } from '../shared/services/phanquyen.service';
import { PermissionService } from '../shared/services/permission.service';

@NgModule({
  declarations: [
    AppComponent,
    // Other components
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    ButtonModule,
    CommonModule,
    ModalModule.forRoot(),
  ],
  providers: [
    // Guards
    AuthGuard,
    AdminGuard,
    RoleGuard,
    
    // Services
    UserService,
    PhanQuyenService,
    PermissionService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }