import { Component, OnInit } from '@angular/core'
import { FormControl, FormGroup, Validators } from '@angular/forms'
import * as moment from 'moment'
import { MessageService } from 'primeng/api'
import { Table } from 'primeng/table'
import { debounceTime, distinctUntilChanged, finalize, forkJoin } from 'rxjs'
import { AuthenticationService } from 'src/app/modules/auth/service/authentication.service'
import { User } from 'src/app/modules/model/user.model'
import { Room } from '../../model/accomodation.model'
import { Tenant } from '../../model/tenant.model'
import { AccomodationService } from '../../service/accomodation.service'
import { RoomService } from '../../service/room.service'
import { TenantService } from '../../service/tenant.service'
import { AppConstant } from 'src/app/modules/common/Constants'

@Component({
    selector: 'app-tenants',
    templateUrl: './tenants.component.html',
    styleUrls: ['./tenants.component.scss'],
    providers: [MessageService],
})
export class TenantsComponent implements OnInit {
    selectedTenant: any
    dataLoading: boolean = false
    user!: User | null
    accomodations: any[] = []
    loading: boolean = false
    tentant: Tenant = {}
    tentants: Tenant[] = []
    cols: any[] = []
    tenantDialog: boolean = false
    deleteTenantDialog: boolean = false
    selectedAccomodation!: any
    rooms: Room[] = []
    selectedRoom: any
    tenantForm: FormGroup
    returnDate: Date | undefined = moment(Date.now()).toDate()
    gender: any = AppConstant.GENDER
    isValidating: boolean = false
    emailLoading: boolean = false
    phoneLoading: boolean = false
    oldIdentifyNum: any = ''
    oldEmail: any = ''
    oldPhone: any = ''

    constructor(
        private messageService: MessageService,
        private auth: AuthenticationService,
        private accomodationService: AccomodationService,
        private roomService: RoomService,
        private tenantService: TenantService,
    ) {
        this.tenantForm = new FormGroup({
            firstName: new FormControl(this.tentant.firstName, [Validators.required]),
            lastName: new FormControl(this.tentant.lastName, [Validators.required]),
            startDate: new FormControl(this.tentant.startDate, []),
            gender: new FormControl(this.tentant.gender, []),
            identifyNum: new FormControl(this.tentant.identifyNum, [Validators.required]),
            phone: new FormControl(this.tentant.phone, [Validators.required]),
            email: new FormControl(this.tentant.email, [Validators.required]),
        })
    }

    ngOnInit(): void {
        this.user = this.auth.userValue
        this.getDropdownAccomodation()
        this.tenantForm.get('firstName')?.valueChanges.subscribe((data) => (this.tentant.firstName = data))
        this.tenantForm.get('lastName')?.valueChanges.subscribe((data) => (this.tentant.lastName = data))
        this.tenantForm.get('startDate')?.valueChanges.subscribe((data) => (this.tentant.startDate = data))
        this.tenantForm.get('identifyNum')?.valueChanges.pipe(
            debounceTime(500),
            distinctUntilChanged()
        ).subscribe((data) => {
            if (data) {
                this.tentant.identifyNum = data
                if (this.oldIdentifyNum !== this.tentant.identifyNum) {
                    this.checkDuplicatedIdentify()
                }
            }
        })
        this.tenantForm.get('phone')?.valueChanges.subscribe((data) => {
            if (data) {
                this.validatePhoneNumber(data)
                this.tentant.phone = data
                if (this.oldPhone !== this.tentant.phone && this.tenantForm.get('phone')?.valid) {
                    this.checkDuplicatedPhone()
                }
            }
        })
        this.tenantForm.get('email')?.valueChanges.subscribe((data) => {
            if (data) {
                this.validateGmail(data)
                this.tentant.email = data
                if (this.oldEmail !== this.tentant.email && this.tenantForm.get('email')?.valid) {
                    this.checkDuplicatedEmail()
                }
            }
        })
        this.tenantForm.get('gender')?.valueChanges.subscribe((data) => {
            if (data) {
                (this.tentant.gender = data.key)
            }
        })
    }

    getDropdownAccomodation() {
        this.loading = true
        this.accomodationService
            .getDropdownAccomodation(this.user?.id)
            .pipe(
                finalize(() => {
                    if (this.accomodations.length > 0) {
                        this.selectedAccomodation = this.accomodations[0]
                        this.getRoomAndTenantData()
                    } else {
                        this.loading = false
                        this.messageService.add({ severity: 'warn', summary: 'Cảnh báo', detail: 'Vui lòng tạo khu/nhà trọ trước!', life: 3000 })
                    }
                }),
            )
            .subscribe((response) => (this.accomodations = response.data))
    }

    validatePhoneNumber(phone: string) {
        const isValid = phone.toLowerCase().match(
            /(84|0[3|5|7|8|9])+([0-9]{8})\b/g
        )
        if (!isValid) {
            this.tenantForm.get('phone')?.setErrors({phoneInvalid: true})
        } else {
            this.tenantForm.get('phone')?.setErrors(null)
        }
    }

