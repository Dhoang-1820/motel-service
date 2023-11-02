import { Component, OnInit } from '@angular/core'
import { FormControl, FormGroup, Validators } from '@angular/forms'
import * as moment from 'moment'
import { MessageService } from 'primeng/api'
import { Table } from 'primeng/table'
import { finalize, forkJoin } from 'rxjs'
import { AuthenticationService } from 'src/app/modules/auth/service/authentication.service'
import { User } from 'src/app/modules/model/user.model'
import { AccomodationUtilities, Room } from '../../model/accomodation.model'
import { CancelDepositRequest, Deposit } from '../../model/deposit.model'
import { Tenant } from '../../model/tenant.model'
import { AccomodationService } from '../../service/accomodation.service'
import { DepositService } from '../../service/deposit.service'
import { RoomService } from '../../service/room.service'
import { TenantService } from '../../service/tenant.service'
import { Contract } from '../../model/contract.model'
import { AppConstant } from 'src/app/modules/common/Constants'
import { ContractService } from '../../service/contract.service'

@Component({
    selector: 'app-deposit',
    templateUrl: './deposit.component.html',
    styleUrls: ['./deposit.component.scss'],
    providers: [MessageService],
})
export class DepositComponent implements OnInit {
    addDialog: boolean = false
    contractDialog: boolean = false
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
    roomPresent: any
    contractForm!: FormGroup
    contract: Contract = {}
    tenantsDisplayed: Tenant[] = []
    services: AccomodationUtilities[] = []
    servicesDisplayed: AccomodationUtilities[] = []
    selectedServices: AccomodationUtilities[] = []
    selectedTenants: any = []
    contractInfoLoading: boolean = false

