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
                ],
            },
            {
                label: 'Khu trọ',
                items: [
                    { label: 'Nhà trọ', icon: 'pi pi-fw pi-id-card', routerLink: ['/motel-management/accomodation'] },
                    { label: 'Phòng', icon: 'pi pi-fw pi-server', routerLink: ['/motel-management/room'] },
                    { label: 'Dịch vụ', icon: 'pi pi-th-large', routerLink: ['/motel-management/service'] },
                    { label: 'Thiết bị', icon: 'pi pi-table', routerLink: ['/motel-management/equipment'] },
                    { label: 'Quản lý ảnh phòng', icon: 'pi pi-fw pi-images', routerLink: ['/motel-management/room-image'] },
                ],
            },
            {
                label: 'Hợp đồng',
                items: [
                    { label: 'Hợp đồng', icon: 'pi pi-ticket', routerLink: ['/motel-management/contract'] },
                    { label: 'Đặt cọc phòng', icon: 'pi pi-fw pi-sitemap', routerLink: ['/motel-management/deposit'] },
                    { label: 'Khách thuê', icon: 'pi pi-fw pi-users', routerLink: ['/motel-management/tenant'] },
                    { label: 'Lịch sử khách thuê', icon: 'pi pi-history', routerLink: ['/motel-management/#'] },
                ],
            },
            {
                label: 'Hoá đơn',
                icon: 'pi pi-fw pi-briefcase',
                items: [
                    {
                        label: 'Quản lý điện nước',
                        icon: 'pi pi-fw pi-globe',
                        routerLink: ['/motel-management/electricity-waters'],
                    },
                    {
                        label: 'Xuất hoá đơn',
                        icon: 'pi pi-fw pi-euro',
                        routerLink: ['/motel-management/invoice'],
                    },
                    {
                        label: 'Trả phòng',
                        icon: 'pi pi-wallet',
                        routerLink: ['/motel-management/checkout'],
                    },
                    {
                        label: 'Phiếu chi',
                        icon: 'pi pi-shopping-bag',
                        routerLink: ['/motel-management/#'],
                    }
                ],
            },
            {
                label: 'Đăng tin',
                icon: 'pi pi-fw pi-briefcase',
                items: [
                    {
                        label: 'Quản lý bài đăng',
                        icon: 'pi pi-bookmark',
                        routerLink: ['/motel-management/post'],
                    },
                ],
            },
            {
                label: 'Đặt phòng',
                icon: 'pi pi-fw pi-briefcase',
                items: [
                    {
                        label: 'Thông báo đặt phòng',
                        icon: 'pi pi-envelope',
                        routerLink: ['/motel-management/booking'],
                    },
                ],
            },
        ]
    }
}
