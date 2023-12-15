/** @format */

import { Component, OnInit } from '@angular/core'
import { FormGroup, FormControl, Validators } from '@angular/forms'
import { Router } from '@angular/router'
import { MessageService } from 'primeng/api'
import { finalize } from 'rxjs'
import { AuthenticationService } from 'src/app/modules/auth/service/authentication.service'
import { UserService } from 'src/app/modules/landlord/service/user.service'
import { User, ChangePassword } from 'src/app/modules/model/user.model'

@Component({
    selector: 'app-user-profile',
    templateUrl: './user-profile.component.html',
    styleUrls: ['./user-profile.component.scss'],
    providers: [MessageService],
})
export class UserProfileComponent implements OnInit {
    value: number = 0
    user?: User | null
    checked: boolean = false
    userResult: any
    loading: boolean = false
    saveLoading: boolean = false
    uploadedFiles!: any
    thumb!: any
    oldPassword!: any
    newPassword!: any
    confirmedPassword!: any
    submitted: boolean = false
    changePassResult: any
    passwordForm: FormGroup
    clonedBanks: { [s: string]: any } = {}
    bankInfo: { id?: number; bankNumber?: string; bankName?: string; accountOwner?: string; userId?: number } = {}
    addBankDialog: boolean = false
    updateBankLoading: boolean = false
    deleteBankDialog: boolean = false
    deleteBankLoading: boolean = false

    userForm: FormGroup

    constructor(
        public router: Router,
        private authenticationService: AuthenticationService,
        private userService: UserService,
        private messageService: MessageService,
    ) {
        this.authenticationService.user.subscribe((user) => (this.user = user))
        this.passwordForm = new FormGroup({
            currentPass: new FormControl('', [Validators.required]),
            newPass: new FormControl('', [Validators.required]),
            confirmedPass: new FormControl('', [Validators.required]),
        })

        this.userForm = new FormGroup({
            firstname: new FormControl(this.userResult?.firstName, [Validators.required]),
            lastname: new FormControl(this.userResult?.lastName, [Validators.required]),
            phone: new FormControl(this.userResult?.phone, []),
            identifyNum: new FormControl(this.userResult?.identifyNum, []),
            email: new FormControl(this.userResult?.email, [Validators.required]),
            address: new FormControl(this.userResult?.address, []),
        })
    }

