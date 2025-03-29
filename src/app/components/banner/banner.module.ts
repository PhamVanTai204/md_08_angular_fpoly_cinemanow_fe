import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BannerRoutingModule } from './banner-routing.module';
import { RouterModule } from '@angular/router';
import { BannerComponent } from './banner.component';


@NgModule({
  declarations: [
    
  ],
  imports: [
    CommonModule,
    BannerRoutingModule,
  ]
})
export class BannerModule { }
