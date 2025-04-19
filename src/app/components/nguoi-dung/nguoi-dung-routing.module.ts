import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NguoiDungComponent } from './nguoi-dung.component';
import { AuthGuard } from '../../../shared/guards/auth.guard';

// Route định nghĩa cho quản lý người dùng thành viên (role 1)
const routes: Routes = [
  {
    path: '',
    component: NguoiDungComponent,
    canActivate: [AuthGuard], // Sử dụng guard để kiểm tra đăng nhập
    data: {
      title: 'Quản lý thành viên',
      breadcrumb: 'Thành viên'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class NguoiDungRoutingModule { }