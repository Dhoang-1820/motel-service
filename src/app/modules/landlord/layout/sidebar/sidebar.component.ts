import { Component, ElementRef, OnInit } from '@angular/core'
import { LayoutService } from '../../service/layout.service'

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
                label: 'Trang chủ',
                items: [{ label: 'Dashboard', icon: 'pi pi-fw pi-home', routerLink: ['/'] }],
            },
            {
                label: 'Hệ thống',
                items: [
                    { label: 'Hồ sơ cá nhân', icon: 'pi pi-fw pi-prime', routerLink: ['/utilities/icons'] },
                    { label: 'Cấu hình chung', icon: 'pi pi-fw pi-desktop', url: ['https://www.primefaces.org/primeflex/'] },
                    { label: 'Danh sách dịch vụ', icon: 'pi pi-fw pi-desktop', url: ['https://www.primefaces.org/primeflex/'] },
                ],
            },
            {
                label: 'Khu trọ',
                items: [
                    { label: 'Nhà trọ', icon: 'pi pi-fw pi-id-card', routerLink: ['/motel-management/accomodation'] },
                    { label: 'Phòng', icon: 'pi pi-fw pi-check-square', routerLink: ['/motel-management/room'] },
                    { label: 'Dịch vụ', icon: 'pi pi-fw pi-bookmark', routerLink: ['/motel-management/service'] },
                    { label: 'Thiết bị', icon: 'pi pi-fw pi-exclamation-circle', routerLink: ['/uikit/invalidstate'] },
                ],
            },

            {
                label: 'Hoá đơn',
                icon: 'pi pi-fw pi-briefcase',
                items: [
                    {
                        label: 'Điện nước',
                        icon: 'pi pi-fw pi-globe',
                        routerLink: ['/landing'],
                    },
                    {
                        label: 'Xuất hoá đơn',
                        icon: 'pi pi-fw pi-user',
                    }
                ],
            },
        ]
    }
}
