import { Component, OnInit } from '@angular/core'
import { FormControl, FormGroup, Validators } from '@angular/forms'
import * as moment from 'moment'
import { MessageService } from 'primeng/api'
import { Table } from 'primeng/table'
import { finalize, forkJoin } from 'rxjs'
import { AuthenticationService } from 'src/app/modules/auth/service/authentication.service'
import { User } from 'src/app/modules/model/user.model'
import { Room } from '../../model/accomodation.model'
import { Bill } from '../../model/bill.model'
import { AccomodationService } from '../../service/accomodation.service'
import { BillService } from '../../service/bill.service'
import { RoomService } from '../../service/room.service'
import { ElectricWater } from '../../model/electric-water.model'

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
    selectedRoom: any
    billForm: FormGroup
    selectedMonth: Date | undefined

    constructor(
        private auth: AuthenticationService,
        private accomodationService: AccomodationService,
        private roomService: RoomService,
        private billService: BillService,
    ) {
        this.billForm = new FormGroup({
            firstElectric: new FormControl(this.electricWater.firstElectric, [Validators.required]),
            lastElectric: new FormControl(this.electricWater.lastElectric, [Validators.required]),
            electricNum: new FormControl(this.electricWater.electricNum, [Validators.required]),
            firstWater: new FormControl(this.electricWater.firstWater, [Validators.required]),
            lastWater: new FormControl(this.electricWater.lastWater, [Validators.required]),
            waterNum: new FormControl(this.electricWater.waterNum, [Validators.required]),
            createdAt: new FormControl(this.electricWater.createdAt, [Validators.required]),
            room: new FormControl(this.electricWater.room, [Validators.required]),
        })
        this.selectedMonth = moment().toDate()
    }

    ngOnInit(): void {
        this.user = this.auth.userValue
        this.getDropdownAccomodation()

        this.billForm.get('firstElectric')?.valueChanges.subscribe((data) => {
            this.electricWater.firstElectric = data
            // if (this.electricWater.firstElectric !== undefined && this.electricWater.lastElectric !== undefined) {
            //     this.billForm.get('electricNum')?.setValue(this.electricWater.lastElectric - this.electricWater.firstElectric)
            // }
        })
        this.billForm.get('lastElectric')?.valueChanges.subscribe((data) => {
            this.electricWater.lastElectric = data
            if (this.electricWater.firstElectric !== undefined && this.electricWater.lastElectric !== undefined) {
                // this.billForm.get('electricNum')?.setValue(this.electricWater.lastElectric - this.electricWater.firstElectric)
            }
        })
        this.billForm.get('electricNum')?.valueChanges.subscribe((data) => {
            this.electricWater.electricNum = data
        })
        this.billForm.get('electricNum')?.disable()
        this.billForm.get('firstWater')?.valueChanges.subscribe((data) => {
            this.electricWater.firstWater = data
            if (this.electricWater.firstWater !== undefined && this.electricWater.lastWater !== undefined) {
                // this.billForm.get('waterNum')?.setValue(this.electricWater.lastWater - this.electricWater.firstWater) 
            }
        })
        this.billForm.get('lastWater')?.valueChanges.subscribe((data) => {
            this.electricWater.lastWater = data
            if (this.electricWater.firstWater !== undefined && this.electricWater.lastWater !== undefined) {
                // this.billForm.get('waterNum')?.setValue(this.electricWater.lastWater - this.electricWater.firstWater) 
            }
        })
        this.billForm.get('waterNum')?.valueChanges.subscribe((data) => {
            this.electricWater.waterNum = data
        })
        this.billForm.get('waterNum')?.disable()
        this.billForm.get('createdAt')?.disable()
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
        this.billForm.get('billDate')?.setValue(moment().toDate())
        this.billForm.get('firstElectric')?.setValue(0)
        this.billForm.get('lastElectric')?.setValue(0)
        this.billForm.get('electricNum')?.setValue(0)
        this.billForm.get('firstWater')?.setValue(0)
        this.billForm.get('lastWater')?.setValue(0)
        this.billForm.get('waterNum')?.setValue(0)
        this.billForm.get('totalPrice')?.setValue(0)
        this.billForm.get('isPay')?.setValue(false)
        this.billForm.get('createdAt')?.setValue('')
        this.billForm.get('room')?.setValue('')
        this.billDialog = true
    }

    getRoomByAccomodation() {
        return this.roomService.getRoomDropDown(this.selectedAccomodation.id).pipe(
            finalize(() => {
                this.loading = false
            }),
        )
    }

    getBillsByAccomodation() {
        let request: { accomodationId: any; month: any } = { accomodationId: this.selectedAccomodation.id, month: this.selectedMonth }
        return this.billService.getBillsMonthByAccomodation(request).pipe(
            finalize(() => {
                this.loading = false
            }),
        )
    }

    getBillsByMonth() {
        this.dataLoading = true;
        let request: { accomodationId: any; month: any } = { accomodationId: this.selectedAccomodation.id, month: this.selectedMonth }
        this.billService
            .getBillsMonthByAccomodation(request)
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
            bills: this.getBillsByAccomodation(),
        })
            .pipe(
                finalize(() => {
                    this.loading = false
                }),
            )
            .subscribe((response) => {
                this.rooms = response.rooms.data
                this.electricWaters = response.bills.data
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
        this.billForm.get('createdAt')?.setValue(this.electricWater.createdAt)
        this.billForm.get('room')?.setValue(this.electricWater.room)
        this.billDialog = true
    }

    hideDialog() {
        this.billDialog = false
    }

    saveBill() {
        this.loading = true
        console.log('bill', this.electricWater)
        this.billService
            .saveBill(this.electricWater)
            .pipe(
                finalize(() => {
                    this.electricWater = {}
                    this.getRoomAndTenantData()
                }),
            )
            .subscribe((data) => console.log(data))
        this.billDialog = false
    }

    confirmDelete() {
        this.deleteTenantDialog = false
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains')
    }
}
