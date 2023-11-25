/** @format */

import { Component, OnInit } from '@angular/core'
import { LayoutService } from '../landlord/service/layout.service'
import { AuthenticationService } from './service/authentication.service'
import { User } from '../model/user.model'
import { catchError, debounceTime, finalize, of, throwError } from 'rxjs'
import { AppConstant } from '../common/Constants'
import { ActivatedRoute, Router } from '@angular/router'
import { NgxPermissionsService } from 'ngx-permissions'
import { MessageService } from 'primeng/api'
import { FormControl, FormGroup, Validators } from '@angular/forms'
import { UserService } from '../landlord/service/user.service'

@Component({
    selector: 'app-auth',
    templateUrl: './auth.component.html',
    styleUrls: ['./auth.component.scss'],
    providers: [MessageService],
})
export class AuthComponent implements OnInit {
    valCheck: string[] = ['remember']
    loading = false
    username!: string
    password!: string
    userRole!: string | undefined
    rememberLogin: boolean = false
    isLogin: boolean = true

    user!: User

    signupForm: FormGroup
    signUpRequest: any = {}
    isValidating: boolean = false
    isValidateUserName: boolean = false

    constructor(
        private messageService: MessageService,
        private permissionsService: NgxPermissionsService,
        public layoutService: LayoutService,
        private authenticationService: AuthenticationService,
        private router: Router,
        private userService: UserService,
        private route: ActivatedRoute,
    ) {
        this.signupForm = new FormGroup({
            firstname: new FormControl(this.signUpRequest.firstname, [Validators.required]),
            lastname: new FormControl(this.signUpRequest.lastname, [Validators.required]),
            email: new FormControl(this.signUpRequest.email, [Validators.required]),
            phone: new FormControl(this.signUpRequest.phone, [Validators.required]),
            username: new FormControl(this.signUpRequest.userName, [Validators.required]),
            password: new FormControl(this.signUpRequest.password, [Validators.required]),
            rePassword: new FormControl(this.signUpRequest.password, [Validators.required]),
        })
    }

    ngOnInit(): void {
        this.signupForm.get('firstname')?.valueChanges.subscribe((data) => {
            this.signUpRequest.firstname = data
        })
        this.signupForm.get('lastname')?.valueChanges.subscribe((data) => {
            this.signUpRequest.lastname = data
        })
        this.signupForm
            .get('email')
            ?.valueChanges.pipe(debounceTime(200))
            .subscribe((data) => {
                if (data) {
                    this.signUpRequest.email = data
                    this.validateGmail(data)
                    if (!this.signupForm.get('email')?.invalid) {
                        this.checkDuplicated()
                    }
                }
            })
        this.signupForm.get('phone')?.valueChanges.subscribe((data) => {
            if (data) {
                this.signUpRequest.phone = data
                this.validatePhoneNumber(data)
            }
        })
        this.signupForm
            .get('username')
            ?.valueChanges.pipe(debounceTime(200))
            .subscribe((data) => {
                if (data) {
                    this.signUpRequest.userName = data
                    this.checkDuplicatedUsername()
                }
            })
        this.signupForm.get('password')?.valueChanges.subscribe((data) => {
            this.signUpRequest.password = data
        })
        this.signupForm.get('rePassword')?.valueChanges.subscribe((data) => {
            if (data) {
                this.signUpRequest.rePassword = data
                if (this.signUpRequest.rePassword !== this.signUpRequest.password) {
                    this.signupForm.get('rePassword')?.setErrors({ notMatch: true })
                }
            }
        })
    }

    checkDuplicated() {
        let isDuplicated = false
        this.isValidating = true
        this.userService
            .checkDuplicated(this.signUpRequest.email)
            .pipe(
                finalize(() => {
                    this.isValidating = false
                    if (isDuplicated) {
                        this.signupForm.get('email')?.setErrors({ duplicated: true })
                    }
                }),
            )
            .subscribe((response) => (isDuplicated = response.data))
    }

    checkDuplicatedUsername() {
        let isDuplicated = false
        this.isValidateUserName = true
        this.userService
            .checkDuplicatedUsername(this.signUpRequest.userName)
            .pipe(
                finalize(() => {
                    this.isValidateUserName = false
                    if (isDuplicated) {
                        this.signupForm.get('username')?.setErrors({ duplicated: true })
                    }
                }),
            )
            .subscribe((response) => (isDuplicated = response.data))
    }

    validateGmail(email: string) {
        const isValid = email
            .toLowerCase()
            .match(
                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            )
        if (!isValid) {
            this.signupForm.get('email')?.setErrors({ mailInvalid: true })
        } else {
            this.signupForm.get('email')?.setErrors(null)
        }
    }

    validatePhoneNumber(phone: string) {
        const isValid = phone.toLowerCase().match(/(84|0[3|5|7|8|9])+([0-9]{8})\b/g)
        if (!isValid) {
            this.signupForm.get('phone')?.setErrors({ phoneInvalid: true })
        } else {
            this.signupForm.get('phone')?.setErrors(null)
        }
    }

    switchSignup() {
        this.isLogin = false
        this.signupForm.get('firstname')?.setValue(null)
        this.signupForm.get('lastname')?.setValue(null)
        this.signupForm.get('email')?.setValue(null)
        this.signupForm.get('username')?.setValue(null)
        this.signupForm.get('password')?.setValue(null)
        this.signupForm.get('rePassword')?.setValue(null)
    }

    login() {
        let isError: boolean = false
        this.loading = true
        this.authenticationService
            .login(this.username, this.password)
            .pipe(
                finalize(() => {
                    this.loading = false
                    console.log(this.user)
                    if (this.user && this.user.isActive) {
                        this.userRole = this.user.roles
                        if (this.userRole === AppConstant.ROLE_LANDLORD) {
                            this.router.navigateByUrl('/motel-management/accomodation')
                        } else if (this.userRole === AppConstant.ROLE_ADMIN) {
                            this.router.navigateByUrl('/administration/user-management')
                        } else {
                            this.router.navigateByUrl('/')
                        }
                        if (this.user.roles) {
                            const permissions = [this.user.roles]
                            this.permissionsService.loadPermissions(permissions)
                        }
                        if (this.rememberLogin) {
                            localStorage.setItem('user', JSON.stringify(this.user))
                        } else {
                            sessionStorage.setItem('user', JSON.stringify(this.user))
                        }
                    } else if (!isError) {
                        this.messageService.add({ severity: 'error', summary: 'Thất bại', detail: 'Tài khoản bị khoá', life: 5000 })
                    } 
                    // else {
                    //     this.messageService.add({ severity: 'success', summary: 'Thành công', detail: 'Đăng nhập thành công', life: 3000 })
                    // }
                }),
                catchError((err) => {
                    isError = true
                    this.loading = false
                    this.messageService.add({ severity: 'error', summary: 'Thất bại', detail: err.error.message, life: 5000 })
                    return throwError(() => err)
                }),
            )
            .subscribe((data) => (this.user = data))
    }

    signUp() {
        if (!this.signupForm.invalid) {
            this.loading = true
            this.signUpRequest.roles = 'poster'
            this.userService
                .signUp(this.signUpRequest)
                .pipe(
                    finalize(() => {
                        this.loading = false
                        this.messageService.add({ severity: 'success', summary: 'Thành công', detail: 'Đăng ký thành công', life: 3000 })
                    }),
                )
                .subscribe()
        } else {
            this.signupForm.markAllAsTouched()
        }
    }
}
