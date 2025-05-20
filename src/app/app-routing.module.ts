import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminGuard } from '../shared/guards/admin.guard';

const routes: Routes = [
  // The layout route should be the only one that loads admin components
  { path: 'layout', loadChildren: () => import('./components/layout/layout.module').then(m => m.LayoutModule) },

  // Login route outside of layout
  { path: 'login', loadChildren: () => import('./components/login/login.module').then(m => m.LoginModule) },

  // Room and confirm routes outside of layout
  { path: 'room/:idRoom/:showtimeId', loadChildren: () => import('./components/room/room.module').then(m => m.RoomModule) },
  { path: 'confirmVNPay', loadChildren: () => import('./components/comfirm-vnpay/comfirm-vnpay.module').then(m => m.ComfirmVNPayModule) },

  // Redirect root to login
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // Catch all other routes and redirect to layout
  { path: '**', redirectTo: 'layout' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
