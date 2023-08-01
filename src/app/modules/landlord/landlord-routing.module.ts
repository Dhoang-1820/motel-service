import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { LandlordComponent } from './landlord.component'
import { ManagementComponent } from './component/management/management.component'
import { AccomodationsComponent } from './component/accomodations/accomodations.component'
import { RoomComponent } from './component/room/room.component'
import { ServiceComponent } from './component/serviceManagement/service.component'
import { AuthGuard } from '../auth/helper/auth.guard'

const routes: Routes = [
    {
        path: '',
        component: LandlordComponent,
        canActivate: [AuthGuard],
        children: [
            { path: '', redirectTo: 'accomodation', pathMatch: 'full'},
            { path: 'management', component: ManagementComponent },
            { path: 'accomodation', component: AccomodationsComponent },
            { path: 'room', component: RoomComponent },
            { path: 'service', component: ServiceComponent },
        ],
    },
]

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class LandlordRoutingModule {}
