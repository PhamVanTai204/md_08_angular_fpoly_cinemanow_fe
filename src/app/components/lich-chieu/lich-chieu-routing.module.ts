import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LichChieuComponent } from './lich-chieu.component';


const routes: Routes = [
  { path: '', component: LichChieuComponent } // Khi vào `/the-loai-phim` thì load component này
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LichChieuRoutingModule { }
