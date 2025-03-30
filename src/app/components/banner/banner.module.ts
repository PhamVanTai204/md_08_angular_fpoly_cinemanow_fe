import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';  // Quan trọng để sử dụng ngModel
import { RouterModule, Routes } from '@angular/router';
import { BannerComponent } from './banner.component';

const routes: Routes = [
  {
    path: '',
    component: BannerComponent
  }
];

@NgModule({
  declarations: [BannerComponent],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(routes)
  ]
})
export class BannerModule { }