// layout-routing.module.ts - UPDATED VERSION WITH CORRECTED PERMISSIONS
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutComponent } from './layout.component';
import { AuthGuard } from '../../../shared/guards/auth.guard';
import { RoleGuard } from '../../../shared/guards/role.guard';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    canActivate: [AuthGuard], // All layout routes require authentication
    children: [
      {
        path: 'theloaiphim',
        loadChildren: () => import('../the-loai-phim/the-loai-phim.module').then(m => m.TheLoaiPhimModule),
        canActivate: [RoleGuard],
        data: {
          allowedRoles: [2] // Only Cinema Admin can access
        }
      },
      {
        path: 'phim',
        loadChildren: () => import('../phim/phim.module').then(m => m.PhimModule),
        canActivate: [RoleGuard],
        data: {
          allowedRoles: [2] // Only Cinema Admin can access
        }
      },
      {
        path: 'rap',
        loadChildren: () => import('../rap/rap.module').then(m => m.RapModule),
        canActivate: [RoleGuard],
        data: {
          allowedRoles: [2, 4] // Both Cinema Admin and System Admin can access
        }
      },
      {
        path: 'adminrap',
        loadChildren: () => import('../admin-rap/admin-rap.module').then(m => m.AdminRapModule),
        canActivate: [RoleGuard],
        data: {
          allowedRoles: [4] // Only System Admin can access
        }
      },
      {
        path: 'thongke',
        loadChildren: () => import('../thong-ke/thong-ke.module').then(m => m.ThongKeModule),
        canActivate: [RoleGuard],
        data: {
          allowedRoles: [2, 4] // Only Cinema Admin can access statistics
        }
      },
      {
        path: 'thanhtoan',
        loadChildren: () => import('../thanh-toan/thanh-toan.module').then(m => m.ThanhToanModule),
        canActivate: [RoleGuard],
        data: {
          allowedRoles: [2, 3] // Cinema Admin and Staff can access
        }
      },
      {
        path: 'nhanvien',
        loadChildren: () => import('../nhan-vien/nhan-vien.module').then(m => m.NhanVienModule),
        canActivate: [RoleGuard],
        data: {
          allowedRoles: [2] // Only Cinema Admin can access staff management
        }
      },
      {
        path: 'lichchieu',
        loadChildren: () => import('../lich-chieu/lich-chieu.module').then(m => m.LichChieuModule),
        canActivate: [RoleGuard],
        data: {
          allowedRoles: [2] // Only Cinema Admin can access
        }
      },
      {
        path: 'nguoidung',
        loadChildren: () => import('../nguoi-dung/nguoi-dung.module').then(m => m.NguoiDungModule),
        canActivate: [RoleGuard],
        data: {
          allowedRoles: [4] // FIXED: Only System Admin can access user management
        }
      },
      {
        path: 'giaodich',
        loadChildren: () => import('../giaodich/giaodich.module').then(m => m.GiaodichModule),
        canActivate: [RoleGuard],
        data: {
          allowedRoles: [3] // Cinema Admin and Staff can access
        }
      },
      {
        path: 'banner',
        loadChildren: () => import('../banner/banner.module').then(m => m.BannerModule),
        canActivate: [RoleGuard],
        data: {
          allowedRoles: [2] // Only Cinema Admin can manage banners
        }
      },
      {
        path: 'combo',
        loadChildren: () => import('../combo/combo.module').then(m => m.ComboModule),
        canActivate: [RoleGuard],
        data: {
          allowedRoles: [2] // Only Cinema Admin can access combos
        }
      },
      {
        path: 'voucher',
        loadChildren: () => import('../voucher/voucher.module').then(m => m.VoucherModule),
        canActivate: [RoleGuard],
        data: {
          allowedRoles: [2] // Only Cinema Admin can manage vouchers
        }
      },
      {
        path: 'room/:idRoom/:showtimeId/:quanLyStatus',
        loadChildren: () => import('../room/room.module').then(m => m.RoomModule),
        canActivate: [RoleGuard],
        data: {
          allowedRoles: [2, 3, 4] // Cinema Admin, Staff, and System Admin can access rooms
        }
      },
      {
        path: 'dondat',
        loadChildren: () => import('../don-dat-ve/don-dat-ve.module').then(m => m.DonDatVeModule),
        canActivate: [RoleGuard],
        data: {
          allowedRoles: [2] // Only Cinema Admin can access
        }
      },
      {
        path: 'danhgia',
        loadChildren: () => import('../khuyen-mai/khuyen-mai.module').then(m => m.KhuyenMaiModule),
        canActivate: [RoleGuard],
        data: {
          allowedRoles: [4] // Only System Admin can access
        }
      },
      {
        path: 'room/:idRoom',
        loadChildren: () => import('../room/room.module').then(m => m.RoomModule),
        canActivate: [RoleGuard],
        data: {
          allowedRoles: [2, 3, 4] // Cinema Admin, Staff, and System Admin can access rooms
        }
      },
      // Fallback route - redirect based on role
      {
        path: '',
        redirectTo: 'rap', // Default redirect to 'rap'
        pathMatch: 'full'
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LayoutRoutingModule { }