    onHideDialog() {
        this.tenantForm.reset()
    }

    checkDuplicatedIdentify() {
        let isDuplicated = false;
        this.isValidating = true
        this.tenantService.checkDuplicatedIdentify(this.tentant.identifyNum).pipe(
            finalize(() => {
                this.isValidating = false
                if (isDuplicated) {
                    this.tenantForm.get('identifyNum')?.setErrors({duplicated: true})
                }
            })
        ).subscribe(response => isDuplicated = response.data)
    }

    checkDuplicatedEmail() {
        let isDuplicated = false;
        this.emailLoading = true
        this.tenantService.checkDuplicatedEmail(this.tentant.email).pipe(
            finalize(() => {
                this.emailLoading = false
                if (isDuplicated) {
                    this.tenantForm.get('email')?.setErrors({duplicated: true})
                }
            })
        ).subscribe(response => isDuplicated = response.data)
    }

    checkDuplicatedPhone() {
        let isDuplicated = false;
        this.phoneLoading = true
        this.tenantService.checkDuplicatedPhone(this.tentant.phone).pipe(
            finalize(() => {
                this.phoneLoading = false
                if (isDuplicated) {
                    this.tenantForm.get('phone')?.setErrors({duplicated: true})
                }
            })
        ).subscribe(response => isDuplicated = response.data)
    }

    openNew() {
        this.tentant = {}
        this.oldIdentifyNum = ''
        this.oldEmail = ''
        this.oldPhone = ''
        this.tenantForm.get('firstName')?.setValue(null)
        this.tenantForm.get('lastName')?.setValue(null)
        this.tenantForm.get('startDate')?.setValue(null)
        this.tenantForm.get('identifyNum')?.setValue(null)
        this.tenantForm.get('phone')?.setValue(null)
        this.tenantForm.get('email')?.setValue(null)
        this.tenantForm.get('gender')?.setValue({key: 'UNKNOWN', value: 'Chưa biết'})
        this.tenantDialog = true
    }

    getRoomByAccomodation() {
        return this.roomService.getRoomDropDown(this.selectedAccomodation.id).pipe(
            finalize(() => {
                this.loading = false
            }),
        )
    }

    getTenantByAccomodation() {
        return this.tenantService.getTenantByAccomodation(this.selectedAccomodation.id).pipe(
            finalize(() => {
                this.loading = false
            }),
        )
    }

    getRoomAndTenantData() {
        forkJoin({
            rooms: this.getRoomByAccomodation(),
            tenants: this.getTenantByAccomodation(),
        })
            .pipe(
                finalize(() => {
                    this.loading = false
                }),
            )
            .subscribe((response) => {
                this.rooms = response.rooms.data
                this.tentants = response.tenants.data
            })
    }

    onSelectAccomodation() {
        this.loading = true
        this.getRoomAndTenantData()
    }

    editTenant(tentant: Tenant) {
        this.tentant = { ...tentant }
        this.oldIdentifyNum = tentant.identifyNum
        this.oldEmail = tentant.email
        this.oldPhone = tentant.phone
        this.tenantForm.get('firstName')?.setValue(tentant.firstName)
        this.tenantForm.get('lastName')?.setValue(tentant.lastName)
        if (tentant.startDate) {
            this.tenantForm.get('startDate')?.setValue(moment(tentant.startDate).toDate())
        } else {
            this.tenantForm.get('startDate')?.setValue(moment(new Date()).toDate())
        }
        this.tenantForm.get('identifyNum')?.setValue(tentant.identifyNum)
        this.tenantForm.get('email')?.setValue(tentant.email)
        this.tenantForm.get('phone')?.setValue(tentant.phone)
        
        let gender = this.gender.find((item: any) => item.key === this.tentant.gender)
        if (gender) {
            this.tenantForm.get('gender')?.setValue(gender)
        } else {
            this.tenantForm.get('gender')?.setValue({key: 'UNKNOWN', value: 'Chưa biết'})
        }
        this.tenantDialog = true
    }

    validateGmail(email: string) {
        const isValid = email.toLowerCase().match(
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        )
        if (!isValid) {
            this.tenantForm.get('email')?.setErrors({mailInvalid: true})
        } else {
            this.tenantForm.get('email')?.setErrors(null)
        }
    }

    hideDialog() {
        this.tenantDialog = false
    }

    saveTenant() {
        this.loading = true
        let message: string
        if (this.tentant.id) {
            message = 'Chỉnh sửa thành công'
        } else {
            message = 'Thêm thành công'
        }
        this.tenantService
            .saveTenant(this.tentant)
            .pipe(
                finalize(() => {
                    this.messageService.add({ severity: 'success', summary: 'Successful', detail: message, life: 3000 })
                    this.getRoomAndTenantData()
                }),
            )
            .subscribe((data) => console.log(data))
        this.tenantDialog = false
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains')
    }
}
