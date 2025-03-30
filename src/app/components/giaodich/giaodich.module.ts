import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { GiaodichComponent } from './giaodich.component';
import { GiaodichRoutingModule } from './giaodich-routing.module';
import { CurrencyPipe } from '@angular/common';

@NgModule({
  declarations: [GiaodichComponent],
  imports: [
    CommonModule,
    FormsModule,
    GiaodichRoutingModule
  ],
  providers: [
    CurrencyPipe
  ]
})
export class GiaodichModule { }