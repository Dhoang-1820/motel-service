import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'

import { SharedModuleModule } from '../shared-module/shared-module.module'
import { AccomodationsComponent } from './component/accomodations/accomodations.component'
import { ReportComponent } from './component/report/report.component'
import { RoomComponent } from './component/room/room.component'
import { TenantsComponent } from './component/tenant-management/tenants.component'
import { LandlordRoutingModule } from './landlord-routing.module'
import { LandlordComponent } from './landlord.component'
import { ProfileManagement } from './component/profile/profile.component'
import { CommonConfigComponent } from './component/common-config/common-config.component'
import { InvoiceComponent } from './component/invoice/invoice.component'
import { RoomImagesComponent } from './component/room-images/room-images.component'
import { SidebarComponent } from './layout/sidebar/sidebar.component'
import { MenuitemComponent } from './layout/menuitem/menuitem.component'
import { HeaderComponent } from './layout/header/header.component'
import { TagModule } from 'primeng/tag';
import { ServiceManagementComponent } from './component/service-management/service-management.component';
import { EquipmentComponent } from './component/equipment/equipment.component';
import { DepositComponent } from './component/deposit/deposit.component';
import { ContractComponent } from './component/contract/contract.component'
import { ElectricityWaterComponent } from './component/electricity-water/electricity-water.component';
import { ReturnRoomComponent } from './component/return-room/return-room.component';
import { PostComponent } from './component/post/post.component'


@NgModule({
    declarations: [
        LandlordComponent,
        ReportComponent,
        TenantsComponent,
        AccomodationsComponent,
        RoomComponent,
        ElectricityWaterComponent,
        ProfileManagement,
        CommonConfigComponent,
        ServiceManagementComponent,
        InvoiceComponent,
        RoomImagesComponent,
        SidebarComponent,
        MenuitemComponent,
        HeaderComponent,
        EquipmentComponent,
        DepositComponent,
        ContractComponent,
        ReturnRoomComponent,
        PostComponent,
    ],
    imports: [CommonModule, LandlordRoutingModule, SharedModuleModule, TagModule],
})
export class LandlordModule {}
