import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: 'theloaiphim', loadChildren: () => import('./components/the-loai-phim/the-loai-phim.module').then(m => m.TheLoaiPhimModule) },
  { path: 'phim', loadChildren: () => import('./components/phim/phim.module').then(m => m.PhimModule) },
  { path: 'rap', loadChildren: () => import('./components/rap/rap.module').then(m => m.RapModule) },

  { path: 'thongke', loadChildren: () => import('./components/thong-ke/thong-ke.module').then(m => m.ThongKeModule) },
  { path: 'thanhtoan', loadChildren: () => import('./components/thanh-toan/thanh-toan.module').then(m => m.ThanhToanModule) },
  { path: 'nhanvien', loadChildren: () => import('./components/nhan-vien/nhan-vien.module').then(m => m.NhanVienModule) },
  { path: 'login', loadChildren: () => import('./components/login/login.module').then(m => m.LoginModule) },
  { path: 'layout', loadChildren: () => import('./components/layout/layout.module').then(m => m.LayoutModule) },

  { path: 'lichchieu', loadChildren: () => import('./components/lich-chieu/lich-chieu.module').then(m => m.LichChieuModule) },
  { path: 'nguoidung', loadChildren: () => import('./components/nguoi-dung/nguoi-dung.module').then(m => m.NguoiDungModule) },
  { path: 'giaodich', loadChildren: () => import('./components/giaodich/giaodich.module').then(m => m.GiaodichModule) },
  { path: 'banner', loadChildren: () => import('./components/banner/banner.module').then(m => m.BannerModule) },

  { path: '', redirectTo: 'login', pathMatch: 'full' }, // Mặc định vào trang "Thể loại phim"
];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
