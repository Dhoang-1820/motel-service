import { Component, ElementRef, OnInit, ViewChild } from '@angular/core'
import { MenuItem } from 'primeng/api'
import { AuthenticationService } from 'src/app/modules/auth/service/authentication.service'
import { LayoutService } from 'src/app/modules/landlord/service/layout.service'

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
    items!: MenuItem[]

    @ViewChild('menubutton') menuButton!: ElementRef

    @ViewChild('topbarmenubutton') topbarMenuButton!: ElementRef

    @ViewChild('topbarmenu') menu!: ElementRef

    constructor(public layoutService: LayoutService, private authService: AuthenticationService) {
        this.items = [
            {
                label: 'Menu',
                items: [
                    {
                        label: 'Quản lý người dùng',
                        icon: 'pi pi-fw pi-users',
                        routerLink: '/admin/user-management',
                    },
                    {
                        label: 'Đăng xuất',
                        icon: 'pi pi-sign-out',
                        command: () => {
                            this.logout()
                        },
                    },
                ],
            },
        ]
    }

    ngOnInit(): void {}

    logout() {
        this.authService.logout()
    }
}
