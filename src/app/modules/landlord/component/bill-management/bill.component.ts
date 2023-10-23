import { Component, OnInit } from '@angular/core'
import { FormControl, FormGroup, Validators } from '@angular/forms'
import * as moment from 'moment'
import { MessageService } from 'primeng/api'
import { Table } from 'primeng/table'
import { finalize, forkJoin } from 'rxjs'
import { AuthenticationService } from 'src/app/modules/auth/service/authentication.service'
import { User } from 'src/app/modules/model/user.model'
import { Room } from '../../model/accomodation.model'
import { Tenant } from '../../model/tenant.model'
import { AccomodationService } from '../../service/accomodation.service'
import { RoomService } from '../../service/room.service'
import { TenantService } from '../../service/tenant.service'
import { Bill } from '../../model/bill.model'
import { BillService } from '../../service/bill.service'

@Component({
    selector: 'app-bill',
    templateUrl: './bill.component.html',
    styleUrls: ['./bill.component.scss'],
    providers: [MessageService],
})
export class BillsComponent implements OnInit {
    selectedTenant: any
    dataLoading: boolean = false
    user!: User | null
    accomodations: any[] = []
    loading: boolean = false
    bill: Bill = {}
    bills: Bill[] = []
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
            billDate: new FormControl(this.bill.billDate, [Validators.required,]),
            firstElectric: new FormControl(this.bill.firstElectric, [Validators.required]),
            lastElectric: new FormControl(this.bill.lastElectric, [Validators.required, Validators.min(this.bill.firstElectric || 0)]),
            electricNum: new FormControl(this.bill.electricNum, [Validators.required]),
            firstWater: new FormControl(this.bill.firstWater, [Validators.required]),
            lastWater: new FormControl(this.bill.lastWater, [Validators.required, Validators.min(this.bill.firstWater || 0)]),
            waterNum: new FormControl(this.bill.waterNum, [Validators.required]),
            totalPrice: new FormControl(this.bill.totalPrice, [Validators.required]),
            isPay: new FormControl(this.bill.isPay, [Validators.required]),
            createdAt: new FormControl(this.bill.createdAt, [Validators.required]),
            room: new FormControl(this.bill.room, [Validators.required]),
        })
        this.selectedMonth = moment().toDate()
    }

    ngOnInit(): void {
        this.user = this.auth.userValue
        this.getDropdownAccomodation()
        this.billForm.get('billDate')?.valueChanges.subscribe((data) => {
            this.bill.billDate = data
        })
        this.billForm.get('firstElectric')?.valueChanges.subscribe((data) => {
            this.bill.firstElectric = data
            if (this.bill.firstElectric !== undefined && this.bill.lastElectric !== undefined) {
                this.billForm.get('electricNum')?.setValue(this.bill.lastElectric - this.bill.firstElectric)
            }
        })
        this.billForm.get('lastElectric')?.valueChanges.subscribe((data) => {
            this.bill.lastElectric = data
            if (this.bill.firstElectric !== undefined && this.bill.lastElectric !== undefined) {
                this.billForm.get('electricNum')?.setValue(this.bill.lastElectric - this.bill.firstElectric)
            }
        })
        this.billForm.get('electricNum')?.valueChanges.subscribe((data) => {
            this.bill.electricNum = data
        })
        this.billForm.get('electricNum')?.disable()
        this.billForm.get('firstWater')?.valueChanges.subscribe((data) => {
            this.bill.firstWater = data
            if (this.bill.firstWater !== undefined && this.bill.lastWater !== undefined) {
                this.billForm.get('waterNum')?.setValue(this.bill.lastWater - this.bill.firstWater) 
            }
        })
        this.billForm.get('lastWater')?.valueChanges.subscribe((data) => {
            this.bill.lastWater = data
            if (this.bill.firstWater !== undefined && this.bill.lastWater !== undefined) {
                this.billForm.get('waterNum')?.setValue(this.bill.lastWater - this.bill.firstWater) 
            }
        })
        this.billForm.get('waterNum')?.valueChanges.subscribe((data) => {
            this.bill.waterNum = data
        })
        this.billForm.get('waterNum')?.disable()
        this.billForm.get('totalPrice')?.valueChanges.subscribe((data) => {
            this.bill.totalPrice = data
        })
        this.billForm.get('isPay')?.valueChanges.subscribe((data) => {
            this.bill.isPay = data
        })
        this.billForm.get('createdAt')?.disable()
        this.billForm.get('room')?.valueChanges.subscribe((data) => {
            this.bill.room = data
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
        this.bill = {}
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
            .subscribe((response) => (this.bills = response.data))
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
                this.bills = response.bills.data
            })
    }

    onSelectAccomodation() {
        this.loading = true
        this.getRoomAndTenantData()
    }

    deleteTenant(bill: Bill) {
        this.deleteTenantDialog = true
        this.bill = { ...bill }
    }

    editTenant(bill: Bill) {
        this.bill = { ...bill }
        this.billForm.get('billDate')?.setValue((moment(this.bill.billDate).toDate()))
        this.billForm.get('firstElectric')?.setValue(this.bill.firstElectric)
        this.billForm.get('lastElectric')?.setValue(this.bill.lastElectric)
        this.billForm.get('electricNum')?.setValue(this.bill.electricNum)
        this.billForm.get('firstWater')?.setValue(this.bill.firstWater)
        this.billForm.get('lastWater')?.setValue(this.bill.lastWater)
        this.billForm.get('waterNum')?.setValue(this.bill.waterNum)
        this.billForm.get('totalPrice')?.setValue(this.bill.totalPrice)
        this.billForm.get('isPay')?.setValue(this.bill.isPay)
        this.billForm.get('createdAt')?.setValue(this.bill.createdAt)
        this.billForm.get('room')?.setValue(this.bill.room)
        this.billDialog = true
    }

    hideDialog() {
        this.billDialog = false
    }

    saveBill() {
        this.loading = true
        console.log('bill', this.bill)
        this.billService
            .saveBill(this.bill)
            .pipe(
                finalize(() => {
                    this.bill = {}
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
