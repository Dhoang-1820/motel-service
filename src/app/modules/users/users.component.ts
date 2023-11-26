/** @format */

import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core'
import { Router } from '@angular/router'
import { MenuItem, MessageService } from 'primeng/api'
import { AuthenticationService } from '../auth/service/authentication.service'
import { LayoutService } from '../landlord/service/layout.service'
import { PostService } from '../landlord/service/post.service'
import { User } from '../model/user.model'
import { BookingService } from './services/booking.service'

@Component({
    selector: 'app-users',
    templateUrl: './users.component.html',
    styleUrls: ['./users.component.scss'],
    providers: [MessageService],
})
export class UsersComponent implements OnInit, AfterViewInit {
    @ViewChild('header') header!: ElementRef
    loading: boolean = false

    menuItems!: MenuItem[]

    user!: User | null
    isLogin: boolean = false

    constructor(
        public bookingService: BookingService,
        public layoutService: LayoutService,
        public router: Router,
        private auth: AuthenticationService,
    ) {}

    ngAfterViewInit(): void {
        // window.addEventListener('scroll', this.slideHeader)
    }

    slideHeader = () => {
        const scrolled = window.screenTop || window.scrollY
        this.header.nativeElement.style.transition = 'all 1s'
        if (scrolled >= 100) {
            this.header.nativeElement.style.position = 'fixed'
        } else {
            this.header.nativeElement.style.position = 'relative'
        }
    }

    ngOnInit(): void {
        this.user = this.auth.userValue
        if (this.user && this.user.roles === 'ROLE_POSTER') {
            this.isLogin = true
        } 
    }

    getMenuItems(): MenuItem[] {
        this.menuItems = [
            {
                label: 'Menu',
                items: [
                    {
                        label: 'Đăng nhập',
                        icon: 'pi pi-users',
                        visible: !this.isLogin,
                        routerLink: '/auth',
                    },
                    {
                        label: 'Thông tin cá nhân',
                        icon: 'pi pi-user',
                        routerLink: '/user-profile',
                    },
                    {
                        label: 'Quản lý tin đăng',
                        icon: 'pi pi-server',
                        routerLink: '/user-post',
                    },
                    {
                        label: 'Thông báo đặt phòng',
                        icon: 'pi pi-envelope',
                        routerLink: ['/user-booking'],
                    },
                    {
                        label: 'Đăng xuất',
                        icon: 'pi pi-sign-out',
                        visible: this.isLogin,
                        command: () => {
                            this.logout()
                        },
                    },
                ],
            },
        ]
        return this.menuItems
    }

    addEven(): void {
        window.addEventListener('scroll', this.slideHeader)
    }

    onShowMenu() {
        this.getMenuItems()
    }

    post() {
        if (!this.isLogin) {
            this.router.navigateByUrl('/auth')
        } else {
            this.router.navigateByUrl('/user-post')
        }
    }

    logout() {
        this.auth.logout()
    }
}
