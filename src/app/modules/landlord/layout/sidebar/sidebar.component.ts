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
                label: 'Trang chủ',
                items: [{ label: 'Dashboard', icon: 'pi pi-fw pi-home', routerLink: ['/'] }],
            },
            {
                label: 'Hệ thống',
                items: [
                    { label: 'Hồ sơ cá nhân', icon: 'pi pi-fw pi-user', routerLink: ['/motel-management/profile'] },
                    { label: 'Cấu hình chung', icon: 'pi pi-fw pi-desktop', routerLink: ['/motel-management/config-common'] },
                    // { label: 'Danh sách dịch vụ', icon: 'pi pi-fw pi-desktop', url: ['https://www.primefaces.org/primeflex/'] },
                ],
            },
            {
                label: 'Khu trọ',
                items: [
                    { label: 'Nhà trọ', icon: 'pi pi-fw pi-id-card', routerLink: ['/motel-management/accomodation'] },
                    { label: 'Phòng', icon: 'pi pi-fw pi-server', routerLink: ['/motel-management/room'] },
                    { label: 'Quản lý ảnh phòng', icon: 'pi pi-fw pi-images', routerLink: ['/motel-management/room-image'] },
                ],
            },
            {
                label: 'Hợp đồng',
                items: [
                    { label: 'Khách thuê', icon: 'pi pi-fw pi-users', routerLink: ['/motel-management/tenant'] },
                    { label: 'Dịch vụ phòng', icon: 'pi pi-fw pi-sitemap', routerLink: ['/motel-management/service'] },
                ],
            },
            {
                label: 'Hoá đơn',
                icon: 'pi pi-fw pi-briefcase',
                items: [
                    {
                        label: 'Quản lý điện nước',
                        icon: 'pi pi-fw pi-globe',
                        routerLink: ['/motel-management/bill'],
                    },
                    {
                        label: 'Xuất hoá đơn',
                        icon: 'pi pi-fw pi-euro',
                        routerLink: ['/motel-management/invoice'],
                    }
                ],
            },
        ]
    }
}
