import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DonDatVeComponent } from './don-dat-ve.component';


const routes: Routes = [
  { path: '', component: DonDatVeComponent } // Khi vào `/the-loai-phim` thì load component này
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DonDatVeRoutingModule { }
