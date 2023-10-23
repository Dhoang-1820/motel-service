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
                        label: 'Thông tin cá nhân',
                        icon: 'pi pi-user',
                        routerLink: '/motel-management/profile',
                    },
                    {
                        label: 'Quản lý phòng trọ',
                        icon: 'pi pi-server',
                        routerLink: '/motel-management/room',
                    },
                    {
                        label: 'Quản lý khách thuê',
                        icon: 'pi pi-users',
                        routerLink: '/motel-management/tenant',
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
