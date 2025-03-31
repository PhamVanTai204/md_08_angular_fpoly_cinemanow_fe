import { NgModule } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ComboComponent } from './combo.component';
import { ComboRoutingModule } from './combo-routing.module';

@NgModule({
  declarations: [
    ComboComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ComboRoutingModule
  ],
  providers: [
    CurrencyPipe
  ]
})
export class ComboModule { }