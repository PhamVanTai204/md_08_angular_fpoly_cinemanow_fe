// app-routing.module.ts - OPTIMIZED VERSION
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../shared/guards/auth.guard';

const routes: Routes = [
  // Public route - No auth guard here
  { 
    path: 'login', 
    loadChildren: () => import('./components/login/login.module').then(m => m.LoginModule)
  },
  
  // Protected Layout route - This should be the parent for all admin pages
  { 
    path: 'layout', 
    loadChildren: () => import('./components/layout/layout.module').then(m => m.LayoutModule),
    canActivate: [AuthGuard]
  },
  
  // Special case for VNPay confirmation
  { 
    path: 'confirmVNPay', 
    loadChildren: () => import('./components/comfirm-vnpay/comfirm-vnpay.module').then(m => m.ComfirmVNPayModule)
  },
  
  // Default route - redirect to login
  { 
    path: '', 
    redirectTo: 'login', 
    pathMatch: 'full' 
  },
  
  // Wildcard route - handle 404
  { 
    path: '**', 
    redirectTo: 'login'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }