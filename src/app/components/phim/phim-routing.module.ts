import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PhimComponent } from './phim.component';


const routes: Routes = [
  { path: '', component: PhimComponent } // Khi vào `/the-loai-phim` thì load component này
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PhimRoutingModule { }
