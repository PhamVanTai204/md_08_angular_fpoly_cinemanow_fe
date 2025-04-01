import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ThongKeComponent } from './thong-ke.component';

const routes: Routes = [
  { 
    path: '', 
    component: ThongKeComponent 
  } // Khi vào `/thongke` thì load component này
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ThongKeRoutingModule { }