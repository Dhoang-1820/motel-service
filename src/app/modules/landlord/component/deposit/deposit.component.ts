import { Component, OnInit } from '@angular/core'
import { FormControl, FormGroup, Validators } from '@angular/forms'
import * as moment from 'moment'
import { MessageService } from 'primeng/api'
import { Table } from 'primeng/table'
import { finalize, forkJoin } from 'rxjs'
import { AuthenticationService } from 'src/app/modules/auth/service/authentication.service'
import { User } from 'src/app/modules/model/user.model'
import { Room } from '../../model/accomodation.model'
import { CancelDepositRequest, Deposit } from '../../model/deposit.model'
import { Tenant } from '../../model/tenant.model'
import { AccomodationService } from '../../service/accomodation.service'
import { DepositService } from '../../service/deposit.service'
import { RoomService } from '../../service/room.service'
import { TenantService } from '../../service/tenant.service'

@Component({
    selector: 'app-deposit',
    templateUrl: './deposit.component.html',
    styleUrls: ['./deposit.component.scss'],
    providers: [MessageService],
})
export class DepositComponent implements OnInit {
    addDialog: boolean = false
    deleteProductDialog: boolean = false
    cancelDepositDialog: boolean = false
    accomodations: any[] = []
    selectedAccomodation!: any
    deposits: Deposit[] = []
    deposit: Deposit = {}
    cols: any[] = []
    rowsPerPageOptions = [5, 10, 20]
    user!: User | null
    dataLoading: boolean = false
    loading: boolean = false
    rooms: Room[] = []
    tenants: Tenant[] = []
    depositForm: FormGroup

    loadingChild: boolean = false
    isAddNew: boolean = false;
    selectedTenant: Tenant = {}
    existedTenant: Set<any> = new Set()
    roomInvalids: unknown[] = [];
    isRepaid: boolean = false
    preRoom: any 
    isChooseExisted: boolean = false

    constructor(
        private accomodationService: AccomodationService,
        private auth: AuthenticationService,
        private messageService: MessageService,
        private depositService: DepositService,
        private roomService: RoomService,
        private tenantService: TenantService,
    ) {
        this.depositForm = new FormGroup({
            startDate: new FormControl(this.deposit.startDate, [Validators.required]),
            dueDate: new FormControl(this.deposit.dueDate, [Validators.required]),
            note: new FormControl(this.deposit.note, []),
            deposit: new FormControl(this.deposit.deposit, [Validators.required]),
            firstName: new FormControl(this.deposit.firstName, [Validators.required]),
            lastName: new FormControl(this.deposit.lastName, [Validators.required]),
            phone: new FormControl(this.deposit.phone, []),
            identifyNum: new FormControl(this.deposit.identifyNum, [Validators.required]),
            email: new FormControl(this.deposit.email, []),
            room: new FormControl(this.deposit.room, [Validators.required]),
            selectedTenant: new FormControl(this.selectedTenant, []),
        })
    }

    ngOnInit() {
        this.user = this.auth.userValue
        this.getDropdownAccomodation().subscribe((response) => (this.accomodations = response.data))

        this.depositForm.get('startDate')?.valueChanges.subscribe((data) => {
            this.deposit.startDate = data
        })
        this.depositForm.get('dueDate')?.valueChanges.subscribe((data) => {
            this.deposit.dueDate = data
            if (this.deposit.startDate) {
                let startDate = moment(this.deposit.startDate)
                if (data) {
                    let endDate = moment(this.deposit.dueDate)
                    if (!endDate.isAfter(startDate)) {
                        this.depositForm.get('dueDate')?.setErrors({dateInvalid: true})
                    } else if (!this.depositForm.get('dueDate')?.invalid) {
                        this.depositForm.get('dueDate')?.setErrors(null)
                    }
                }
            }
        })
        this.depositForm.get('note')?.valueChanges.subscribe((data) => {
            this.deposit.note = data
        })
        this.depositForm.get('deposit')?.valueChanges.subscribe((data) => {
            this.deposit.deposit = data
        })
        this.depositForm.get('firstName')?.valueChanges.subscribe((data) => {
            this.deposit.firstName = data
        })
        this.depositForm.get('identifyNum')?.valueChanges.subscribe((data) => {
            this.deposit.identifyNum = data
        })
        this.depositForm.get('lastName')?.valueChanges.subscribe((data) => {
            this.deposit.lastName = data
        })
        this.depositForm.get('phone')?.valueChanges.subscribe((data) => {
            this.deposit.phone = data
        })
        this.depositForm.get('email')?.valueChanges.subscribe((data) => {
            this.deposit.email = data
        })
        this.depositForm.get('room')?.valueChanges.subscribe((data) => {
            this.deposit.room = data
        })
        this.depositForm.get('selectedTenant')?.valueChanges.subscribe((data) => {
            this.selectedTenant = data
            if (data) {
                this.deposit.tenantId = data.id
            }
        })
    }

    onDialogHide() {
        this.depositForm.reset()
    }

    openNew() {
        this.deposit = {}
        this.preRoom = {}
        this.addDialog = true
        this.isAddNew = true
        this.depositForm.get('startDate')?.setValue(null)
        this.depositForm.get('dueDate')?.setValue(null)
        this.depositForm.get('note')?.setValue(null)
        this.depositForm.get('deposit')?.setValue(null)
        this.depositForm.get('firstName')?.setValue(null)
        this.depositForm.get('lastName')?.setValue(null)
        this.depositForm.get('identifyNum')?.setValue(null)
        this.depositForm.get('phone')?.setValue(null)
        this.depositForm.get('room')?.setValue(null)
        this.depositForm.get('email')?.setValue(null)
    }

