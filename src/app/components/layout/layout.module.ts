// layout.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LayoutRoutingModule } from './layout-routing.module';
import { HttpClientModule } from '@angular/common/http';
// Remove LayoutComponent from imports since it's now standalone

@NgModule({
  declarations: [
    // LayoutComponent removed from here
  ],
  imports: [
    CommonModule,
    RouterModule,
    LayoutRoutingModule,
    HttpClientModule
  ]
})
export class LayoutModule { }