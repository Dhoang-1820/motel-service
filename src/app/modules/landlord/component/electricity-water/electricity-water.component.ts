import { Component, OnInit } from '@angular/core'
import { FormControl, FormGroup, Validators } from '@angular/forms'
import * as moment from 'moment'
import { MessageService } from 'primeng/api'
import { Table } from 'primeng/table'
import { finalize, forkJoin } from 'rxjs'
import { AuthenticationService } from 'src/app/modules/auth/service/authentication.service'
import { User } from 'src/app/modules/model/user.model'
import { Room } from '../../model/accomodation.model'
import { ElectricWater } from '../../model/electric-water.model'
import { AccomodationService } from '../../service/accomodation.service'
import { BillService } from '../../service/bill.service'
import { RoomService } from '../../service/room.service'

@Component({
    selector: 'app-electricity-water',
    templateUrl: './electricity-water.component.html',
    styleUrls: ['./electricity-water.component.scss'],
    providers: [MessageService],
})
export class ElectricityWaterComponent implements OnInit {
    selectedTenant: any
    dataLoading: boolean = false
    user!: User | null
    accomodations: any[] = []
    loading: boolean = false
    electricWater: ElectricWater = {}
    electricWaters: ElectricWater[] = []
    cols: any[] = []
    billDialog: boolean = false
    deleteTenantDialog: boolean = false
    selectedAccomodation!: any
    rooms: Room[] = []
    roomPresent: any
    selectedRoom: any
    electricWaterNumForm: FormGroup
    selectedMonth: Date | undefined

    commonRequest!: { id: any; month: any }

    constructor(
        private auth: AuthenticationService,
        private accomodationService: AccomodationService,
        private roomService: RoomService,
        private billService: BillService,
        private messageService: MessageService,
    ) {
        this.electricWaterNumForm = new FormGroup({
            firstElectric: new FormControl(this.electricWater.firstElectric, [Validators.required, Validators.min(0)]),
            lastElectric: new FormControl(this.electricWater.lastElectric, [Validators.required, Validators.min(0)]),
            electricNum: new FormControl(this.electricWater.electricNum, [Validators.required, Validators.min(0)]),
            firstWater: new FormControl(this.electricWater.firstWater, [Validators.required, Validators.min(0)]),
            lastWater: new FormControl(this.electricWater.lastWater, [Validators.required, Validators.min(0)]),
            waterNum: new FormControl(this.electricWater.waterNum, [Validators.required, Validators.min(0)]),
            room: new FormControl(this.electricWater.room, [Validators.required]),
            month: new FormControl(this.electricWater.month, [Validators.required]),
        })
        this.selectedMonth = moment().toDate()
    }

