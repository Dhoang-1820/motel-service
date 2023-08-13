import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { LandlordComponent } from './landlord.component'
import { AccomodationsComponent } from './component/accomodations/accomodations.component'
import { RoomComponent } from './component/room/room.component'
import { BillsComponent } from './component/billManagement/bill.component'
import { AuthGuard } from '../auth/helper/auth.guard'
import { ProfileManagement } from './component/profile/profile.component'
import { CommonConfigComponent } from './component/common-config/common-config.component'
import { TenantsComponent } from './component/tenantManagement/tenants.component'
import { RoomServiceComponent } from './component/room-service/room-service.component'
import { InvoiceComponent } from './component/invoice/invoice.component'
import { RoomImagesComponent } from './component/room-images/room-images.component'

const routes: Routes = [
    {
        path: '',
        component: LandlordComponent,
        canActivate: [AuthGuard],
        children: [
            { path: '', redirectTo: 'accomodation', pathMatch: 'full'},
            { path: 'profile', component: ProfileManagement },
            { path: 'accomodation', component: AccomodationsComponent },
            { path: 'room', component: RoomComponent },
            { path: 'bill', component: BillsComponent },
            { path: 'config-common', component: CommonConfigComponent},
            { path: 'tenant', component: TenantsComponent},
            { path: 'service', component: RoomServiceComponent},
            { path: 'invoice', component: InvoiceComponent},
            { path: 'room-image', component: RoomImagesComponent}
        ],
    },
]

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class LandlordRoutingModule {}
