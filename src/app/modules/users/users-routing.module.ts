/** @format */

import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { UsersComponent } from './users.component'
import { UserProfileComponent } from './component/user-profile/user-profile.component'
import { MainComponent } from './component/main/main.component'
import { PostManagementComponent } from './component/post-management/post-management.component'
import { UserBookingComponent } from './component/user-booking/user-booking.component'

const routes: Routes = [
    {
        path: '',
        component: UsersComponent,
        children: [
            { path: '', redirectTo: 'home', pathMatch: 'full' },
            { path: 'home', component: MainComponent },
            { path: 'user-profile', component: UserProfileComponent },
            { path: 'user-post', component: PostManagementComponent },
            { path: 'user-booking', component: UserBookingComponent },
        ],
    },
]

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class UsersRoutingModule {}
