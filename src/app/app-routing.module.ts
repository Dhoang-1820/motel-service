/** @format */

import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { AccessDeninedComponent } from './modules/auth/access-denined/access-denined.component'
import { NgxPermissionsGuard } from 'ngx-permissions'
import { PageNotFoundComponent } from './modules/auth/page-not-found/page-not-found.component'

const routes: Routes = [
    {
        path: '',
        redirectTo: '/motel-service',
        pathMatch: 'full',
    },
    {
        path: 'motel-management',
        loadChildren: () => import('./modules/landlord/landlord.module').then((m) => m.LandlordModule),
        canActivate: [NgxPermissionsGuard],
        data: {
            permissions: {
                only: ['ROLE_ADMIN', 'ROLE_LANDLORD'],
                redirectTo: 'access-denined',
            },
        },
    },
    {
        path: 'motel-service',
        loadChildren: () => import('./modules/users/users.module').then((m) => m.UsersModule),
    },
    { path: 'auth', loadChildren: () => import('./modules/auth/auth.module').then((m) => m.AuthModule) },
    { path: 'access-denined', component: AccessDeninedComponent },
    {
        path: 'administration',
        loadChildren: () => import('./modules/admin/admin.module').then((m) => m.AdminModule),
        canActivate: [NgxPermissionsGuard],
        data: {
            permissions: {
                only: ['ROLE_ADMIN'],
                redirectTo: 'access-denined',
            },
        },
    },
    {
        path: 'page-not-found', component: PageNotFoundComponent 
    },
    {
        path: '**',
        pathMatch: 'full',
        redirectTo: 'page-not-found'
    }
]

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
})
export class AppRoutingModule {}
