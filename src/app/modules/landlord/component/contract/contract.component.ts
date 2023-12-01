import { Component, OnInit } from '@angular/core'
import { FormControl, FormGroup, Validators } from '@angular/forms'
import * as moment from 'moment'
import { DurationInputArg1 } from 'moment'
import { MessageService } from 'primeng/api'
import { debounceTime, distinctUntilChanged, finalize, forkJoin } from 'rxjs'
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
import { DocumentCreator } from '../../service/docx.service'
import { Packer } from 'docx'
import * as saveAs from 'file-saver'

@Component({
    selector: 'app-contract',
    templateUrl: './contract.component.html',
    styleUrls: ['./contract.component.scss'],
    providers: [MessageService],
})
export class ContractComponent implements OnInit {
    addDialog: boolean = false
    deleteContractDialog: boolean = false
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
    selectedTenants: any[] = []
    selectedTenant: Tenant | null = null

    roomPresent: any
    preRoom: Room = {};
    depositor: Tenant = {}
    tentant: Tenant = {}
    tenantForm: FormGroup
    tenantDialog: boolean = false
    gender: any = AppConstant.GENDER
    durations: {value: number, display: string}[] = [{value: 6, display: '6 tháng'}, {value: 12, display: '12 tháng'}]
    oldDeposit: number = 0
    nextMonth!: Date
    dayStayedMoney!: number
    isValidating: boolean = false
    oldIdentifyNum: any = ''

