import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { GiaodichComponent } from './giaodich.component';
import { GiaodichRoutingModule } from './giaodich-routing.module';
import { CurrencyPipe } from '@angular/common';
import { ShowTimeDialogComponent } from './show-time-dialog/show-time-dialog.component';
import { BrowserModule } from '@angular/platform-browser';
import { ModalModule } from 'ngx-bootstrap/modal';

@NgModule({
  declarations: [GiaodichComponent, ShowTimeDialogComponent],
  imports: [
    CommonModule,
    FormsModule,
    GiaodichRoutingModule,
    ModalModule
  ],
  providers: [
    CurrencyPipe
  ]
})
export class GiaodichModule { }