import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'

import { SharedModuleModule } from '../shared-module/shared-module.module'
import { AccomodationsComponent } from './component/accomodations/accomodations.component'
import { ReportComponent } from './component/report/report.component'
import { RoomComponent } from './component/room/room.component'
import { BillsComponent } from './component/billManagement/bill.component'
import { TenantsComponent } from './component/tenantManagement/tenants.component'
import { LandlordRoutingModule } from './landlord-routing.module'
import { LandlordComponent } from './landlord.component'
import { ProfileManagement } from './component/profile/profile.component'
import { CommonConfigComponent } from './component/common-config/common-config.component'
import { RoomServiceComponent } from './component/room-service/room-service.component'
import { InvoiceComponent } from './component/invoice/invoice.component'
import { RoomImagesComponent } from './component/room-images/room-images.component'
import { SidebarComponent } from './layout/sidebar/sidebar.component'
import { MenuitemComponent } from './layout/menuitem/menuitem.component'
import { HeaderComponent } from './layout/header/header.component'

@NgModule({
    declarations: [
        LandlordComponent,
        ReportComponent,
        TenantsComponent,
        AccomodationsComponent,
        RoomComponent,
        BillsComponent,
        ProfileManagement,
        CommonConfigComponent,
        RoomServiceComponent,
        InvoiceComponent,
        RoomImagesComponent,
        SidebarComponent,
        MenuitemComponent,
        HeaderComponent,
    ],
    imports: [CommonModule, LandlordRoutingModule, SharedModuleModule],
})
export class LandlordModule {}
