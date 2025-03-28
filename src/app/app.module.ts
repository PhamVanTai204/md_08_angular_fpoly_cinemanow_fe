import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FormsModule } from '@angular/forms';
import { LayoutComponent } from './components/layout/layout.component';
import { LoginComponent } from './components/login/login.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ButtonModule } from 'primeng/button';
import { TheLoaiPhimComponent } from './components/the-loai-phim/the-loai-phim.component';
import { PhimComponent } from './components/phim/phim.component';
import { RapComponent } from './components/rap/rap.component';
import { LichChieuComponent } from './components/lich-chieu/lich-chieu.component';
import { DonDatVeComponent } from './components/don-dat-ve/don-dat-ve.component';
import { ThanhToanComponent } from './components/thanh-toan/thanh-toan.component';
import { KhuyenMaiComponent } from './components/khuyen-mai/khuyen-mai.component';
import { ThongKeComponent } from './components/thong-ke/thong-ke.component';
import { NhanVienComponent } from './components/nhan-vien/nhan-vien.component';
import { NguoiDungComponent } from './components/nguoi-dung/nguoi-dung.component';
import { HttpClientModule } from '@angular/common/http';
import { BannerComponent } from './components/banner/banner.component';
import { GiaodichComponent } from './components/giaodich/giaodich.component';

@NgModule({
  declarations: [
    AppComponent,
    LayoutComponent,
    LoginComponent,
    TheLoaiPhimComponent,
    PhimComponent,
    RapComponent,
    LichChieuComponent,
    DonDatVeComponent,
    ThanhToanComponent,
    KhuyenMaiComponent,
    ThongKeComponent,
    NhanVienComponent,
    NguoiDungComponent,
    BannerComponent,
    GiaodichComponent,

  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    ButtonModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
