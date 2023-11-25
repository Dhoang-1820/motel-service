import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { AdminComponent } from './admin.component'
import { UserManagementComponent } from './components/user-management/user-management.component'
import { PostListComponent } from './components/post-list/post-list.component'

const routes: Routes = [
    {
        path: '',
        component: AdminComponent,
        children: [
            { path: '', redirectTo: 'user-management', pathMatch: 'full' },
            { path: 'user-management', component: UserManagementComponent },
            { path: 'post-management', component: PostListComponent },
        ],
    },
]

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class AdminRoutingModule {}
