import { Component, OnInit } from '@angular/core'
import { FormControl, FormGroup, Validators } from '@angular/forms'
import * as moment from 'moment'
import { MessageService } from 'primeng/api'
import { Table } from 'primeng/table'
import { debounceTime, distinctUntilChanged, finalize, forkJoin } from 'rxjs'
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
    minEndDate!: Date;
    maxEndDate!: Date;
    minDate!: Date;
    maxDate!: Date;
    isValidating: boolean = false
    oldIdentifyNum: any = ''
    durations: {value: number, display: string}[] = [{value: 6, display: '6 tháng'}, {value: 12, display: '12 tháng'}]
    oldDeposit?: Number = 0
    nextMonth!: Date
    dayStayedMoney!: number
    gender: any = AppConstant.GENDER

    tentant: Tenant = {}
    tenantForm: FormGroup
    tenantDialog: boolean = false
    emailLoading: boolean = false
    phoneLoading: boolean = false
    oldEmail: any = ''
    oldPhone: any = ''

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
            phone: new FormControl(this.deposit.phone, [Validators.required]),
            identifyNum: new FormControl(this.deposit.identifyNum, [Validators.required]),
            email: new FormControl(this.deposit.email, [Validators.required]),
            room: new FormControl(this.deposit.room, [Validators.required]),
            selectedTenant: new FormControl(this.selectedTenant, []),
        })

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

        this.tenantForm = new FormGroup({
            firstName: new FormControl(this.tentant.firstName, [Validators.required]),
            lastName: new FormControl(this.tentant.lastName, [Validators.required]),
            startDate: new FormControl(this.tentant.startDate, []),
            gender: new FormControl(this.tentant.gender, []),
            identifyNum: new FormControl(this.tentant.identifyNum, [Validators.required]),
            phone: new FormControl(this.tentant.phone, [Validators.required]),
            email: new FormControl(this.tentant.email, [Validators.required]),
        })

        this.validateDate()
    }

    ngOnInit() {
        this.user = this.auth.userValue
        this.getDropdownAccomodation().subscribe((response) => (this.accomodations = response.data))

        this.depositForm.get('startDate')?.valueChanges.subscribe((data) => {
            this.deposit.startDate = data
            this.minEndDate = moment(this.deposit.startDate).add(4, 'days').toDate()
            this.maxEndDate = moment(this.deposit.startDate).add(15, 'days').toDate();
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
            if (data) {
                this.deposit.identifyNum = data
                if (this.oldIdentifyNum !== this.deposit.identifyNum && this.isChooseExisted) {
                    this.checkDuplicatedTenant()
                }
            }
        })
        this.depositForm.get('lastName')?.valueChanges.subscribe((data) => {
            this.deposit.lastName = data
        })
        this.depositForm.get('phone')?.valueChanges.subscribe((data) => {
            if (data) {
                this.deposit.phone = data
                let isValid = this.validatePhoneNumber(data)
                if (!isValid) {
                    this.depositForm.get('phone')?.setErrors({phoneInvalid: true})
                } else {
                    this.depositForm.get('phone')?.setErrors(null)
                }
                if (this.oldPhone !== this.tentant.phone && this.depositForm.get('phone')?.valid  && this.isChooseExisted) {
                    this.checkDuplicatedTenantPhone()
                }
            }
        })
        this.depositForm.get('email')?.valueChanges.subscribe((data) => {
            if (data) {
                this.deposit.email = data
                let isValid =  this.validateGmail(data)
                if (!isValid) {
                    this.depositForm.get('email')?.setErrors({mailInvalid: true})
                } else {
                    this.depositForm.get('email')?.setErrors(null)
                }
                if (this.oldEmail !== this.tentant.email && this.depositForm.get('email')?.valid  && this.isChooseExisted) {
                    this.checkDuplicatedTenantEmail()
                }
            }
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
            this.getNumberDayStayed()
            this.getTotalFirstPayment()

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
        this.contractForm.get('deposit')?.valueChanges.subscribe((data) => {
            this.contract.deposit = data
            this.getTotalFirstPayment()
        })
        this.contractForm.get('dayNumber')?.valueChanges.subscribe((data) => {
            this.contract.dayStayedBefore = data
        })
        this.contractForm.get('firstTotalPayment')?.valueChanges.subscribe((data) => {
            this.contract.firstComePayment = data
        })
        this.contractForm.get('holdRoomMoney')?.valueChanges.subscribe((data) => {
            this.contract.keepRoomDeposit = data
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
                this.checkRoomCapacity()
                this.onChangeRoomContract()
            }
        })

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
                this.tentant.phone = data
                let isValid = this.validatePhoneNumber(data)
                if (!isValid) {
                    this.tenantForm.get('phone')?.setErrors({phoneInvalid: true})
                } else {
                    this.tenantForm.get('phone')?.setErrors(null)
                }
                if (this.oldPhone !== this.tentant.phone && this.tenantForm.get('phone')?.valid) {
                    this.checkDuplicatedPhone()
                }
            }
        })
        this.tenantForm.get('email')?.valueChanges.subscribe((data) => {
            if (data) {
                this.tentant.email = data
                let isValid = this.validateGmail(data)
                if (!isValid) {
                    this.tenantForm.get('email')?.setErrors({mailInvalid: true})
                } else {
                    this.tenantForm.get('email')?.setErrors(null)
                }
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

    validatePhoneNumber(phone: string) {
        const isValid = phone.toLowerCase().match(
            /(84|0[3|5|7|8|9])+([0-9]{8})\b/g
        )
        return isValid;
        
    }

    validateGmail(email: string) {
        const isValid = email.toLowerCase().match(
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        )
        return isValid;
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
        console.log('total',total)
        this.contractForm.get('firstTotalPayment')?.setValue(total)
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

    newTenant() {
        this.tentant = {}
        this.oldEmail = ''
        this.oldPhone = ''
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
                            this.messageService.add({ severity: 'success', summary: 'Thành công', detail: message, life: 3000 })
                            this.loading = false
                            this.tenantDialog = false
                            this.tenantsDisplayed = JSON.parse(JSON.stringify(this.tenants))
                            this.tenantsDisplayed = this.tenantsDisplayed.filter(item => !this.isIncludeTenant(item))
                            console.log('this.selectedTenants', this.selectedTenants)
                            console.log('this.deposit', this.selectedTenants)
                        })
                    ).subscribe(response => this.tenants = response.data)
                }),
            )
            .subscribe((data) => console.log(data))
    }

    isIncludeTenant(tenant: Tenant) {
        const tenantFound = this.selectedTenants.find((item: any) => item.id === tenant.id)
        return !!tenantFound
    }

    checkDuplicatedTenant() {
        let isDuplicated = false;
        this.isValidating = true
        this.tenantService.checkDuplicatedIdentify(this.deposit.identifyNum).pipe(
            finalize(() => {
                this.isValidating = false
                if (isDuplicated) {
                    this.depositForm.get('identifyNum')?.setErrors({duplicated: true})
                }
            })
        ).subscribe(response => isDuplicated = response.data)
    }

    checkDuplicatedTenantEmail() {
        let isDuplicated = false;
        this.emailLoading = true
        this.tenantService.checkDuplicatedEmail(this.deposit.email).pipe(
            finalize(() => {
                this.emailLoading = false
                if (isDuplicated) {
                    this.depositForm.get('email')?.setErrors({duplicated: true})
                }
            })
        ).subscribe(response => isDuplicated = response.data)
    }

    checkDuplicatedTenantPhone() {
        let isDuplicated = false;
        this.phoneLoading = true
        this.tenantService.checkDuplicatedPhone(this.deposit.phone).pipe(
            finalize(() => {
                this.phoneLoading = false
                if (isDuplicated) {
                    this.depositForm.get('phone')?.setErrors({duplicated: true})
                }
            })
        ).subscribe(response => isDuplicated = response.data)
    }

    validateDate() {
        let today = new Date();
        this.minDate = moment(today).subtract(5, 'days').toDate()
        this.maxDate = moment(today).add(5, 'days').toDate()
        this.minEndDate =  this.minDate
    }

    onChangeRoomContract() {
        this.contractForm.get('deposit')?.setValue(this.contract.room?.price)
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
        this.oldIdentifyNum = ''
        this.oldEmail = ''
        this.oldPhone = ''
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
        this.oldIdentifyNum = this.selectedTenant.identifyNum
        this.oldEmail = this.selectedTenant.email
        this.oldPhone = this.selectedTenant.phone
        this.depositForm.get('firstName')?.setValue(this.selectedTenant.firstName)
        this.depositForm.get('lastName')?.setValue(this.selectedTenant.lastName)
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
        this.oldIdentifyNum = deposit.identifyNum
        this.oldEmail = deposit.email
        this.oldPhone = deposit.phone
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
        this.isChooseExisted = true
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
                this.messageService.add({ severity: 'success', summary: 'Thành công', detail: 'Huỷ đặt cọc thành công', life: 3000 })
                this.initData()
            })
        ).subscribe()
    }

    getRoomByAccomodation() {
        return this.roomService.getRoomNotRented(this.selectedAccomodation.id)
    }

    findTenant(tenantId: any) {
        return this.tenants.find(item => item.id === tenantId)
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

    filterTenant() {
        this.contract.tenants?.forEach((item: any) => {
            this.selectedTenants.push(item);
        })
    }

    createContract(deposit: Deposit) {
        deposit.loading = true
        this.contractInfoLoading = true
        this.initContractData().pipe(
            finalize(() => {
                this.contract = {}
                this.contractInfoLoading = false
                this.contractDialog = true
                this.isAddNew = true
                deposit.loading = false
                // this.defaultService()
                let tenant = this.findTenant(deposit.tenantId)
                if (tenant) {
                    this.selectedTenants.push(tenant);
                    this.tenantsDisplayed = this.tenantsDisplayed.filter(item => item.id !== tenant?.id)
                }
                this.contractForm.get('startDate')?.setValue(moment(new Date()).toDate())
                this.contractForm.get('endDate')?.setValue(moment(new Date()).toDate())
                this.contractForm.get('deposit')?.setValue(null)
                this.contractForm.get('representative')?.setValue(null)
                this.contractForm.get('duration')?.setValue(null)
                this.contractForm.get('firstElectricNum')?.setValue(null)
                this.contractForm.get('firstWaterNum')?.setValue(null)
                this.contractForm.get('room')?.setValue({id: deposit.room?.id, name: deposit.room?.name, price: deposit.room?.price, capacity: deposit.room?.capacity})
                this.oldDeposit = deposit.deposit
                this.contractForm.get('holdRoomMoney')?.setValue(this.oldDeposit)
                this.roomPresent = this.contract.room
                this.rooms.push(this.roomPresent)
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
                    this.initData()
                    this.contractDialog = false
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
        if (this.roomPresent) {
            this.rooms = this.rooms.filter(item => item.id !== this.roomPresent.id)
        }
        this.selectedServices = []
        this.selectedTenants = []
        this.servicesDisplayed = JSON.parse(JSON.stringify(this.services))
        this.tenantsDisplayed = JSON.parse(JSON.stringify(this.tenants))
        this.contractForm.reset()
    }


    hideDialog() {
        this.addDialog = false
        this.isChooseExisted = false
    }

    onHideTenantDialog() {
        this.tenantForm.reset()
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
                        this.messageService.add({ severity: 'success', summary: 'Thành công', detail: message, life: 3000 })
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

