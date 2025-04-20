import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ComfirmVNPayComponent } from './comfirm-vnpay.component';

const routes: Routes = [
  { path: '', component: ComfirmVNPayComponent } // Khi vào `/the-loai-phim` thì load component này


];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ComfirmVNPayRoutingModule { }
