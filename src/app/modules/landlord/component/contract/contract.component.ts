import { Component, OnInit } from '@angular/core'
import { FormControl, FormGroup, Validators } from '@angular/forms'
import * as moment from 'moment'
import { DurationInputArg1 } from 'moment'
import { MessageService } from 'primeng/api'
import { finalize, forkJoin } from 'rxjs'
import { AuthenticationService } from 'src/app/modules/auth/service/authentication.service'
import { AppConstant } from 'src/app/modules/common/Constants'
import { User } from 'src/app/modules/model/user.model'
import { AccomodationUtilities, Room, RoomDropdown } from '../../model/accomodation.model'
import { Contract } from '../../model/contract.model'
import { Tenant } from '../../model/tenant.model'
import { AccomodationService } from '../../service/accomodation.service'
import { ContractService } from '../../service/contract.service'
import { RoomService } from '../../service/room.service'
import { TenantService } from '../../service/tenant.service'

@Component({
    selector: 'app-contract',
    templateUrl: './contract.component.html',
    styleUrls: ['./contract.component.scss'],
    providers: [MessageService],
})
export class ContractComponent implements OnInit {
    addDialog: boolean = false
    deleteProductDialog: boolean = false
    cancelDepositDialog: boolean = false
    accomodations: any[] = []
    selectedAccomodation!: any
    contracts: Contract[] = []
    contract: Contract = {}
    cols: any[] = []
    rowsPerPageOptions = [5, 10, 20]
    user!: User | null
    dataLoading: boolean = false
    loading: boolean = false
    isNewTenant: boolean = false
    rooms: RoomDropdown[] = []
    tenants: Tenant[] = []
    tenantsDisplayed: Tenant[] = []
    services: AccomodationUtilities[] = []
    servicesDisplayed: AccomodationUtilities[] = []
    selectedServices: AccomodationUtilities[] = []
    contractForm!: FormGroup

    loadingChild: boolean = false
    isAddNew: boolean = false
    selectedTenants: any = []
    selectedTenant: Tenant | null = null

    roomPresent: any
    preRoom: Room = {};
    depositor: Tenant = {}

    constructor(
        private accomodationService: AccomodationService,
        private auth: AuthenticationService,
        private messageService: MessageService,
        private contractService: ContractService,
        private roomService: RoomService,
        private tenantService: TenantService,
    ) {
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
        this.contractForm.controls['endDate'].disable();
    }

