import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'motel-management',
    loadChildren: () =>
      import('./modules/landlord/landlord.module').then(
        (m) => m.LandlordModule
      ),
  },
  {
    path: 'tenant',
    loadChildren: () =>
      import('./modules/tenant/tenant.module').then((m) => m.TenantModule),
  },
  {
    path: 'motel-service',
    loadChildren: () =>
      import('./modules/users/users.module').then((m) => m.UsersModule),
  },
  { path: 'auth', loadChildren: () => import('./modules/auth/auth.module').then(m => m.AuthModule) },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
