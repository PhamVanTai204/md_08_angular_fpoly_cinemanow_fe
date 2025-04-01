import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';  // Quan trọng để sử dụng ngModel, ngForm, ngClass
import { RouterModule, Routes } from '@angular/router';
import { RapComponent } from './rap.component';
const routes: Routes = [
  {
    path: '',
    component: RapComponent
  }
];

@NgModule({
  declarations: [RapComponent],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(routes),
  ]
})
export class RapModule { }