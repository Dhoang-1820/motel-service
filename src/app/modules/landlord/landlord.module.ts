import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LandlordRoutingModule } from './landlord-routing.module';
import { LandlordComponent } from './landlord.component';
import { ManagementComponent } from './component/management/management.component';
import { ReportComponent } from './component/report/report.component';
import { SystemComponent } from './component/system/system.component';
import { AccomodationsComponent } from './component/accomodations/accomodations.component';
import { HeaderComponent } from './layout/header/header.component';
import { SharedModuleModule } from '../shared-module/shared-module.module';
import { SidebarComponent } from './layout/sidebar/sidebar.component';
import { MenuitemComponent } from './layout/menuitem/menuitem.component';
import { RoomComponent } from './component/room/room.component';
import { ServiceComponent } from './component/serviceManagement/service.component';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { JwtInterceptor } from './helper/jwt.interceptor';

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