    getDropdownAccomodation() {
        this.loading = true
        return this.accomodationService.getDropdownAccomodation(this.user?.id).pipe(
            finalize(() => {
                this.selectedAccomodation = this.accomodations[0]
                this.initData()
            }),
        )
    }

    onSwitch() {
        console.log(this.isChooseExisted)
        if (!this.isChooseExisted) {
            this.depositForm.get('firstName')?.setValue(null)
            this.depositForm.get('lastName')?.setValue(null)
            this.depositForm.get('identifyNum')?.setValue(null)
            this.depositForm.get('phone')?.setValue(null)
            this.depositForm.get('email')?.setValue(null)
            this.depositForm.get('selectedTenant')?.setValidators([Validators.required])
        } else {
            this.depositForm.get('firstName')?.setValue(this.selectedTenant.firstName)
            this.depositForm.get('lastName')?.setValue(this.selectedTenant.lastName)
            this.depositForm.get('identifyNum')?.setValue(this.selectedTenant.identifyNum)
            this.depositForm.get('phone')?.setValue(this.selectedTenant.phone)
            this.depositForm.get('email')?.setValue(this.selectedTenant.email)
            this.depositForm.get('selectedTenant')?.setValidators([])
        }
        this.depositForm.get('selectedTenant')?.updateValueAndValidity()
        this.depositForm.updateValueAndValidity()
    }

    onChangeTenant() {
        this.depositForm.get('identifyNum')?.setValue(this.selectedTenant.identifyNum)
        this.depositForm.get('phone')?.setValue(this.selectedTenant.phone)
        this.depositForm.get('email')?.setValue(this.selectedTenant.email)
    }

    getRoomHasDeposit() {
        this.roomInvalids = []
        this.deposits.forEach(item => {
            this.roomInvalids.push(item.room?.id) 
        })
    }

    initData() {
        forkJoin({
            rooms: this.getRoomByAccomodation(),
            deposits: this.getDepositByAccomodation(),
            tenants: this.getTenantByAccomodation()
        })
            .pipe(
                finalize(() => {
                    this.loading = false
                    this.getRoomHasDeposit()
                }),
            )
            .subscribe((response) => {
                this.rooms = response.rooms.data
                this.deposits = response.deposits.data
                this.tenants = response.tenants.data
            })
    }

    getRoomByAccomodation() {
        return this.roomService.getRoomNotDeposit(this.selectedAccomodation.id)
    }

    getDepositByAccomodation() {
        return this.depositService.getDepositByAccomodation(this.selectedAccomodation.id)
    }

    getTenantByAccomodation() {
        return this.tenantService.getTenantWithoutDeposit(this.selectedAccomodation.id)
    }

    onSelectAccomodation() {
        this.loading = true
        this.getDepositByAccomodation()
            .pipe(
                finalize(() => {
                    this.initData()
                }),
            )
            .subscribe((response) => (this.deposits = response.data))
    }

    editDeposit(deposit: Deposit) {
        this.isAddNew = false
        this.deposit = { ...deposit }
        this.preRoom = this.deposit.room?.id
        this.depositForm.get('startDate')?.setValue((moment(this.deposit.startDate)).toDate())
        this.depositForm.get('dueDate')?.setValue(moment(this.deposit.dueDate).toDate())
        this.depositForm.get('note')?.setValue(this.deposit.note)
        this.depositForm.get('deposit')?.setValue(this.deposit.deposit)
        this.depositForm.get('firstName')?.setValue(this.deposit.firstName)
        this.depositForm.get('lastName')?.setValue(this.deposit.lastName)
        this.depositForm.get('identifyNum')?.setValue(this.deposit.identifyNum)
        this.depositForm.get('phone')?.setValue(this.deposit.phone)
        this.depositForm.get('email')?.setValue(this.deposit.email)
        this.depositForm.get('room')?.setValue(this.deposit.room)
        this.addDialog = true
    }

    getEditingTenant(tenantId: any) {
        let result = this.tenants.find((item) => item.id === tenantId)
        return result
    }

    onChangeRoom() {
        console.log('this.preRoom', this.preRoom)
        if (this.roomInvalids.includes(this.deposit.room?.id) && this.preRoom !== this.deposit.room?.id) {
            this.depositForm.get('room')?.setErrors({roomInvalid: true})
        } else {
            if (!this.depositForm.get('room')?.invalid) {
                this.depositForm.get('room')?.setErrors(null)
            }
        }
    }

    cancelDeposit(deposit: Deposit) {
        this.cancelDepositDialog = true
        this.deposit = { ...deposit }
    }

    confirmCancelDeposit() {
        this.cancelDepositDialog = false
        let request: CancelDepositRequest = new CancelDepositRequest()
        request.depositId = this.deposit.id
        request.isRepaid = this.isRepaid
        this.loading = true
        this.depositService.cancelDeposit(request).pipe(
            finalize(() => {
                this.loading = false
                this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Huỷ đặt cọc thành công', life: 3000 })
            })
        ).subscribe()
    }

    hideDialog() {
        this.addDialog = false
    }

    saveDeposit() {
        if (!this.depositForm.invalid) {
            this.loading = true
            this.deposit.accomodationId = this.selectedAccomodation.id
            let message: string
            if (this.deposit.id) {
                message = 'Chỉnh sửa thành công'
            } else {
                message = 'Thêm thành công'
            }

            this.depositService
                .saveDeposit(this.deposit)
                .pipe(
                    finalize(() => {
                        this.loading = false
                        this.messageService.add({ severity: 'success', summary: 'Successful', detail: message, life: 3000 })
                        this.getRoomHasDeposit()
                    }),
                )
                .subscribe((response) => (this.deposits = response.data))
            this.addDialog = false
        } else {
            this.depositForm.markAllAsTouched()
        }
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains')
    }
}