    ngOnInit(): void {
        this.user = this.authenticationService.userValue
        if (!(this.user && this.user.roles === 'ROLE_POSTER')) {
            this.router.navigateByUrl('/auth')
        } else {
            this.getUser()
        }
        this.passwordForm.get('currentPass')?.valueChanges.subscribe((data) => {
            this.oldPassword = data
            if (this.newPassword && this.oldPassword === this.newPassword) {
                this.passwordForm.get('newPass')?.setErrors({ incorrect: true })
            } else {
                this.passwordForm.get('newPass')?.setErrors(null)
            }
        })
        this.passwordForm.get('newPass')?.valueChanges.subscribe((data) => {
            this.newPassword = data
            if (this.confirmedPassword && this.confirmedPassword === this.newPassword) {
                this.passwordForm.get('confirmedPass')?.setErrors(null)
            }
            if (this.oldPassword && this.oldPassword === this.newPassword) {
                this.passwordForm.get('newPass')?.setErrors({ incorrect: true })
            }
        })
        this.passwordForm.get('confirmedPass')?.valueChanges.subscribe((data) => {
            this.confirmedPassword = data
            if (this.confirmedPassword !== this.newPassword) {
                this.passwordForm.get('confirmedPass')?.setErrors({ incorrect: true })
            }
        })

        this.userForm.get('firstname')?.valueChanges.subscribe(data => {
            this.userResult.firstName = data
        })
        this.userForm.get('lastname')?.valueChanges.subscribe(data => {
            this.userResult.lastName = data
        })
        this.userForm.get('phone')?.valueChanges.subscribe(data => {
            if (data) {
                this.userResult.phone = data
                this.validatePhoneNumber(data)
            }
        })
        this.userForm.get('identifyNum')?.valueChanges.subscribe(data => {
            this.userResult.identifyNum = data
        })
        this.userForm.get('email')?.valueChanges.subscribe(data => {
            if (data) {
                this.userResult.email = data
                this.validateGmail(data)
            }
        })
        this.userForm.get('address')?.valueChanges.subscribe(data => {
            this.userResult.address = data
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

    onUpload(event: any) {
        if (event.target.files && event.target.files[0]) {
            this.uploadedFiles = event.target.files[0]
            var reader = new FileReader()
            reader.readAsDataURL(event.target.files[0])
            reader.onload = (event: any) => {
                this.thumb = event.target.result
            }
        }
    }

    fillData() {
        this.userForm.get('firstname')?.setValue(this.userResult.firstName)
        this.userForm.get('lastname')?.setValue(this.userResult.lastName)
        this.userForm.get('phone')?.setValue(this.userResult.phone)
        this.userForm.get('identifyNum')?.setValue(this.userResult.identifyNum)
        this.userForm.get('email')?.setValue(this.userResult.email)
        this.userForm.get('address')?.setValue(this.userResult.address)
    }

    getUser() {
        this.loading = true
        this.userService
            .getUserByUserId(this.user?.id)
            .pipe(
                finalize(() => {
                    this.loading = false
                    this.fillData()
                }),
            )
            .subscribe((result) => (this.userResult = result.data))
    }

    saveUser() {
        let request: FormData = new FormData()
        if (this.uploadedFiles) {
            request.append('file', this.uploadedFiles)
        }
        request.append('data', JSON.stringify(this.userResult))
        console.log(request)
        this.saveLoading = true
        this.submitted = true
        this.userService
            .saveUser(request)
            .pipe(
                finalize(() => {
                    this.saveLoading = false
                    this.messageService.add({ severity: 'success', summary: 'Thành công', detail: 'Chỉnh sửa thành công', life: 3000 })
                }),
            )
            .subscribe((data) => console.log(data))
    }

    // onChangeConfirmPass() {
    //   if (this.confirmedPassword !== this.newPassword) {
    //     this.passwordForm.get('confirmedPass')?.setErrors({'incorrect': true});
    //   }
    // }

    changePassword() {
        this.passwordForm.markAllAsTouched()
        let isValid = this.passwordForm.valid
        if (isValid) {
            let request: ChangePassword = new ChangePassword()
            request.userId = this.user?.id
            request.oldPassword = this.oldPassword
            request.newPassword = this.newPassword
            this.saveLoading = true
            this.userService
                .changePassword(request)
                .pipe(
                    finalize(() => {
                        if (!this.changePassResult.success) {
                            this.messageService.add({ severity: 'error', summary: 'Thất bại', detail: this.changePassResult.message, life: 3000 })
                        } else {
                            this.messageService.add({ severity: 'success', summary: 'Thành công', detail: 'Chỉnh sửa thành công', life: 3000 })
                        }
                        this.saveLoading = false
                    }),
                )
                .subscribe((data) => (this.changePassResult = data))
        }
    }

    onAddNewBank() {
        this.bankInfo = {}
        this.addBankDialog = true
    }

    saveBank() {
        this.bankInfo.userId = this.user?.id
        this.updateBankLoading = true
        let bankResponse: any
        this.userService
            .saveBank(this.bankInfo)
            .pipe(
                finalize(() => {
                    this.updateBankLoading = false
                    this.addBankDialog = false
                    this.userResult.bankAccounts.push(bankResponse)
                }),
            )
            .subscribe((response) => (bankResponse = response.data))
    }

    onRowEditInit(bank: any) {
        this.clonedBanks[bank.id as string] = { ...bank }
    }

    onRowDelete(bank: any) {
        this.bankInfo = { ...bank }
        this.deleteBankDialog = true
    }

    onRowEditSave(bank: any) {
        if (bank.accountOwner && bank.bankName && bank.bankNumber) {
            delete this.clonedBanks[bank.id as string]
            this.updateBankLoading = true
            this.userService
                .saveBank(bank)
                .pipe(
                    finalize(() => {
                        this.updateBankLoading = false
                    }),
                )
                .subscribe((response) => console.log(response))
        } else {
            this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Vui lòng điền đầy đủ thông tin' })
        }
    }

    confirmDeleteBank() {
        this.deleteBankLoading = true
        this.userService
            .deleteBank(this.bankInfo.id)
            .pipe(
                finalize(() => {
                    this.deleteBankDialog = false
                    console.log(this.bankInfo)
                    console.log(this.userResult.bankAccounts)
                    this.userResult.bankAccounts = this.userResult.bankAccounts.filter((item: any) => item.id !== this.bankInfo.id)
                    this.deleteBankLoading = false
                    this.bankInfo = {}
                }),
            )
            .subscribe((response) => console.log(response))
    }

    onRowEditCancel(bank: any, index: number) {
        this.userResult.bankAccounts[index] = this.clonedBanks[bank.id as string]
        delete this.clonedBanks[bank.id as string]
    }
}
