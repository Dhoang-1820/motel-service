import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {InputTextModule} from 'primeng/inputtext';
import {KnobModule} from 'primeng/knob';
import { FormsModule } from '@angular/forms';
import {InputSwitchModule} from 'primeng/inputswitch';

@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ],
  exports: [
    InputTextModule,
    KnobModule,
    FormsModule,
    InputSwitchModule
  ]
})
export class SharedModuleModule { }
