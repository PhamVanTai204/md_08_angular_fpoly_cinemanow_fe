import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';  // Quan trọng để sử dụng ngModel
import { RouterModule, Routes } from '@angular/router';
import { ComboComponent } from './combo.component';
import { CurrencyPipe } from '@angular/common';  // Để sử dụng currency pipe

const routes: Routes = [
  {
    path: '',
    component: ComboComponent
  }
];

@NgModule({
  declarations: [ComboComponent],
  imports: [
    CommonModule,
    FormsModule,  // Cần thiết cho [(ngModel)]
    RouterModule.forChild(routes)
  ],
  providers: [
    CurrencyPipe  // Để sử dụng currency pipe
  ]
})
export class ComboModule { }