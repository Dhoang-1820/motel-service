import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { NgxPermissionsGuard } from 'ngx-permissions'
import { AdminComponent } from './admin.component'
import { AdminProfileComponent } from './components/admin-profile/admin-profile.component'
import { PostListComponent } from './components/post-list/post-list.component'
import { UserManagementComponent } from './components/user-management/user-management.component'
import { NewRegisterComponent } from './components/new-register/new-register.component'

const routes: Routes = [
    {
        path: '',
        component: AdminComponent,
        canActivate: [NgxPermissionsGuard],
        data: {
            permissions: {
                only: ['ROLE_ADMIN'],
                redirectTo: 'access-denined',
            },
        },
        children: [
            { path: '', redirectTo: 'user-management', pathMatch: 'full' },
            { path: 'user-management', component: UserManagementComponent },
            { path: 'post-management', component: PostListComponent },
            { path: 'profile', component: AdminProfileComponent },
            { path: 'new-register', component: NewRegisterComponent },
        ],
    },
]

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class AdminRoutingModule {}
