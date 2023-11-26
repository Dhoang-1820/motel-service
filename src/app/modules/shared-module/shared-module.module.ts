import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {InputTextModule} from 'primeng/inputtext';
import {KnobModule} from 'primeng/knob';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
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
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TabViewModule } from 'primeng/tabview';
import { CardModule } from 'primeng/card';
import { TooltipModule } from 'primeng/tooltip';
import { SkeletonModule } from 'primeng/skeleton';
import { CalendarModule } from 'primeng/calendar';
import { DividerModule } from 'primeng/divider';
import { NgxPermissionsModule } from 'ngx-permissions';
import { DataViewModule } from 'primeng/dataview';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { GalleriaModule } from 'primeng/galleria';
import { MenuModule } from 'primeng/menu';
import { MultiSelectModule } from 'primeng/multiselect';
import { PickListModule } from 'primeng/picklist';
import { SpeedDialModule } from 'primeng/speeddial';
import { EditorModule } from 'primeng/editor';
import { OnlyNumberDirective } from '../directive/only-number.directive';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    OnlyNumberDirective,
  ],
  exports: [
    EditorModule,
    SpeedDialModule,
    ConfirmPopupModule,
    DataViewModule,
    InputTextModule,
    KnobModule,
    FormsModule,
    InputSwitchModule,
    ButtonModule,
    ToastModule,
    ToolbarModule,
    OnlyNumberDirective,
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
    RouterModule,
    ProgressSpinnerModule,
    TabViewModule,
    CardModule,
    TooltipModule,
    SkeletonModule,
    ReactiveFormsModule,
    CalendarModule,
    DividerModule,
    NgxPermissionsModule,
    GalleriaModule,
    MenuModule,
    MultiSelectModule,
    PickListModule,
    
  ],
})
export class SharedModuleModule { }
