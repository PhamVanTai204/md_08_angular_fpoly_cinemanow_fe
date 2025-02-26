import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NhanVienComponent } from './nhan-vien.component';


const routes: Routes = [
  { path: '', component: NhanVienComponent } // Khi vào `/the-loai-phim` thì load component này
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class NhanVienRoutingModule { }
