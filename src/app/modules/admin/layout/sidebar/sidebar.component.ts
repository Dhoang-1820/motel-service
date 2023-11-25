import { Component, ElementRef, OnInit } from '@angular/core'
import { LayoutService } from 'src/app/modules/landlord/service/layout.service'

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit {
    model: any[] = []

    constructor(public layoutService: LayoutService, public el: ElementRef) {}

    ngOnInit(): void {
        this.model = [
            
            {
                label: 'Quản lý người dùng',
                items: [
                    { label: 'Quản lý người dùng', icon: 'pi pi-fw pi-users', routerLink: ['/administration/user-management'] },
                    { label: 'Quản lý tin đăng', icon: 'pi pi-fw pi-desktop', routerLink: ['/administration/post-management'] },
                ],
            },
        ]
    }
}
