import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
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
    ReactiveFormsModule,  // Added ReactiveFormsModule
    RouterModule.forChild(routes)
  ]
})
export class BannerModule { }