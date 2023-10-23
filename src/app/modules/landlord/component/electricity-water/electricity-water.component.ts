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
    billForm: FormGroup
    selectedMonth: Date | undefined

    commonRequest!: { accomodationId: any; month: any }

    constructor(
        private auth: AuthenticationService,
        private accomodationService: AccomodationService,
        private roomService: RoomService,
        private billService: BillService,
    ) {
        this.billForm = new FormGroup({
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

        this.billForm.get('firstElectric')?.valueChanges.subscribe((data) => {
            this.electricWater.firstElectric = data
            if (this.electricWater.firstElectric !== undefined && this.electricWater.lastElectric !== undefined) {
                this.billForm.get('electricNum')?.setValue(this.electricWater.lastElectric - this.electricWater.firstElectric)
            }
            if (this.electricWater.electricNum && this.electricWater.electricNum < 0) {
                this.billForm.get('electricNum')?.setErrors({ electricInvalid: true })
            }
        })
        this.billForm.get('lastElectric')?.valueChanges.subscribe((data) => {
            this.electricWater.lastElectric = data
            if (this.electricWater.firstElectric !== undefined && this.electricWater.lastElectric !== undefined) {
                this.billForm.get('electricNum')?.setValue(this.electricWater.lastElectric - this.electricWater.firstElectric)
            }
            if (this.electricWater.electricNum && this.electricWater.electricNum < 0) {
                this.billForm.get('electricNum')?.setErrors({ electricInvalid: true })
            }
        })
        this.billForm.get('electricNum')?.valueChanges.subscribe((data) => {
            this.electricWater.electricNum = data
        })
        this.billForm.get('firstWater')?.valueChanges.subscribe((data) => {
            this.electricWater.firstWater = data
            if (this.electricWater.firstWater !== undefined && this.electricWater.lastWater !== undefined) {
                this.billForm.get('waterNum')?.setValue(this.electricWater.lastWater - this.electricWater.firstWater)
            }
            if (this.electricWater.waterNum && this.electricWater.waterNum < 0) {
                this.billForm.get('waterNum')?.setErrors({ waterInvalid: true })
            }
        })
        this.billForm.get('lastWater')?.valueChanges.subscribe((data) => {
            this.electricWater.lastWater = data
            if (this.electricWater.firstWater !== undefined && this.electricWater.lastWater !== undefined) {
                this.billForm.get('waterNum')?.setValue(this.electricWater.lastWater - this.electricWater.firstWater)
            }
            if (this.electricWater.waterNum && this.electricWater.waterNum < 0) {
                this.billForm.get('waterNum')?.setErrors({ waterInvalid: true })
            }
        })
        this.billForm.get('waterNum')?.valueChanges.subscribe((data) => {
            this.electricWater.waterNum = data
        })
        this.billForm.get('month')?.valueChanges.subscribe((data) => {
            this.electricWater.month = data
        })
        this.billForm.get('room')?.valueChanges.subscribe((data) => {
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
                    this.getRoomAndTenantData()
                }),
            )
            .subscribe((response) => (this.accomodations = response.data))
    }

    openNew() {
        this.electricWater = {}
        this.billForm.get('month')?.setValue(moment(this.selectedMonth).toDate())
        this.billForm.get('firstElectric')?.setValue(null)
        this.billForm.get('lastElectric')?.setValue(null)
        this.billForm.get('electricNum')?.setValue(null)
        this.billForm.get('firstWater')?.setValue(null)
        this.billForm.get('lastWater')?.setValue(null)
        this.billForm.get('waterNum')?.setValue(null)
        this.billForm.get('totalPrice')?.setValue(null)
        this.billForm.get('isPay')?.setValue(false)
        this.billForm.get('room')?.setValue({})
        this.billDialog = true
    }

    getRoomByAccomodation() {
        this.commonRequest = { accomodationId: this.selectedAccomodation.id, month: this.selectedMonth }
        return this.roomService.getRoomNoElectricWater(this.commonRequest).pipe(
            finalize(() => {
                this.loading = false
            }),
        )
    }

    getElectricWatersByAccomodation() {
        this.commonRequest = { accomodationId: this.selectedAccomodation.id, month: this.selectedMonth }
        return this.billService.getElectricWaterByAccomodation(this.commonRequest).pipe(
            finalize(() => {
                this.loading = false
            }),
        )
    }

    getElectricWatersByMonth() {
        this.dataLoading = true
        this.commonRequest = { accomodationId: this.selectedAccomodation.id, month: this.selectedMonth }
        this.billService
            .getElectricWaterByAccomodation(this.commonRequest)
            .pipe(
                finalize(() => {
                    this.dataLoading = false
                }),
            )
            .subscribe((response) => (this.electricWaters = response.data))
    }

    getRoomAndTenantData() {
        forkJoin({
            rooms: this.getRoomByAccomodation(),
            electricWaters: this.getElectricWatersByAccomodation(),
        })
            .pipe(
                finalize(() => {
                    this.loading = false
                }),
            )
            .subscribe((response) => {
                this.rooms = response.rooms.data
                this.electricWaters = response.electricWaters.data
            })
    }

    onSelectAccomodation() {
        this.loading = true
        this.getRoomAndTenantData()
    }

    deleteTenant(bill: ElectricWater) {
        this.deleteTenantDialog = true
        this.electricWater = { ...bill }
    }

    editTenant(bill: ElectricWater) {
        this.electricWater = { ...bill }
        this.billForm.get('firstElectric')?.setValue(this.electricWater.firstElectric)
        this.billForm.get('lastElectric')?.setValue(this.electricWater.lastElectric)
        this.billForm.get('electricNum')?.setValue(this.electricWater.electricNum)
        this.billForm.get('firstWater')?.setValue(this.electricWater.firstWater)
        this.billForm.get('lastWater')?.setValue(this.electricWater.lastWater)
        this.billForm.get('waterNum')?.setValue(this.electricWater.waterNum)
        this.billForm.get('room')?.setValue(this.electricWater.room)
        this.billForm.get('month')?.setValue(moment(this.electricWater.month).toDate())
        this.roomPresent = this.electricWater.room
        this.rooms.push(this.roomPresent)
        this.billDialog = true
    }

    onHideDialog() {
        if (this.roomPresent) {
            this.rooms = this.rooms.filter(item => item.id !== this.roomPresent.id)
        }
        this.billForm.reset()
    }


    hideDialog() {
        this.billDialog = false
    }

    saveBill() {
        if (!this.billForm.invalid) {
            this.loading = true
            console.log('bill', this.electricWater)
            this.billService
                .saveElectricWater(this.electricWater)
                .pipe(
                    finalize(() => {
                        this.electricWater = {}
                        this.getRoomAndTenantData()
                    }),
                )
                .subscribe((data) => console.log(data))
            this.billDialog = false
        } else {
            this.billForm.markAllAsTouched()
        }
    }

    confirmDelete() {
        this.deleteTenantDialog = false
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains')
    }
}
