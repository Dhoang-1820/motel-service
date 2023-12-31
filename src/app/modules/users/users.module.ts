import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UsersRoutingModule } from './users-routing.module';
import { UsersComponent } from './users.component';
import { SharedModule } from 'primeng/api';
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
import { FieldsetModule } from 'primeng/fieldset';
import { GoogleMapsModule } from '@angular/google-maps';
import { CascadeSelectModule } from 'primeng/cascadeselect';
import { SliderModule } from 'primeng/slider';
import { ChipModule } from 'primeng/chip';
import { SelectButtonModule } from 'primeng/selectbutton';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { ListboxModule } from 'primeng/listbox';
import { MenuModule } from 'primeng/menu';
import { UserProfileComponent } from './component/user-profile/user-profile.component';
import { MainComponent } from './component/main/main.component';
import { PostManagementComponent } from './component/post-management/post-management.component';
import { TagModule } from 'primeng/tag';
import { EditorModule } from 'primeng/editor';
import { OnlyNumberDirective } from '../directive/only-number.directive';
import { UserBookingComponent } from './component/user-booking/user-booking.component';

@NgModule({
  declarations: [
    UsersComponent,
    UserProfileComponent,
    MainComponent,
    PostManagementComponent,
    UserBookingComponent
  ],
  imports: [
    CommonModule,
    UsersRoutingModule,
    SharedModule,
    TagModule,
    SliderModule,
    EditorModule,
    ListboxModule,
    OnlyNumberDirective,
    MenuModule,
    SelectButtonModule,
    BreadcrumbModule,
    ChipModule,
    GalleriaModule,
    FieldsetModule,
    ConfirmPopupModule,
    DataViewModule,
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
    GoogleMapsModule,
    CascadeSelectModule
  ]
})
export class UsersModule { }