    ngOnInit(): void {
        this.user = this.auth.userValue
        this.getDropdownAccomodation()

        this.electricWaterNumForm.get('firstElectric')?.valueChanges.subscribe((data) => {
            this.electricWater.firstElectric = data
            if (this.electricWater.firstElectric !== undefined && this.electricWater.lastElectric !== undefined) {
                this.electricWaterNumForm.get('electricNum')?.setValue(this.electricWater.lastElectric - this.electricWater.firstElectric)
            }
            if (this.electricWater.electricNum && this.electricWater.electricNum < 0) {
                this.electricWaterNumForm.get('electricNum')?.setErrors({ electricInvalid: true })
            }
        })
        this.electricWaterNumForm.get('lastElectric')?.valueChanges.subscribe((data) => {
            this.electricWater.lastElectric = data
            if (this.electricWater.firstElectric !== undefined && this.electricWater.lastElectric !== undefined) {
                this.electricWaterNumForm.get('electricNum')?.setValue(this.electricWater.lastElectric - this.electricWater.firstElectric)
            }
            if (this.electricWater.electricNum && this.electricWater.electricNum < 0) {
                this.electricWaterNumForm.get('electricNum')?.setErrors({ electricInvalid: true })
            }
        })
        this.electricWaterNumForm.get('electricNum')?.valueChanges.subscribe((data) => {
            this.electricWater.electricNum = data
        })
        this.electricWaterNumForm.get('firstWater')?.valueChanges.subscribe((data) => {
            this.electricWater.firstWater = data
            if (this.electricWater.firstWater !== undefined && this.electricWater.lastWater !== undefined) {
                this.electricWaterNumForm.get('waterNum')?.setValue(this.electricWater.lastWater - this.electricWater.firstWater)
            }
            if (this.electricWater.waterNum && this.electricWater.waterNum < 0) {
                this.electricWaterNumForm.get('waterNum')?.setErrors({ waterInvalid: true })
            }
        })
        this.electricWaterNumForm.get('lastWater')?.valueChanges.subscribe((data) => {
            this.electricWater.lastWater = data
            if (this.electricWater.firstWater !== undefined && this.electricWater.lastWater !== undefined) {
                this.electricWaterNumForm.get('waterNum')?.setValue(this.electricWater.lastWater - this.electricWater.firstWater)
            }
            if (this.electricWater.waterNum && this.electricWater.waterNum < 0) {
                this.electricWaterNumForm.get('waterNum')?.setErrors({ waterInvalid: true })
            }
        })
        this.electricWaterNumForm.get('waterNum')?.valueChanges.subscribe((data) => {
            this.electricWater.waterNum = data
        })
        this.electricWaterNumForm.get('month')?.valueChanges.subscribe((data) => {
            this.electricWater.month = data
        })
        this.electricWaterNumForm.get('room')?.valueChanges.subscribe((data) => {
            this.electricWater.room = data
        })
    }

    getDropdownAccomodation() {
        this.loading = true
        this.accomodationService
            .getDropdownAccomodation(this.user?.id)
            .pipe(
                finalize(() => {
                    this.selectedAccomodation = this.accomodations[0]
                    this.initData()
                }),
            )
            .subscribe((response) => (this.accomodations = response.data))
    }

    onChangeRoom() {
        let result: ElectricWater
        const preMonth: Date = moment(this.selectedMonth).subtract(1, 'month').toDate()
        this.commonRequest = { id: this.electricWater.room?.id, month: preMonth }
        this.loading = true
        this.billService.getElectricWaterByRoomAndMonth(this.commonRequest).pipe(
            finalize(() => {
                this.loading = false
                if (result) {
                    console.log(result)
                    this.electricWaterNumForm.get('firstElectric')?.setValue(result.firstElectric)
                    this.electricWaterNumForm.get('lastElectric')?.setValue(result.firstElectric)
                    this.electricWaterNumForm.get('firstWater')?.setValue(result.firstWater)
                    this.electricWaterNumForm.get('lastWater')?.setValue(result.firstWater)
                } else {
                    this.electricWaterNumForm.get('firstElectric')?.setValue(0)
                    this.electricWaterNumForm.get('lastElectric')?.setValue(0)
                    this.electricWaterNumForm.get('firstWater')?.setValue(0)
                    this.electricWaterNumForm.get('lastWater')?.setValue(0)
                }
            })
        ).subscribe(response => result = response.data)
    }

    openNew() {
        this.electricWater = {}
        this.electricWaterNumForm.get('month')?.setValue(moment(this.selectedMonth).toDate())
        this.electricWaterNumForm.get('firstElectric')?.setValue(null)
        this.electricWaterNumForm.get('lastElectric')?.setValue(null)
        this.electricWaterNumForm.get('electricNum')?.setValue(null)
        this.electricWaterNumForm.get('firstWater')?.setValue(null)
        this.electricWaterNumForm.get('lastWater')?.setValue(null)
        this.electricWaterNumForm.get('waterNum')?.setValue(null)
        this.electricWaterNumForm.get('totalPrice')?.setValue(null)
        this.electricWaterNumForm.get('isPay')?.setValue(false)
        this.electricWaterNumForm.get('room')?.setValue({})
        this.billDialog = true
    }

    getRoomByAccomodation() {
        this.commonRequest = { id: this.selectedAccomodation.id, month: this.selectedMonth }
        return this.roomService.getRoomNoElectricWater(this.commonRequest).pipe(
            finalize(() => {
                this.loading = false
            }),
        )
    }

