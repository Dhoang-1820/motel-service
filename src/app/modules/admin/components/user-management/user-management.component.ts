/** @format */

import { Component, OnInit } from '@angular/core'
import { MessageService } from 'primeng/api'
import { Table } from 'primeng/table'
import { finalize } from 'rxjs'
import { AuthenticationService } from 'src/app/modules/auth/service/authentication.service'
import { Room } from 'src/app/modules/landlord/model/accomodation.model'
import { User } from 'src/app/modules/model/user.model'
import { UserManagementService } from '../../services/user-management.service'
import { FormGroup, FormControl, Validators } from '@angular/forms'

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


    constructor(private auth: AuthenticationService, private messageService: MessageService, private userService: UserManagementService) {

        this.userForm = new FormGroup({
            firstname: new FormControl(this.userSelected?.firstName, [Validators.required]),
            lastname: new FormControl(this.userSelected?.lastName, [Validators.required]),
            phone: new FormControl(this.userSelected?.phone, []),
            identifyNum: new FormControl(this.userSelected?.identifyNum, []),
            email: new FormControl(this.userSelected?.email, [Validators.required]),
            address: new FormControl(this.userSelected?.address, []),
            status: new FormControl(this.userSelected?.active, [Validators.required]),
            role: new FormControl(this.userSelected?.role, [Validators.required]),
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
        this.userForm.get('email')?.valueChanges.subscribe(data => {
            if (data) {
                this.userSelected.email = data
                this.validateGmail(data)
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

    fillData() {
        this.userForm.get('firstname')?.setValue(this.userSelected.firstName)
        this.userForm.get('lastname')?.setValue(this.userSelected.lastName)
        this.userForm.get('phone')?.setValue(this.userSelected.phone)
        this.userForm.get('identifyNum')?.setValue(this.userSelected.identifyNum)
        this.userForm.get('email')?.setValue(this.userSelected.email)
        this.userForm.get('address')?.setValue(this.userSelected.address)
        this.userForm.get('role')?.setValue(this.userSelected.role)
        this.userForm.get('status')?.setValue(this.userSelected.active)
    }

    openNew() {
        this.userSelected = {}
        this.userForm.get('firstname')?.setValue(null)
        this.userForm.get('lastname')?.setValue(null)
        this.userForm.get('phone')?.setValue(null)
        this.userForm.get('identifyNum')?.setValue(null)
        this.userForm.get('email')?.setValue(null)
        this.userForm.get('address')?.setValue(null)
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
        this.saveUser()
    }

    getAllUsers() {
        this.loading = true
        return this.userService.getAllUsers().pipe(
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
        this.loading = true
        console.log(this.userSelected)
        let message: string
        if (this.userSelected.userId) {
            message = 'Chỉnh sửa thành công'
        } else {
            message = 'Thêm thành công'
        }
        this.userService
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
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains')
    }
}
