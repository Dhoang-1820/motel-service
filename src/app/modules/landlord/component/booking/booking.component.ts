import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MenuItem, MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { debounceTime, distinctUntilChanged, finalize, forkJoin } from 'rxjs';
import { AuthenticationService } from 'src/app/modules/auth/service/authentication.service';
import { AppConstant } from 'src/app/modules/common/Constants';
import { User } from 'src/app/modules/model/user.model';
import { Room, AccomodationUtilities } from '../../model/accomodation.model';
import { Post } from '../../model/post.model';
import { AccomodationService } from '../../service/accomodation.service';
import { PostService } from '../../service/post.service';
import { RoomService } from '../../service/room.service';
import { Booking } from '../../model/booking.model';
import { BookingService } from 'src/app/modules/users/services/booking.service';
import { Tenant } from '../../model/tenant.model';
import { TenantService } from '../../service/tenant.service';
import { Deposit } from '../../model/deposit.model';
import { DepositService } from '../../service/deposit.service';
import { Contract } from '../../model/contract.model';
import { ContractService } from '../../service/contract.service';
import * as moment from 'moment';

@Component({
  selector: 'app-booking',
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.scss'],
  providers: [MessageService],
})
export class BookingComponent implements OnInit {
    invoiceDialog: boolean = false
    accomodations: any[] = []
    selectedAccomodation!: any

    bookedList: Booking[] = []
    booking: Booking = {}
    rowsPerPageOptions = [5, 10, 20]
    user!: User | null
    dataLoading: boolean = false
    loading: boolean = false
    issueRequest!: { roomId: any; month?: Date }
    postDialog: boolean = false
    rooms: Room[] = []

    services: AccomodationUtilities[] = []
    servicesDisplayed: AccomodationUtilities[] = []
    selectedServices: AccomodationUtilities[] = []
    contractInfoLoading: boolean = false
    roomPresent: any

    items: MenuItem[] = []
    linkUpload: string = "http://localhost:8080/motel-service/api/post/image/"
    responsiveOptions: any[];
    deleteImageDialog: boolean = false
    selectedImage: any;
    deleteLoading: boolean = false;

    tenantDialog: boolean = false
    tenantForm: FormGroup
    tentant: Tenant = {}
    gender: any = AppConstant.GENDER

    depositForm: FormGroup
    deposit: Deposit = {}
    deposits: Deposit[] = []
    addDepositDialog: boolean = false
    depositInfoLoading: boolean = false
    roomInvalids: unknown[] = [];

    contractForm!: FormGroup
    contract: Contract = {}
    tenantsDisplayed: Tenant[] = []
    selectedTenants: any = []
    contractDialog: boolean = false
    selectedTenant: Tenant = {}
    tenants: Tenant[] = []
    isValidating: boolean = false
    oldIdentifyNum: any = ''
    minEndDate!: Date;
    maxEndDate!: Date;
    minDate!: Date;
    maxDate!: Date;
    nextMonth!: Date
    dayStayedMoney!: number
    durations: {value: number, display: string}[] = [{value: 6, display: '6 tháng'}, {value: 12, display: '12 tháng'}]

    constructor(
        private accomodationService: AccomodationService,
        private auth: AuthenticationService,
        private messageService: MessageService,
        private postService: PostService,
        private roomService: RoomService,
        private bookingService: BookingService,
        private tenantService: TenantService,
        private depositService: DepositService,
        private contractService: ContractService,
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

        

        this.responsiveOptions = [
            {
                breakpoint: '1024px',
                numVisible: 5
            },
            {
                breakpoint: '768px',
                numVisible: 3
            },
            {
                breakpoint: '560px',
                numVisible: 1
            }
        ];
    }

