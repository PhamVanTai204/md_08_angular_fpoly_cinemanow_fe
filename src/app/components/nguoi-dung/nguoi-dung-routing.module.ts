import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NguoiDungComponent } from './nguoi-dung.component';

const routes: Routes = [
  { 
    path: '', 
    component: NguoiDungComponent 
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class NguoiDungRoutingModule { }