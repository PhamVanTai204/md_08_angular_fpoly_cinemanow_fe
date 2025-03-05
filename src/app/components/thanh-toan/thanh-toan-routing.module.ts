import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ThanhToanComponent } from './thanh-toan.component';


const routes: Routes = [
  { path: '', component: ThanhToanComponent } // Khi vào `/the-loai-phim` thì load component này
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ThanhToanRoutingModule { }
