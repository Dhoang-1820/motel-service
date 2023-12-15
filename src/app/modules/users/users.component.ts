/** @format */

import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core'
import { Router } from '@angular/router'
import { MenuItem, MessageService } from 'primeng/api'
import { AuthenticationService } from '../auth/service/authentication.service'
import { LayoutService } from '../landlord/service/layout.service'
import { PostService } from '../landlord/service/post.service'
import { User } from '../model/user.model'
import { BookingService } from './services/booking.service'
import { FormControl, FormGroup, Validators } from '@angular/forms'
import { debounceTime, distinctUntilChanged, finalize } from 'rxjs'
import { UserManagementService } from '../admin/services/user-management.service'

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
    registerDialog: boolean = false
    registerForm: FormGroup
    userSelected: any = {}
    submitLoading: boolean = false
    usernameLoading: boolean = false
    emailLoading: boolean = false

    constructor(
        public bookingService: BookingService,
        public layoutService: LayoutService,
        public router: Router,
        private auth: AuthenticationService,
        private userManagementService: UserManagementService,
        private messageService: MessageService
    ) {
        this.registerForm = new FormGroup({
            firstname: new FormControl(this.userSelected?.firstName, [Validators.required]),
            lastname: new FormControl(this.userSelected?.lastName, [Validators.required]),
            phone: new FormControl(this.userSelected?.phone, []),
            identifyNum: new FormControl(this.userSelected?.identifyNum, []),
            email: new FormControl(this.userSelected?.email, [Validators.required]),
            address: new FormControl(this.userSelected?.address, []),
            status: new FormControl(this.userSelected?.active, [Validators.required]),
            role: new FormControl(this.userSelected?.role, [Validators.required]),
            userName: new FormControl(this.userSelected?.userName, [Validators.required]),
        })
    }

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

        this.registerForm.get('firstname')?.valueChanges.subscribe(data => {
            this.userSelected.firstName = data
        })
        this.registerForm.get('lastname')?.valueChanges.subscribe(data => {
            this.userSelected.lastName = data
        })
        this.registerForm.get('phone')?.valueChanges.subscribe(data => {
            if (data) {
                this.userSelected.phone = data
                this.validatePhoneNumber(data)
            }
        })
        this.registerForm.get('identifyNum')?.valueChanges.subscribe(data => {
            this.userSelected.identifyNum = data
        })
        this.registerForm.get('email')?.valueChanges.pipe(
            debounceTime(500),
            distinctUntilChanged()
        ).subscribe(data => {
            if (data) {
                this.userSelected.email = data
                this.validateGmail(data)
                if (this.registerForm.get('email')?.valid) {
                    this.checkDuplicatedEmail()
                }
            }
        })
        this.registerForm.get('address')?.valueChanges.subscribe(data => {
            this.userSelected.address = data
        })
        this.registerForm.get('status')?.valueChanges.subscribe(data => {
            this.userSelected.status = data
        })
        this.registerForm.get('role')?.valueChanges.subscribe(data => {
            this.userSelected.role = data
        })
        this.registerForm.get('userName')?.valueChanges.pipe(
            debounceTime(500),
            distinctUntilChanged()
        ).subscribe(data => {
            if (data) {
                this.userSelected.userName = data
                if (this.registerForm.get('userName')?.valid) {
                    this.checkDuplicatedUsername()
                }
            }
        })
    }

    checkDuplicatedUsername() {
        let isDuplicated = false;
        this.usernameLoading = true
        this.userManagementService.checkDuplicatedUsername(this.userSelected.userName).pipe(
            finalize(() => {
                this.usernameLoading = false
                if (isDuplicated) {
                    this.registerForm.get('userName')?.setErrors({duplicated: true})
                }
            })
        ).subscribe(response => isDuplicated = response.data)
    }

    checkDuplicatedEmail() {
        let isDuplicated = false;
        this.emailLoading = true
        this.userManagementService.checkDuplicatedEmail(this.userSelected.email).pipe(
            finalize(() => {
                this.emailLoading = false
                if (isDuplicated) {
                    this.registerForm.get('email')?.setErrors({duplicated: true})
                }
            })
        ).subscribe(response => isDuplicated = response.data)
    }

    validateGmail(email: string) {
        const isValid = email.toLowerCase().match(
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        )
        if (!isValid) {
            this.registerForm.get('email')?.setErrors({mailInvalid: true})
        } else {
            this.registerForm.get('email')?.setErrors(null)
        }
    }

    validatePhoneNumber(phone: string) {
        const isValid = phone.toLowerCase().match(
            /(84|0[3|5|7|8|9])+([0-9]{8})\b/g
        )
        if (!isValid) {
            this.registerForm.get('phone')?.setErrors({phoneInvalid: true})
        } else {
            this.registerForm.get('phone')?.setErrors(null)
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

    openRegisterMemberDialog() {
        this.registerDialog = true
        this.userSelected = {}
        this.registerForm.get('firstname')?.setValue(null)
        this.registerForm.get('lastname')?.setValue(null)
        this.registerForm.get('phone')?.setValue(null)
        this.registerForm.get('identifyNum')?.setValue(null)
        this.registerForm.get('email')?.setValue(null)
        this.registerForm.get('address')?.setValue(null)
        this.registerForm.get('userName')?.setValue(null)
        this.registerForm.get('role')?.setValue('ROLE_LANDLORD')
        this.registerForm.get('status')?.setValue('REGISTERED')
    }

    saveRegister() {
        if (this.registerForm.valid) {
            this.loading = true
            console.log(this.userSelected)
            let message: string = 'Thêm thành công'
            this.userManagementService
                .updateUser(this.userSelected)
                .pipe(
                    finalize(() => {
                        this.loading = false
                        this.messageService.add({ severity: 'success', summary: 'Thành công', detail: message, life: 3000 })
                    }),
                )
                .subscribe((data) => console.log(data))
            this.registerDialog = false
        } else {
            this.registerForm.markAllAsTouched()
            this.messageService.add({ severity: 'warn', summary: 'Cảnh báo', detail: 'Vui lòng điền đầy đủ!', life: 3000 })
        }
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
