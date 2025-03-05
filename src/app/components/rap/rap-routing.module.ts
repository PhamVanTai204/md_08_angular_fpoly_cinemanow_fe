import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RapComponent } from './rap.component';


const routes: Routes = [
  { path: '', component: RapComponent } // Khi vào `/the-loai-phim` thì load component này
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RapRoutingModule { }
