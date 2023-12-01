/** @format */

import { Component, OnInit } from '@angular/core'
import { FormControl, FormGroup, Validators } from '@angular/forms'
import { MessageService } from 'primeng/api'
import { Table } from 'primeng/table'
import { debounceTime, distinctUntilChanged, finalize } from 'rxjs'
import { AuthenticationService } from 'src/app/modules/auth/service/authentication.service'
import { Room } from 'src/app/modules/landlord/model/accomodation.model'
import { User } from 'src/app/modules/model/user.model'
import { UserManagementService } from '../../services/user-management.service'

@Component({
    selector: 'app-user-management',
    templateUrl: './user-management.component.html',
    styleUrls: ['./user-management.component.scss'],
    providers: [MessageService],
})
export class UserManagementComponent implements OnInit {
    userDialog: boolean = false
    deleteUserDialog: boolean = false
    users: any[] = []
    userSelected: any = {}
    selectedProducts: Room[] = []
    cols: any[] = []
    statuses: any[] = []
    rowsPerPageOptions = [5, 10, 20]
    user!: User | null
    dataLoading: boolean = false
    loading: boolean = false
    userResult: any

    userForm: FormGroup
    usernameLoading: boolean = false
    emailLoading: boolean = false
    oldEmail: any = ''
    oldUsename: any = ''