    constructor(
        private accomodationService: AccomodationService,
        private auth: AuthenticationService,
        private messageService: MessageService,
        private depositService: DepositService,
        private roomService: RoomService,
        private tenantService: TenantService,
        private contractService: ContractService,
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

        this.contractForm = new FormGroup({
            startDate: new FormControl(this.contract.startDate, [Validators.required]),
            endDate: new FormControl(this.contract.endDate, [Validators.required]),
            recurrent: new FormControl(this.contract.recurrent, [Validators.required]),
            deposit: new FormControl(this.contract.deposit, [Validators.required]),
            representative: new FormControl(this.contract.representative, [Validators.required]),
            duration: new FormControl(this.contract.duration, [Validators.required]),
            firstElectricNum: new FormControl(this.contract.firstElectricNum, [Validators.required]),
            firstWaterNum: new FormControl(this.contract.firstWaterNum, [Validators.required]),
            room: new FormControl(this.contract.room, [Validators.required]),
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


        this.contractForm.get('representative')?.valueChanges.subscribe((data) => {
            this.selectedTenant = data
            this.contract.representative = data
        })
        this.contractForm.get('startDate')?.valueChanges.subscribe((data) => {
            this.contract.startDate = data

            let startDate: moment.Moment = moment(this.contract.startDate)
            if (this.contract.duration) {
                let duration: moment.DurationInputArg1 = this.contract.duration as moment.DurationInputArg1
                let endDate: moment.Moment = moment(startDate).add(duration, 'M');
                this.contractForm.get('endDate')?.setValue(endDate.toDate())
            } else {
                this.contractForm.get('endDate')?.setValue(startDate.toDate())
            }
        })
        this.contractForm.get('endDate')?.valueChanges.subscribe((data) => {
            this.contract.endDate = data
        })
        this.contractForm.get('firstElectricNum')?.valueChanges.subscribe((data) => {
            this.contract.firstElectricNum = data
        })
        this.contractForm.get('firstWaterNum')?.valueChanges.subscribe((data) => {
            this.contract.firstWaterNum = data
        })
        this.contractForm.get('recurrent')?.valueChanges.subscribe((data) => {
            this.contract.recurrent = data
        })
        this.contractForm.get('deposit')?.valueChanges.subscribe((data) => {
            this.contract.deposit = data
        })
        this.contractForm.get('duration')?.valueChanges.subscribe((data) => {
            this.contract.duration = data
            
            let startDate: moment.Moment = moment(this.contract.startDate)
            let endDate: moment.Moment = moment(startDate).add(data, 'M');
            this.contractForm.get('endDate')?.setValue(endDate.toDate())
        })
        this.contractForm.get('room')?.valueChanges.subscribe((data) => {
            this.contract.room = data
        })
    }

    onDialogHide() {
        if (this.roomPresent) {
            this.rooms = this.rooms.filter(item => item.id !== this.roomPresent.id)
        }
        this.depositForm.reset()
    }

    getAccomdationService() {
        return this.accomodationService.getAccomodationService(this.selectedAccomodation.id)
    }

    initContractData() {
        return forkJoin({
            rooms: this.getRoomByAccomodation(),
            tenants: this.getTenantByAccomodation(),
            services: this.getAccomdationService(),
        })
            .pipe(
                finalize(() => {
                    this.loading = false
                    this.servicesDisplayed = JSON.parse(JSON.stringify(this.services))
                    this.tenantsDisplayed = JSON.parse(JSON.stringify(this.tenants))
                }),
            )
            
    }


    onMoveTenant() {
    }

    onMoveBackTenant() {
        if (!this.selectedTenants.find((item: any) => item.id === this.selectedTenant?.id)) {
            this.contractForm.get('representative')?.setValue(null)
        }
    }

    onMoveBackService(value: any) {
        value.items.forEach((service: any) => service.quantity = 1)
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

    initData() {
        forkJoin({
            rooms: this.getRoomNoDepositByAccomodation(),
            deposits: this.getDepositByAccomodation(),
            tenants: this.getTenantWithoutDepositByAccomodation()
        })
            .pipe(
                finalize(() => {
                    this.loading = false
                }),
            )
            .subscribe((response) => {
                this.rooms = response.rooms.data
                this.deposits = response.deposits.data
                this.tenants = response.tenants.data
            })
    }

    getRoomNoDepositByAccomodation() {
        return this.roomService.getRoomNotDeposit(this.selectedAccomodation.id)
    }

    getDepositByAccomodation() {
        return this.depositService.getDepositByAccomodation(this.selectedAccomodation.id)
    }

    getTenantWithoutDepositByAccomodation() {
        return this.tenantService.getTenantWithoutDeposit(this.selectedAccomodation.id)
    }

    getTenantByAccomodation() {
        return this.tenantService.getTenantWithoutContract(this.selectedAccomodation.id)
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
        this.roomPresent = this.deposit.room
        this.rooms.push(this.roomPresent)
        this.addDialog = true
    }

    getEditingTenant(tenantId: any) {
        let result = this.tenants.find((item) => item.id === tenantId)
        return result
    }

    onChangeRoom() {
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

    getRoomByAccomodation() {
        return this.roomService.getRoomNotRented(this.selectedAccomodation.id)
    }

    findTenant(tenantId: any) {
        console.log(this.tenants)
        console.log(tenantId)
        return this.tenants.find(item => item.id === tenantId)
    }

    createContract(deposit: Deposit) {
        this.contractInfoLoading = true
        this.initContractData().pipe(
            finalize(() => {
                this.contract = {}
                this.contractInfoLoading = false
                this.contractDialog = true
                this.isAddNew = true
                let tenant = this.findTenant(deposit.tenantId)
                this.selectedTenants.push(tenant);
                this.contractForm.get('startDate')?.setValue(moment(new Date).toDate())
                this.contractForm.get('endDate')?.setValue(moment(new Date).toDate())
                this.contractForm.get('recurrent')?.setValue(null)
                this.contractForm.get('deposit')?.setValue(null)
                this.contractForm.get('representative')?.setValue(null)
                this.contractForm.get('duration')?.setValue(null)
                this.contractForm.get('firstElectricNum')?.setValue(null)
                this.contractForm.get('firstWaterNum')?.setValue(null)
                this.contractForm.get('room')?.setValue(deposit.room)
            })
        )
        .subscribe((response: any) => {
            this.rooms = response.rooms.data
            this.tenants = response.tenants.data
            this.services = response.services.data
        })
    }

    saveContract() {
        let errorFlag: boolean = false
         if (this.selectedTenants.length === 0) {
            errorFlag = true
            this.messageService.add({ severity: 'warn', summary: 'Cảnh báo', detail: 'Vui lòng chọn ít nhất một khách thuê', life: 3000 })
        } else if (this.selectedServices.length === 0) {
            errorFlag = true
            this.messageService.add({ severity: 'warn', summary: 'Cảnh báo', detail: 'Vui lòng chọn ít nhất một dịch vụ', life: 3000 })
        } else if (!this.contractForm.invalid) {
            this.loading = true
            let message: string
            if (this.contract.id) {
                message = 'Chỉnh sửa thành công'
            } else {
                message = 'Thêm thành công'
            }
            this.contract.tenants = this.selectedTenants
            this.contract.services = this.selectedServices
            this.contractService.saveContract(this.contract).pipe(
                finalize(() => {
                    // this.initData()
                    this.contract = {}
                    this.messageService.add({ severity: 'success', summary: 'Thành công', detail: message, life: 3000 })
                })
            ).subscribe()
            errorFlag = false
        } else {
            this.contractForm.markAllAsTouched()
        }
        if (!errorFlag) {
            this.addDialog = false
        }
    }

    onDialogContractHide() {
        this.selectedTenants = []
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
                        this.messageService.add({ severity: 'success', summary: 'Successful', detail: message, life: 3000 })
                        this.initData()
                    }),
                )
                .subscribe()
            this.addDialog = false
        } else {
            this.depositForm.markAllAsTouched()
        }
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains')
    }

    getStaticEletricName() {
        return AppConstant.ELECTRIC_PRICE_NAME
    }

    getStaticWaterName() {
        return AppConstant.WATER_PRICE_NAME
    }
}

