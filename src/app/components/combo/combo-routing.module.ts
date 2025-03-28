import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ComboComponent } from './combo.component';

const routes: Routes = [
  { path: '', component: ComboComponent } // Khi vào `/the-loai-phim` thì load component này
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ComboRoutingModule { }