    constructor(private auth: AuthenticationService, private messageService: MessageService, private userManagementService: UserManagementService) {

        this.userForm = new FormGroup({
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

    ngOnInit() {
        this.user = this.auth.userValue
        this.getAllUsers().subscribe((response) => (this.users = response.data))

        this.userForm.get('firstname')?.valueChanges.subscribe(data => {
            this.userSelected.firstName = data
        })
        this.userForm.get('lastname')?.valueChanges.subscribe(data => {
            this.userSelected.lastName = data
        })
        this.userForm.get('phone')?.valueChanges.subscribe(data => {
            if (data) {
                this.userSelected.phone = data
                this.validatePhoneNumber(data)
            }
        })
        this.userForm.get('identifyNum')?.valueChanges.subscribe(data => {
            this.userSelected.identifyNum = data
        })
        this.userForm.get('email')?.valueChanges.pipe(
            debounceTime(500),
            distinctUntilChanged()
        ).subscribe(data => {
            if (data) {
                this.userSelected.email = data
                this.validateGmail(data)
                if (this.oldEmail !== this.userSelected.email && this.userForm.get('email')?.valid) {
                    this.checkDuplicatedEmail()
                }
            }
        })
        this.userForm.get('address')?.valueChanges.subscribe(data => {
            this.userSelected.address = data
        })
        this.userForm.get('status')?.valueChanges.subscribe(data => {
            this.userSelected.active = data
        })
        this.userForm.get('role')?.valueChanges.subscribe(data => {
            this.userSelected.role = data
        })
        this.userForm.get('userName')?.valueChanges.pipe(
            debounceTime(500),
            distinctUntilChanged()
        ).subscribe(data => {
            if (data) {
                this.userSelected.userName = data
                if (this.oldUsename !== this.userSelected.userName && this.userForm.get('userName')?.valid) {
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
                    this.userForm.get('userName')?.setErrors({duplicated: true})
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
                    this.userForm.get('email')?.setErrors({duplicated: true})
                }
            })
        ).subscribe(response => isDuplicated = response.data)
    }

    validateGmail(email: string) {
        const isValid = email.toLowerCase().match(
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        )
        if (!isValid) {
            this.userForm.get('email')?.setErrors({mailInvalid: true})
        } else {
            this.userForm.get('email')?.setErrors(null)
        }
    }

    validatePhoneNumber(phone: string) {
        const isValid = phone.toLowerCase().match(
            /(84|0[3|5|7|8|9])+([0-9]{8})\b/g
        )
        if (!isValid) {
            this.userForm.get('phone')?.setErrors({phoneInvalid: true})
        } else {
            this.userForm.get('phone')?.setErrors(null)
        }
    }

    resetPassword(user: any) {
        this.loading = true
        this.userManagementService.resetPassword(user.userId).pipe(
            finalize(() => {
                this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Reset mật khẩu thành công!', life: 3000 })
                this.getAllUsers().subscribe((response) => (this.users = response.data))
            })
        ).subscribe()
    }

    fillData() {
        this.oldEmail = this.userSelected.email
        this.oldUsename = this.userSelected.userName
        this.userForm.get('firstname')?.setValue(this.userSelected.firstName)
        this.userForm.get('lastname')?.setValue(this.userSelected.lastName)
        this.userForm.get('phone')?.setValue(this.userSelected.phone)
        this.userForm.get('identifyNum')?.setValue(this.userSelected.identifyNum)
        this.userForm.get('email')?.setValue(this.userSelected.email)
        this.userForm.get('address')?.setValue(this.userSelected.address)
        this.userForm.get('role')?.setValue(this.userSelected.role)
        this.userForm.get('status')?.setValue(this.userSelected.active)
        this.userForm.get('userName')?.setValue(this.userSelected.userName)
    }

    openNew() {
        this.userSelected = {}
        this.oldEmail = ''
        this.oldUsename = ''
        this.userForm.get('firstname')?.setValue(null)
        this.userForm.get('lastname')?.setValue(null)
        this.userForm.get('phone')?.setValue(null)
        this.userForm.get('identifyNum')?.setValue(null)
        this.userForm.get('email')?.setValue(null)
        this.userForm.get('address')?.setValue(null)
        this.userForm.get('userName')?.setValue(null)
        this.userForm.get('role')?.setValue('ROLE_LANDLORD')
        this.userForm.get('status')?.setValue(true)
        this.userDialog = true
    }

    onHideForm() {
        this.userForm.reset()
    }

    changeUserStatus(userSelected: any, status: boolean) {
        this.userSelected = { ...userSelected }
        this.userSelected.active = status
        this.loading = true
        let message: string
        if (status) {
            message = 'Mở khoá tài khoản thành công!'
        } else {
            message = 'Khoá tài khoản thành công!'
        }
        this.userManagementService
                .updateUser(this.userSelected)
                .pipe(
                    finalize(() => {
                        this.getAllUsers()
                            .pipe(
                                finalize(() => {
                                    this.messageService.add({ severity: 'success', summary: 'Successful', detail: message, life: 3000 })
                                }),
                            )
                            .subscribe((response) => (this.users = response.data))
                    }),
                )
                .subscribe((data) => console.log(data))
    }

    getAllUsers() {
        this.loading = true
        return this.userManagementService.getAllUsers().pipe(
            finalize(() => {
                this.loading = false
            }),
        )
    }

    editUser(userSelected: any) {
        this.userSelected = { ...userSelected }
        console.log(this.userSelected)
        this.fillData()
        this.userDialog = true
    }

    deleteUser(userSelected: any) {
        this.deleteUserDialog = true
        this.userSelected = { ...userSelected }
    }

    confirmDelete() {
        this.deleteUserDialog = false
    }

    hideDialog() {
        this.userDialog = false
        console.log(this.userSelected)
    }

    saveUser() {
        if (this.userForm.valid) {
            this.loading = true
            console.log(this.userSelected)
            let message: string
            if (this.userSelected.userId) {
                message = 'Chỉnh sửa thành công'
            } else {
                message = 'Thêm thành công'
            }
            this.userManagementService
                .updateUser(this.userSelected)
                .pipe(
                    finalize(() => {
                        this.getAllUsers()
                            .pipe(
                                finalize(() => {
                                    this.messageService.add({ severity: 'success', summary: 'Successful', detail: message, life: 3000 })
                                }),
                            )
                            .subscribe((response) => (this.users = response.data))
                    }),
                )
                .subscribe((data) => console.log(data))
            this.userDialog = false
        } else {
            this.userForm.markAllAsTouched()
            this.messageService.add({ severity: 'warn', summary: 'Cảnh báo', detail: 'Vui lòng điền đầy đủ!', life: 3000 })
        }
        
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains')
    }
}
