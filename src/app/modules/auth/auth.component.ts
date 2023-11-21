/** @format */

import { Component, OnInit } from '@angular/core'
import { LayoutService } from '../landlord/service/layout.service'
import { AuthenticationService } from './service/authentication.service'
import { User } from '../model/user.model'
import { catchError, finalize, of, throwError } from 'rxjs'
import { AppConstant } from '../common/Constants'
import { ActivatedRoute, Router } from '@angular/router'
import { NgxPermissionsService } from 'ngx-permissions'
import { MessageService } from 'primeng/api'

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

    user!: User

    constructor(
        private messageService: MessageService,
        private permissionsService: NgxPermissionsService,
        public layoutService: LayoutService,
        private authenticationService: AuthenticationService,
        private router: Router,
        private route: ActivatedRoute,
    ) {}

    ngOnInit(): void {}

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
                            this.router.navigateByUrl('/motel-service')
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
                    } else if (!isError){
                        this.messageService.add({ severity: 'error', summary: 'Thất bại', detail: 'Tài khoản bị khoá', life: 5000 })
                    }
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
}