    getElectricWatersByAccomodation() {
        this.commonRequest = { id: this.selectedAccomodation.id, month: this.selectedMonth }
        return this.billService.getElectricWaterByAccomodation(this.commonRequest).pipe(
            finalize(() => {
                this.loading = false
            }),
        )
    }

    isCanDelete() {
        
    }

    checkIsRoomInputElectricWater() {
        let request: any = { id: this.electricWater.room?.id, month: this.selectedMonth }
        let result: any
        this.billService
            .checkIsRoomReturnValid(request)
            .pipe(
                finalize(() => {
                    if (result.bill) {
                        this.messageService.add({ severity: 'warn', summary: 'Cảnh báo', detail: `Phòng ${this.electricWater.room?.name} đã được tạo hoá đơn, không thể chỉnh sửa`, life: 5000 })
                    } 
                }),
            )
            .subscribe((response) => (result = response.data))
    }

    getElectricWatersByMonth() {
        this.dataLoading = true
        this.initData()
    }

    initData() {
        forkJoin({
            rooms: this.getRoomByAccomodation(),
            electricWaters: this.getElectricWatersByAccomodation(),
        })
            .pipe(
                finalize(() => {
                    this.loading = false
                    this.dataLoading = false
                }),
            )
            .subscribe((response) => {
                this.rooms = response.rooms.data
                this.electricWaters = response.electricWaters.data
            })
    }

    onSelectAccomodation() {
        this.loading = true
        this.initData()
    }

    deleteTenant(bill: ElectricWater) {
        this.deleteTenantDialog = true
        this.electricWater = { ...bill }
    }

    onEdit(num: ElectricWater) {
        let request: any = { id: num.room?.id, month: this.selectedMonth }
        let result: any
        num.loading = true
        this.billService
            .checkIsRoomReturnValid(request)
            .pipe(
                finalize(() => {
                    num.loading = false
                    if (result.bill) {
                        this.messageService.add({ severity: 'warn', summary: 'Cảnh báo', detail: `Phòng ${num.room?.name} đã được tạo hoá đơn, không thể chỉnh sửa`, life: 5000 })
                    } else {
                        this.electricWater = { ...num }
                        this.electricWaterNumForm.get('firstElectric')?.setValue(this.electricWater.firstElectric)
                        this.electricWaterNumForm.get('lastElectric')?.setValue(this.electricWater.lastElectric)
                        this.electricWaterNumForm.get('electricNum')?.setValue(this.electricWater.electricNum)
                        this.electricWaterNumForm.get('firstWater')?.setValue(this.electricWater.firstWater)
                        this.electricWaterNumForm.get('lastWater')?.setValue(this.electricWater.lastWater)
                        this.electricWaterNumForm.get('waterNum')?.setValue(this.electricWater.waterNum)
                        this.electricWaterNumForm.get('room')?.setValue(this.electricWater.room)
                        this.electricWaterNumForm.get('month')?.setValue(moment(this.electricWater.month).toDate())
                        this.roomPresent = this.electricWater.room
                        this.rooms.push(this.roomPresent)
                        this.billDialog = true
                    }
                }),
            )
            .subscribe((response) => (result = response.data))
       
    }

    onHideDialog() {
        if (this.roomPresent) {
            this.rooms = this.rooms.filter(item => item.id !== this.roomPresent.id)
        }
        this.electricWaterNumForm.reset()
    }


    hideDialog() {
        this.billDialog = false
    }

    save() {
        if (!this.electricWaterNumForm.invalid) {
            this.loading = true
            console.log('bill', this.electricWater)
            this.billService
                .saveElectricWater(this.electricWater)
                .pipe(
                    finalize(() => {
                        this.electricWater = {}
                        this.initData()
                    }),
                )
                .subscribe((data) => console.log(data))
            this.billDialog = false
        } else {
            this.electricWaterNumForm.markAllAsTouched()
        }
    }

    confirmDelete() {
        this.deleteTenantDialog = false
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains')
    }
}
