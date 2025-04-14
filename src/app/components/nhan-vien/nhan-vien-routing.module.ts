import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NhanVienComponent } from './nhan-vien.component';
import { AuthGuard } from '../../../shared/guards/auth.guard';
import { AdminGuard } from '../../../shared/guards/admin.guard';

// Route định nghĩa cho quản lý admin và nhân viên (role 2 và 3)
const routes: Routes = [
  {
    path: '',
    component: NhanVienComponent,
    canActivate: [AuthGuard, AdminGuard], // Chỉ cho phép admin truy cập
    data: {
      title: 'Quản lý nhân viên và admin',
      breadcrumb: 'Nhân viên & Admin',
      requiredRole: 2 // Yêu cầu role admin
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class NhanVienRoutingModule { }