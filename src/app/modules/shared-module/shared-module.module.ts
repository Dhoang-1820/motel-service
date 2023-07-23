import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {InputTextModule} from 'primeng/inputtext';
import {KnobModule} from 'primeng/knob';
import { FormsModule } from '@angular/forms';
import {InputSwitchModule} from 'primeng/inputswitch';
import {ButtonModule} from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { FileUploadModule } from 'primeng/fileupload';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { RatingModule } from 'primeng/rating';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { RadioButtonModule } from 'primeng/radiobutton';
import { InputNumberModule } from 'primeng/inputnumber';
import { CheckboxModule } from 'primeng/checkbox';
import { PasswordModule } from 'primeng/password';
import {RouterModule} from '@angular/router';


@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ],
  exports: [
    InputTextModule,
    KnobModule,
    FormsModule,
    InputSwitchModule,
    ButtonModule,
    ToastModule,
    ToolbarModule,
    FileUploadModule,
    TableModule,
    DialogModule,
    RatingModule,
    DropdownModule,
    InputTextareaModule,
    RadioButtonModule,
    InputNumberModule,
    CheckboxModule,
    PasswordModule,
    RouterModule
  ],
})
export class SharedModuleModule { }
