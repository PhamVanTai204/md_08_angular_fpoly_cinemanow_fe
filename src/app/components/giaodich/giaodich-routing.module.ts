import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GiaodichComponent } from './giaodich.component';

const routes: Routes = [
  { path: '', component: GiaodichComponent } // Khi vào `/the-loai-phim` thì load component này
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class GiaodichRoutingModule { }