    ngOnInit() {
        this.user = this.auth.userValue
        this.getAllBookedRoomByUserId()

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
            }
        })
        this.tenantForm.get('gender')?.valueChanges.subscribe((data) => {
            if (data) {
                (this.tentant.gender = data.key)
            }
        })

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
                if (this.oldIdentifyNum !== this.deposit.identifyNum) {
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
    }

    checkDuplicatedTenant() {
        let isDuplicated = false;
        this.isValidating = true
        this.tenantService.checkDuplicated(this.deposit.identifyNum).pipe(
            finalize(() => {
                this.isValidating = false
                if (isDuplicated) {
                    this.depositForm.get('identifyNum')?.setErrors({duplicated: true})
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

    onChangeRoomContract() {
        this.contractForm.get('deposit')?.setValue(this.contract.room?.price)
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
        let fullName = this.splitName(this.booking.name || '')
        this.tenantForm.get('firstName')?.setValue(fullName.firstName?.trim())
        this.tenantForm.get('lastName')?.setValue(fullName.lastName?.trim())
        this.tenantForm.get('startDate')?.setValue(null)
        this.tenantForm.get('identifyNum')?.setValue(null)
        this.tenantForm.get('phone')?.setValue(this.booking.phone)
        this.tenantForm.get('email')?.setValue(this.booking.email)
        this.tenantForm.get('gender')?.setValue({key: 'UNKNOWN', value: 'Chưa biết'})
        this.tentant.accomodationId = this.booking.accomodationId;
        this.tenantDialog = true
    }

    getRoomNoDepositByAccomodation() {
        return this.roomService.getRoomNotDeposit(this.selectedAccomodation.id)
    }

    splitName(str: string) {
        if (str) {
            let lastSpaceIndex = str.search(/ [^ ]*$/)
            return {
                firstName: str.substring(0, lastSpaceIndex).trim(),
                lastName: str.substring(lastSpaceIndex),
            }
        } else {
            return {}
        }
    }

    getMenuItems(post: Post): MenuItem[] {
        this.items = [
            {
                icon: 'pi pi-fw pi-users',
                label: 'Tạo khách thuê',
                command: (e: any) => {
                    this.booking = {...e.item.data}
                    this.newTenant()
                },
            },
            {
                icon: 'pi pi-fw pi-sitemap',
                label: 'Tạo đặt cọc',
                command: (e: any) => {
                    this.booking = {...e.item.data}
                    this.newDeposit()
                },
            },
            {
                icon: 'pi pi-ticket',
                label: 'Tạo hợp đồng',
                command: (e: any) => {
                    this.booking = {...e.item.data}
                    this.createContract()
                },
            },
            {
                label: 'Xoá',
                icon: 'pi pi-trash',
                command: (e) => {
                    this.booking = {...e.item.data}
                    // this.removePost()
                },
            },
        ]
        this.items.forEach((menuItem: any) => {
            menuItem.data = post
        })
        return this.items
    }

    findDeposit(roomId: any) {
        let result = false
        if (this.deposits.length > 0) {
            let deposit = this.deposits.find(deposit => deposit.room?.id === roomId)
            result = !!deposit
        } else {
            result = true
        }
       return result
    }

    newDeposit() {
        this.depositInfoLoading = true
        this.getDepositByAccomodation().pipe(
            finalize(() => {
                this.depositInfoLoading = false
                let isValidDeposit = this.findDeposit(this.booking.roomId)
                if (isValidDeposit) {
                    this.addDepositDialog = true
                    let fullName = this.splitName(this.booking.name || '')
                    this.depositForm.get('startDate')?.setValue(null)
                    this.depositForm.get('dueDate')?.setValue(null)
                    this.depositForm.get('note')?.setValue(null)
                    this.depositForm.get('deposit')?.setValue(null)
                    this.depositForm.get('firstName')?.setValue(fullName.firstName?.trim())
                    this.depositForm.get('lastName')?.setValue(fullName.lastName?.trim())
                    this.depositForm.get('identifyNum')?.setValue(null)
                    this.depositForm.get('phone')?.setValue(this.booking.phone)
                    this.depositForm.get('email')?.setValue(this.booking.email)
                    this.depositForm.get('room')?.setValue({id: this.booking.roomId, name: this.booking.room, price: null})
                } else {
                    this.messageService.add({ severity: 'error', summary: 'Thất bại', detail: 'Phòng đã được đặt cọc trước đó', life: 5000 })
                }
            })
        ).subscribe(response => this.deposits = response.data)
        
    }

    getTenantByAccomodation() {
        return this.tenantService.getTenantWithoutContract(this.booking.accomodationId)
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

    findRoom(roomId: any) {
        let result = false
        if (this.rooms.length > 0) {
            let room = this.rooms.find(room => room.id === roomId)
            result = !!room
        } else {
            result = true
        }
        return result
    }

    deativateBooking() {
        return this.bookingService.deactivateBooking(this.booking.id)
    }

    createContract() {
        this.contractInfoLoading = true
        this.initContractData().pipe(
            finalize(() => {
                let isValidRoom = this.findRoom(this.booking.roomId)
                if (isValidRoom) {
                    this.contract = {}
                    this.contractInfoLoading = false
                    this.contractDialog = true
                    this.contractForm.get('startDate')?.setValue(moment(new Date()).toDate())
                    this.contractForm.get('endDate')?.setValue(moment(new Date()).toDate())
                    this.contractForm.get('deposit')?.setValue(null)
                    this.contractForm.get('representative')?.setValue(null)
                    this.contractForm.get('duration')?.setValue(null)
                    this.contractForm.get('firstElectricNum')?.setValue(null)
                    this.contractForm.get('firstWaterNum')?.setValue(null)
                    this.contractForm.get('room')?.setValue({id: this.booking.room?.id, name: this.booking.room?.name, price: this.booking.room?.price, capacity: this.booking.room?.capacity})
                    this.checkRoomCapacity()
                    this.onChangeRoomContract()
                } else {
                    this.messageService.add({ severity: 'error', summary: 'Thất bại', detail: 'Phòng đã được tạo hợp đồng hoặc đặt cọc', life: 5000 })
                }
            })
        )
        .subscribe((response: any) => {
            this.rooms = response.rooms.data
            this.tenants = response.tenants.data
            this.services = response.services.data
        })
    }

    onDialogContractHide() {
        this.selectedTenants = []
    }

    onChangeRoom() {
        if (this.roomInvalids.includes(this.deposit.room?.id)) {
            this.depositForm.get('room')?.setErrors({roomInvalid: true})
        } else {
            if (!this.depositForm.get('room')?.invalid) {
                this.depositForm.get('room')?.setErrors(null)
            }
        }
    }

    getDepositByAccomodation() {
        return this.depositService.getDepositByAccomodation(this.booking.accomodationId)
    }

    saveDeposit() {
        if (!this.depositForm.invalid) {
            this.loading = true
            this.deposit.accomodationId = this.booking.accomodationId
            this.depositService
                .saveDeposit(this.deposit)
                .pipe(
                    finalize(() => {
                        this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Thêm thành công', life: 3000 })
                        this.deativateBooking().pipe(
                            finalize(() => {
                                this.getAllBookedRoomByUserId()
                            })
                        ).subscribe()
                    }),
                )
                .subscribe()
            this.addDepositDialog = false
        } else {
            this.depositForm.markAllAsTouched()
        }
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
                            this.loading = false
                            this.messageService.add({ severity: 'success', summary: 'Successful', detail: message, life: 3000 })
                            this.tenantsDisplayed = JSON.parse(JSON.stringify(this.tenants))
                        })
                    ).subscribe(response => this.tenants = response.data)
                }),
            )
            .subscribe((data) => console.log(data))
        this.tenantDialog = false
    }

    openNew() {
        this.booking = {}
        this.postDialog = true
    }

    onShowMenu(post: Post) {
        this.getMenuItems(post)
    }

    onMoveBackService(value: any) {
        value.items.forEach((service: any) => (service.quantity = 1))
    }

    toggleMenu(menu: any, event: any) {
        menu.toggle(event)
    }

    onMoveBackTenant() {
        if (!this.selectedTenants.find((item: any) => item.id === this.selectedTenant?.id)) {
            this.contractForm.get('representative')?.setValue(null)
        }
    }

    getAllBookedRoomByUserId() {
        this.loading = true
        this.bookingService.getBookingByUserId(this.user?.id)
            .pipe(
                finalize(() => {
                    this.loading = false
                }),
            )
            .subscribe((response) => (this.bookedList = response.data))
    }

    initData() {
        forkJoin({
            rooms: this.getRoomByAccomodation(),
            posts: this.getPostByAccomodation(),
            services: this.getAccomdationService(),
        })
            .pipe(
                finalize(() => {
                    this.loading = false
                    // this.servicesDisplayed = JSON.parse(JSON.stringify(this.services))
                }),
            )
            .subscribe((response) => {
                this.rooms = response.rooms.data
                this.bookedList = response.posts.data
                // this.services = response.services.data
            })
    }

    getAccomdationService() {
        return this.accomodationService.getAccomodationService(this.booking.accomodationId)
    }

    getRoomByAccomodation() {
        return this.roomService.getRoomNotRented(this.booking.accomodationId)
    }

    getPostByAccomodation() {
        return this.postService.getByUserIdAndAccomodation(this.user?.id, this.booking.accomodationId)
    }

    onSelectAccomodation() {
        this.initData()
    }

    onDialogTenantHide() {
        this.tenantForm.reset()
    }

    checkDuplicated() {
        let isDuplicated = false;
        this.isValidating = true
        this.tenantService.checkDuplicated(this.tentant.identifyNum).pipe(
            finalize(() => {
                this.isValidating = false
                if (isDuplicated) {
                    this.tenantForm.get('identifyNum')?.setErrors({duplicated: true})
                }
            })
        ).subscribe(response => isDuplicated = response.data)
    }

    onDialogHide() {
        if (this.roomPresent) {
            this.rooms = this.rooms.filter(item => item.id !== this.roomPresent.id)
        }
        this.depositForm.reset()
    }

    onMoveTenant() {
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
                    this.deativateBooking().pipe(
                        finalize(() => {
                            this.loading = false
                            this.contract = {}
                            this.messageService.add({ severity: 'success', summary: 'Thành công', detail: message, life: 3000 })
                            this.getAllBookedRoomByUserId()
                        })
                    ).subscribe()
                })
            ).subscribe()
            errorFlag = false
        } else {
            this.contractForm.markAllAsTouched()
        }
        if (!errorFlag) {
            this.addDepositDialog = false
        }
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains')
    }

    get staticElectricPriceName() {
        return AppConstant.ELECTRIC_PRICE_NAME
    }

    get staticWaterPriceName() {
        return AppConstant.WATER_PRICE_NAME
    }

    getStaticEletricName() {
        return AppConstant.ELECTRIC_PRICE_NAME
    }

    getStaticWaterName() {
        return AppConstant.WATER_PRICE_NAME
    }
}
