import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { LandlordComponent } from './landlord.component'
import { AccomodationsComponent } from './component/accomodations/accomodations.component'
import { RoomComponent } from './component/room/room.component'
import { AuthGuard } from '../auth/helper/auth.guard'
import { ProfileManagement } from './component/profile/profile.component'
import { CommonConfigComponent } from './component/common-config/common-config.component'
import { TenantsComponent } from './component/tenant-management/tenants.component'
import { InvoiceComponent } from './component/invoice/invoice.component'
import { RoomImagesComponent } from './component/room-images/room-images.component'
import { ServiceManagementComponent } from './component/service-management/service-management.component'
import { EquipmentComponent } from './component/equipment/equipment.component'
import { DepositComponent } from './component/deposit/deposit.component'
import { ContractComponent } from './component/contract/contract.component'
import { ElectricityWaterComponent } from './component/electricity-water/electricity-water.component'
import { ReturnRoomComponent } from './component/return-room/return-room.component'
import { PostComponent } from './component/post/post.component'

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
            { path: 'electricity-waters', component: ElectricityWaterComponent },
            { path: 'config-common', component: CommonConfigComponent},
            { path: 'tenant', component: TenantsComponent},
            { path: 'service', component: ServiceManagementComponent},
            { path: 'equipment', component: EquipmentComponent},
            { path: 'invoice', component: InvoiceComponent},
            { path: 'deposit', component: DepositComponent},
            { path: 'room-image', component: RoomImagesComponent},
            { path: 'contract', component: ContractComponent},
            { path: 'post', component: PostComponent},
            { path: 'checkout', component: ReturnRoomComponent}
        ],
    },
]

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class LandlordRoutingModule {}
