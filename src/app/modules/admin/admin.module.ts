import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'

import { AdminRoutingModule } from './admin-routing.module'
import { AdminComponent } from './admin.component'
import { UserManagementComponent } from './components/user-management/user-management.component'
import { SharedModule } from 'primeng/api'
import { InputTextModule } from 'primeng/inputtext'
import { KnobModule } from 'primeng/knob'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { InputSwitchModule } from 'primeng/inputswitch'
import { ButtonModule } from 'primeng/button'
import { ToastModule } from 'primeng/toast'
import { ToolbarModule } from 'primeng/toolbar'
import { FileUploadModule } from 'primeng/fileupload'
import { TableModule } from 'primeng/table'
import { DialogModule } from 'primeng/dialog'
import { RatingModule } from 'primeng/rating'
import { DropdownModule } from 'primeng/dropdown'
import { InputTextareaModule } from 'primeng/inputtextarea'
import { RadioButtonModule } from 'primeng/radiobutton'
import { InputNumberModule } from 'primeng/inputnumber'
import { CheckboxModule } from 'primeng/checkbox'
import { PasswordModule } from 'primeng/password'
import { RouterModule } from '@angular/router'
import { ProgressSpinnerModule } from 'primeng/progressspinner'
import { TabViewModule } from 'primeng/tabview'
import { CardModule } from 'primeng/card'
import { TooltipModule } from 'primeng/tooltip'
import { SkeletonModule } from 'primeng/skeleton'
import { CalendarModule } from 'primeng/calendar'
import { DividerModule } from 'primeng/divider'
import { NgxPermissionsModule } from 'ngx-permissions'
import { DataViewModule } from 'primeng/dataview'
import { ConfirmPopupModule } from 'primeng/confirmpopup'
import { GalleriaModule } from 'primeng/galleria'
import { MenuModule } from 'primeng/menu'
import { SidebarComponent } from './layout/sidebar/sidebar.component'
import { MenuitemComponent } from './layout/menuitem/menuitem.component'
import { HeaderComponent } from './layout/header/header.component'
import { TagModule } from 'primeng/tag';
import { PostListComponent } from './components/post-list/post-list.component';
import { FieldsetModule } from 'primeng/fieldset';
import { AdminProfileComponent } from './components/admin-profile/admin-profile.component'

@NgModule({
    declarations: [AdminComponent, UserManagementComponent, SidebarComponent, MenuitemComponent, HeaderComponent, PostListComponent, AdminProfileComponent],
    imports: [
        CommonModule,
        AdminRoutingModule,
        SharedModule,
        ConfirmPopupModule,
        FieldsetModule,
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
        GalleriaModule,
        MenuModule,
        TagModule
    ],
})
export class AdminModule {}
