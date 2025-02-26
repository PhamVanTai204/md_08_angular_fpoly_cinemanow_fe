import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { KhuyenMaiComponent } from './khuyen-mai.component';


const routes: Routes = [
  { path: '', component: KhuyenMaiComponent } // Khi vào `/the-loai-phim` thì load component này
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class KhuyenMaiRoutingModule { }