    constructor(
        private accomodationService: AccomodationService,
        private auth: AuthenticationService,
        private messageService: MessageService,
        private contractService: ContractService,
        private roomService: RoomService,
        private tenantService: TenantService,
        private documentCreator: DocumentCreator
    ) {
        this.contractForm = new FormGroup({
            startDate: new FormControl(this.contract.startDate, [Validators.required]),
            endDate: new FormControl(this.contract.endDate, [Validators.required]),
            deposit: new FormControl(this.contract.deposit, [Validators.required]),
            representative: new FormControl(this.contract.representative, [Validators.required]),
            duration: new FormControl(this.contract.duration, [Validators.required]),
            firstElectricNum: new FormControl(this.contract.firstElectricNum, [Validators.required]),
            firstWaterNum: new FormControl(this.contract.firstWaterNum, [Validators.required]),
            room: new FormControl(this.contract.room, [Validators.required]),
            dayNumber: new FormControl(this.contract.dayStayedBefore, [Validators.required]),
            firstTotalPayment: new FormControl(this.contract.firstComePayment, [Validators.required]),
            holdRoomMoney: new FormControl(this.contract.keepRoomDeposit, []),
        })
        this.contractForm.controls['endDate'].disable();

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
        this.getDropdownAccomodation().subscribe((response) => (this.accomodations = response.data))

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
                    this.checkDuplicated()
                }
            }
        })
        this.tenantForm.get('phone')?.valueChanges.subscribe((data) => {
            if (data) {
                this.validatePhoneNumber(data)
                this.tentant.phone = data
            }
        })
        this.tenantForm.get('email')?.valueChanges.subscribe((data) => {
            if (data) {
                this.validateGmail(data)
                this.tentant.email = data
            }
        })
        this.tenantForm.get('gender')?.valueChanges.subscribe((data) => {
            if (data) {
                (this.tentant.gender = data.key)
            }
        })

        this.contractForm.get('representative')?.valueChanges.subscribe((data) => {
            this.selectedTenant = data
            this.contract.representative = data
        })
        this.contractForm.get('startDate')?.valueChanges.subscribe((data) => {
            this.contract.startDate = data
            this.getNumberDayStayed()
            this.getTotalFirstPayment()

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
        this.contractForm.get('deposit')?.valueChanges.subscribe((data) => {
            this.contract.deposit = data
            this.getTotalFirstPayment()
        })
        this.contractForm.get('dayNumber')?.valueChanges.subscribe((data) => {
            this.contract.dayStayedBefore = data
        })
        this.contractForm.get('firstTotalPayment')?.valueChanges.subscribe((data) => {
            console.log('data', data)
            this.contract.firstComePayment = data
        })
        this.contractForm.get('holdRoomMoney')?.valueChanges.subscribe((data) => {
            this.contract.keepRoomDeposit = data
            this.getTotalFirstPayment()
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
                this.checkRoomCapacity()
            }
        })
    }

    prepareContractData(contract: Contract) {
        console.log(contract)
        this.contract = JSON.parse(JSON.stringify(contract))
        console.log(this.contract)
        this.contract.preRoom = contract.room?.id
        this.filterService()
        this.filterTenant()
        this.contractForm.get('startDate')?.setValue(moment(this.contract.startDate).toDate())
        this.contractForm.get('endDate')?.setValue(moment(this.contract.endDate).toDate())
        this.contractForm.get('deposit')?.setValue(this.contract.deposit)
        this.contractForm.get('firstElectricNum')?.setValue(this.contract.firstElectricNum)
        this.contractForm.get('firstWaterNum')?.setValue(this.contract.firstWaterNum)
        this.contractForm.get('representative')?.setValue(this.contract.representative)
        this.contractForm.get('duration')?.setValue(this.contract.duration)
        this.contractForm.get('holdRoomMoney')?.setValue(this.contract.keepRoomDeposit)
        this.contractForm.get('room')?.setValue(this.contract.room)
        this.roomPresent = this.contract.room
        this.rooms.push(this.roomPresent)
        if (this.contract.representative) {
            this.selectedTenant = this.contract.representative
        }
        this.getTotalFirstPayment()
    }

    printContract(contract: Contract): void {
        this.prepareContractData(contract)
        let vnd = new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        });
        let lanlord: {fullname?: string, identifyNum?: string, phone?: string, address?: string} = {fullname: this.user?.firstname + ' ' + this.user?.lastname, address: this.selectedAccomodation.address, identifyNum: this.user?.identifyNum, phone: this.user?.phone}
        let representative : {identifyNum?: string, phone?: string, fullname: string} = {identifyNum:  this.contract.representative?.identifyNum, phone: this.contract.representative?.phone, fullname: this.contract.representative?.firstName + ' ' + this.contract.representative?.lastName}
        let room: {price: string, deposit?: string} = {price: vnd.format(this.contract.room?.price), deposit: vnd.format(Number(this.contract.deposit))}
        const contractStartDate = moment(this.contract.startDate)
        let startDate: {day?: string, month?: string, year?: string} = {day: contractStartDate.format('DD'), month: contractStartDate.format('MM'), year: contractStartDate.format('YYYY')}
        const contractEndDate = moment(this.contract.endDate)
        let endDate: {day?: string, month?: string, year?: string} = {day: contractEndDate.format('DD'), month: contractEndDate.format('MM'), year:  contractEndDate.format('YYYY')}
        const endDayStayedBefor = moment(this.nextMonth).format('DD/MM/YYYY')
        
        console.log(vnd.format(this.dayStayedMoney))
        let docxData = {lanlord: lanlord, representative: representative, room: room, startDate: startDate, endDate: endDate, services: this.contract.services, deposit: vnd.format(Number(this.contract.deposit)), dayStayedBefore: this.contract.dayStayedBefore, dayStayedMoney: vnd.format(this.dayStayedMoney), firstTotalPayment: vnd.format(Number(this.contract.firstComePayment)), holdRoomMoney: vnd.format(Number(this.contract.keepRoomDeposit)), endDayStayedBefor }
        console.log('docxData',docxData)
        this.dayStayedMoney
        const documentCreator = new DocumentCreator();
        const doc = documentCreator.createContract(docxData);
    
        Packer.toBlob(doc).then(blob => {
          console.log(blob);
          saveAs(blob, `Hop_dong_phong_${this.contract.room?.name}.docx`);
          console.log("Document created successfully");
        });
      }

    deleteContract(contract: any) {
        let result: boolean
        this.contract = {...contract}
        contract.removeLoading = true
        this.contractService.isCanRemove(this.contract.id).pipe(
            finalize(() => {
                contract.removeLoading = false
                if (result) {
                    this.deleteContractDialog = true
                } else {
                    this.messageService.add({ severity: 'warn', summary: 'Cảnh báo', detail: 'Hợp đồng đang được sử dụng không thể xoá, vui lòng liên hệ admin để được trợ giúp!', life: 5000 })
                    this.contract = {}
                }
               
            })
        ).subscribe(response => result = response.data)
    }

    confirmDeleteContract() {
        this.loading = true
        this.contractService.removeContract(this.contract.id).pipe(
            finalize(() => {
                this.deleteContractDialog = false
                this.initData()
            })
        ).subscribe()
    }

    checkDuplicated() {
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

    getNumberDayStayed() {
        let startDate =  moment(this.contract.startDate)
        this.nextMonth = moment(this.contract.startDate).endOf('month').toDate()
        let dayDiff = moment(this.nextMonth).diff(startDate, 'days')
        this.contractForm.get('dayNumber')?.setValue(dayDiff)
    }

    getTotalFirstPayment() {
        const firstMonthDay = moment(this.contract.startDate).startOf('month')
        const lastMonthDay = moment(this.contract.startDate).endOf('month')
        const numberDayOfMonth = lastMonthDay.diff(firstMonthDay, 'days')
        const roomPrice = this.contract.room?.price
        const roomDeposit: number = this.contract.deposit || 0
        const numDay: number = this.contract.dayStayedBefore || 0
        const pricePerday = roomPrice / numberDayOfMonth || 0
        const oldDeposit: number = this.contract.keepRoomDeposit || 0
        this.dayStayedMoney = pricePerday * numDay;
        let total =  this.dayStayedMoney - oldDeposit + roomDeposit || 0
        if (total < 0) {
            total = 0
        }
        this.contractForm.get('firstTotalPayment')?.setValue(total)
    }

    checkIsRoomHasDeposit() {
        this.loading = true
        let result: any ;
        this.roomService.checkRoomNotDeposit(this.contract.room?.id).pipe(
            finalize(() => {
                this.loading = false
                if (result.isBooked) {
                    this.depositor = result.depositor
                    this.oldDeposit = result.depositMoney
                    let tenant =  this.selectedTenants.find((item: any) => item.id === this.depositor.id)
                    if (!tenant) {
                        this.selectedTenants.push(this.depositor)
                        this.tenantsDisplayed = this.tenantsDisplayed.filter(tenant => tenant.id !== this.depositor.id)
                    }
                }  else {
                    this.depositor = {}
                    this.oldDeposit = 0
                }
                this.contractForm.get('holdRoomMoney')?.setValue(this.oldDeposit)
                
            })
        ).subscribe(response => result = response.data)
    }

    getDropdownAccomodation() {
        this.loading = true
        return this.accomodationService.getDropdownAccomodation(this.user?.id).pipe(
            finalize(() => {
                if (this.accomodations.length > 0) {
                    this.selectedAccomodation = this.accomodations[0]
                    this.initData()
                } else {
                    this.loading = false
                    this.messageService.add({ severity: 'warn', summary: 'Cảnh báo', detail: 'Vui lòng tạo khu/nhà trọ trước!', life: 3000 })
                }
               
            }),
        )
    }

    onMoveTenant() {
        // this.checkTenantDeposit()
        this.checkRoomCapacity()
    }

    newTenant() {
        this.tentant = {}
        this.tenantForm.get('firstName')?.setValue(null)
        this.tenantForm.get('lastName')?.setValue(null)
        this.tenantForm.get('startDate')?.setValue(null)
        this.tenantForm.get('identifyNum')?.setValue(null)
        this.tenantForm.get('phone')?.setValue(null)
        this.tenantForm.get('email')?.setValue(null)
        this.tenantForm.get('gender')?.setValue({key: 'UNKNOWN', value: 'Chưa biết'})
        this.tentant.accomodationId = this.selectedAccomodation.id;
        this.tenantDialog = true
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
                    this.getTenantByAccomodation().pipe(
                        finalize(() => {
                            this.messageService.add({ severity: 'success', summary: 'Successful', detail: message, life: 3000 })
                            this.loading = false
                            this.tenantsDisplayed = JSON.parse(JSON.stringify(this.tenants))
                            if (this.depositor) {
                                this.tenantsDisplayed = this.tenantsDisplayed.filter(tenant => tenant.id !== this.depositor.id)
                            }
                        })
                    ).subscribe(response => this.tenants = response.data)
                }),
            )
            .subscribe((data) => console.log(data))
        this.tenantDialog = false
    }

    checkRoomCapacity() {
        if (this.contract.room) {
            if (this.contract.room.capacity && this.contract.room.capacity < this.selectedTenants.length) {
                this.contractForm.get('room')?.setErrors({overCapacity: true})
            } else {
                this.contractForm.get('room')?.setErrors(null);
            }
        }
    }
    
    onMoveBackTenant() {
        if (!this.selectedTenants.find((item: any) => item.id === this.selectedTenant?.id)) {
            this.contractForm.get('representative')?.setValue(null)
        }
        this.checkRoomCapacity()
        // this.checkTenantDeposit()
    }

    onMoveBackService(value: any) {
        value.items.forEach((service: any) => service.quantity = 1)
    }

    openNew() {
        this.contract = {}
        this.addDialog = true
        this.isAddNew = true
        this.contractForm.get('startDate')?.setValue(moment(new Date()).toDate())
        this.contractForm.get('endDate')?.setValue(moment(new Date()).toDate())
        this.contractForm.get('deposit')?.setValue(null)
        this.contractForm.get('representative')?.setValue(null)
        this.contractForm.get('duration')?.setValue(null)
        this.contractForm.get('firstElectricNum')?.setValue(null)
        this.contractForm.get('firstWaterNum')?.setValue(null)
        this.contractForm.get('room')?.setValue(null)
        this.contractForm.get('holdRoomMoney')?.setValue(null)
        // this.contractForm.get('dayNumber')?.setValue(null)
        // this.contractForm.get('firstTotalPayment')?.setValue(null)
        // this.defaultService();
    }

    defaultService() {
        this.services.forEach((item: any) => {
            if (item.isDefault) {
                item.disabled = true
                this.selectedServices.push(item);
                this.servicesDisplayed = this.servicesDisplayed.filter(service => service.id !== item.id)
            }
        })
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
        this.prepareContractData(contract)
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

    onHideTenantDialog() {
        this.tenantForm.reset()
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
