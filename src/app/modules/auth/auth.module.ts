import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthRoutingModule } from './auth-routing.module';
import { AuthComponent } from './auth.component';
import { SharedModuleModule } from '../shared-module/shared-module.module';
import { AccessDeninedComponent } from './access-denined/access-denined.component';


@NgModule({
  declarations: [
    AuthComponent,
    AccessDeninedComponent
  ],
  imports: [
    CommonModule,
    AuthRoutingModule,
    SharedModuleModule
  ]
})
export class AuthModule { }
