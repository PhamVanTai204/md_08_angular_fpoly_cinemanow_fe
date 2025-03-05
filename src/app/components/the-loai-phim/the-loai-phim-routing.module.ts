import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TheLoaiPhimComponent } from './the-loai-phim.component';


const routes: Routes = [
  { path: '', component: TheLoaiPhimComponent } // Khi vào `/the-loai-phim` thì load component này
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TheLoaiPhimRoutingModule { }