    ngOnInit(): void {
        this.user = this.auth.userValue
        this.getDropdownAccomodation().subscribe((response) => (this.accomodations = response.data))

        this.contractForm.get('representative')?.valueChanges.subscribe((data) => {
            this.selectedTenant = data
            this.contract.representative = data
        })
        this.contractForm.get('startDate')?.valueChanges.subscribe((data) => {
            this.contract.startDate = data

            let startDate: moment.Moment = moment(this.contract.startDate)
            if (this.contract.duration) {
                let duration: DurationInputArg1 = this.contract.duration as DurationInputArg1
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
            if (this.contract.room) {
                this.checkIsRoomHasDeposit()
            }
        })
    }

    checkIsRoomHasDeposit() {
        this.loading = true
        let result: any ;
        this.roomService.checkRoomNotDeposit(this.contract.room?.id).pipe(
            finalize(() => {
                this.loading = false
                if (result.isBooked) {
                    this.depositor = result.depositor
                    let tenant =  this.selectedTenants.find((item: any) => item.id === this.depositor.id)
                    if (!tenant) {
                        this.selectedTenants.push(this.depositor)
                        this.tenantsDisplayed = this.tenantsDisplayed.filter(tenant => tenant.id !== this.depositor.id)
                    }
                } 
            })
        ).subscribe(response => result = response.data)
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

    onMoveTenant() {
        this.checkTenantDeposit()
    }

    onMoveBackTenant() {
        if (!this.selectedTenants.find((item: any) => item.id === this.selectedTenant?.id)) {
            this.contractForm.get('representative')?.setValue(null)
        }
        this.checkTenantDeposit()
    }

    onMoveBackService(value: any) {
        value.items.forEach((service: any) => service.quantity = 1)
    }

    openNew() {
        this.contract = {}
        this.addDialog = true
        this.isAddNew = true
        this.contractForm.get('startDate')?.setValue(moment(new Date).toDate())
        this.contractForm.get('endDate')?.setValue(moment(new Date).toDate())
        this.contractForm.get('recurrent')?.setValue(null)
        this.contractForm.get('deposit')?.setValue(null)
        this.contractForm.get('representative')?.setValue(null)
        this.contractForm.get('duration')?.setValue(null)
        this.contractForm.get('firstElectricNum')?.setValue(null)
        this.contractForm.get('firstWaterNum')?.setValue(null)
        this.contractForm.get('room')?.setValue(null)
    }

    initData() {
        forkJoin({
            rooms: this.getRoomByAccomodation(),
            contracts: this.getContractByAccomodation(),
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
            .subscribe((response) => {
                this.rooms = response.rooms.data
                this.contracts = response.contracts.data
                this.tenants = response.tenants.data
                this.services = response.services.data
            })
    }

    getRoomByAccomodation() {
        return this.roomService.getRoomNotRented(this.selectedAccomodation.id)
    }

    getTenantByAccomodation() {
        return this.tenantService.getTenantWithoutContract(this.selectedAccomodation.id)
    }

    getContractByAccomodation() {
        return this.contractService.getContractByAccomodationId(this.selectedAccomodation.id)
    }

    getAccomdationService() {
        return this.accomodationService.getAccomodationService(this.selectedAccomodation.id)
    }

    onChangeRoom() {
        this.contractForm.get('deposit')?.setValue(this.contract.room?.price)
    }

    hideDialog() {
        this.addDialog = false
    }

    onSelectAccomodation() {
        this.loading = true
        this.getContractByAccomodation()
            .pipe(
                finalize(() => {
                    this.initData()
                }),
            )
            .subscribe((response) => (this.contracts = response.data))
    }

    cancelDeposit(deposit: Contract) {
        this.cancelDepositDialog = true
        this.contract = { ...deposit }
    }

    getById(id: any, source: any[]) {
        let result = Object.assign({}, source.find(item => item.id === id))
        return result
    }

    checkTenantDeposit() {
        if (this.depositor.id) {
            let tenant =  this.selectedTenants.find((item: any) => item.id === this.depositor.id)
            if (!tenant) {
                this.contractForm.get('room')?.setErrors({roomBooked: true})
            } else if (this.contractForm.get('room')?.getError('roomBooked')){
                this.contractForm.get('room')?.setErrors(null);
            }
        }
    }

    filterService() {
        let service;
        this.contract.services?.forEach((item: any) => {
            service = this.getById(item.id, this.services)
            if (service) {
                service.quantity = item.quantity
                this.selectedServices.push(service);
                this.servicesDisplayed = this.servicesDisplayed.filter(service => service.id !== item.id)
            }
        })
    }

    filterTenant() {
        this.contract.tenants?.forEach((item: any) => {
            this.selectedTenants.push(item);
        })
    }

    editContract(contract: Contract) {
        this.isAddNew = false
        this.contract = { ...contract }
        this.contract.preRoom = contract.room?.id
        this.filterService()
        this.filterTenant()
        this.contractForm.get('startDate')?.setValue(moment(this.contract.startDate).toDate())
        this.contractForm.get('endDate')?.setValue(moment(this.contract.endDate).toDate())
        this.contractForm.get('recurrent')?.setValue(this.contract.recurrent)
        this.contractForm.get('deposit')?.setValue(this.contract.deposit)
        this.contractForm.get('firstElectricNum')?.setValue(this.contract.firstElectricNum)
        this.contractForm.get('firstWaterNum')?.setValue(this.contract.firstWaterNum)
        this.contractForm.get('representative')?.setValue(this.contract.representative)
        this.contractForm.get('duration')?.setValue(this.contract.duration)
        this.contractForm.get('room')?.setValue(this.contract.room)
        this.roomPresent = this.contract.room
        this.rooms.push(this.roomPresent)
        if (this.contract.representative) {
            this.selectedTenant = this.contract.representative
        }
        this.addDialog = true
    }

    onHideDialog() {
        if (this.roomPresent) {
            this.rooms = this.rooms.filter(item => item.id !== this.roomPresent.id)
        }
        this.selectedServices = []
        this.selectedTenants = []
        this.servicesDisplayed = JSON.parse(JSON.stringify(this.services))
        this.tenantsDisplayed = JSON.parse(JSON.stringify(this.tenants))
        this.depositor = {}
        this.contractForm.reset()
    }

    saveDeposit() {
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
                    this.initData()
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

    getStaticEletricName() {
        return AppConstant.ELECTRIC_PRICE_NAME
    }

    getStaticWaterName() {
        return AppConstant.WATER_PRICE_NAME
    }
}
