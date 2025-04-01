// layout-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutComponent } from './layout.component';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: 'theloaiphim', loadChildren: () => import('../the-loai-phim/the-loai-phim.module').then(m => m.TheLoaiPhimModule) },
      { path: 'phim', loadChildren: () => import('../phim/phim.module').then(m => m.PhimModule) },
      { path: 'rap', loadChildren: () => import('../rap/rap.module').then(m => m.RapModule) },
      { path: 'thongke', loadChildren: () => import('../thong-ke/thong-ke.module').then(m => m.ThongKeModule) },
      { path: 'thanhtoan', loadChildren: () => import('../thanh-toan/thanh-toan.module').then(m => m.ThanhToanModule) },
      { path: 'nhanvien', loadChildren: () => import('../nhan-vien/nhan-vien.module').then(m => m.NhanVienModule) },
      { path: 'lichchieu', loadChildren: () => import('../lich-chieu/lich-chieu.module').then(m => m.LichChieuModule) },
      { path: 'nguoidung', loadChildren: () => import('../nguoi-dung/nguoi-dung.module').then(m => m.NguoiDungModule) },
      { path: 'giaodich', loadChildren: () => import('../giaodich/giaodich.module').then(m => m.GiaodichModule) },
      { path: 'banner', loadChildren: () => import('../banner/banner.module').then(m => m.BannerModule) },
      { path: 'combo', loadChildren: () => import('../combo/combo.module').then(m => m.ComboModule) },
      { path: 'voucher', loadChildren: () => import('../voucher/voucher.module').then(m => m.VoucherModule) },
      { path: 'room/:idRoom', loadChildren: () => import('../room/room.module').then(m => m.RoomModule) },


      { path: '', redirectTo: 'theloaiphim', pathMatch: 'full' }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LayoutRoutingModule { }