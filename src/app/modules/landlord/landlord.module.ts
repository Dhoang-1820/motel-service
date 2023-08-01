import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { SharedModuleModule } from '../shared-module/shared-module.module';
import { AccomodationsComponent } from './component/accomodations/accomodations.component';
import { ManagementComponent } from './component/management/management.component';
import { ReportComponent } from './component/report/report.component';
import { RoomComponent } from './component/room/room.component';
import { ServiceComponent } from './component/serviceManagement/service.component';
import { SystemComponent } from './component/system/system.component';
import { LandlordRoutingModule } from './landlord-routing.module';
import { LandlordComponent } from './landlord.component';
import { HeaderComponent } from './layout/header/header.component';
import { MenuitemComponent } from './layout/menuitem/menuitem.component';
import { SidebarComponent } from './layout/sidebar/sidebar.component';

@NgModule({
  declarations: [
    LandlordComponent,
    ManagementComponent,
    ReportComponent,
    SystemComponent,
    AccomodationsComponent,
    HeaderComponent,
    SidebarComponent,
    MenuitemComponent,
    RoomComponent,
    ServiceComponent,
  ],
  imports: [
    CommonModule,
    LandlordRoutingModule,
    SharedModuleModule
  ]
})
export class LandlordModule { }
