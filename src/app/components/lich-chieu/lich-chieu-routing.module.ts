import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LichChieuComponent } from './lich-chieu.component';

const routes: Routes = [
  {
    path: '',
    component: LichChieuComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LichChieuRoutingModule { }