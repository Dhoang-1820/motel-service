import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LandlordComponent } from './landlord.component';
import { ManagementComponent } from './component/management/management.component';
import { AccomodationsComponent } from './component/accomodations/accomodations.component';

const routes: Routes = [
  {
    path: '',
    component: LandlordComponent,
    children: [
      { path: 'management', component: ManagementComponent },
      { path: 'accomodation', component: AccomodationsComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LandlordRoutingModule {}
