import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { NgxPermissionsGuard } from 'ngx-permissions'
import { AccessDeninedComponent } from './modules/auth/access-denined/access-denined.component'

const routes: Routes = [
    {
        path: '',
        redirectTo: '/motel-service',
        pathMatch: 'full',
    },
    {
        path: 'motel-management',
        loadChildren: () => import('./modules/landlord/landlord.module').then((m) => m.LandlordModule),
        // canActivate: [NgxPermissionsGuard],
        // data: {
        //     permissions: {
        //         only: ['ROLE_ADMIN', 'ROLE_LANDLORD'],
        //         redirectTo: 'access-denined'
        //     }
        // }
    },
    {
        path: 'tenant',
        loadChildren: () => import('./modules/tenant/tenant.module').then((m) => m.TenantModule),
    },
    {
        path: 'motel-service',
        loadChildren: () => import('./modules/users/users.module').then((m) => m.UsersModule),
    },
    { path: 'auth', loadChildren: () => import('./modules/auth/auth.module').then((m) => m.AuthModule) },
    { path: 'access-denined', component: AccessDeninedComponent}
]

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
})
export class AppRoutingModule {}
