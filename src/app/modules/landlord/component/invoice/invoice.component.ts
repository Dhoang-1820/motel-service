import { Component, OnInit } from '@angular/core'
import { MessageService } from 'primeng/api'
import { Table } from 'primeng/table'
import { finalize, findIndex } from 'rxjs'
import { AuthenticationService } from 'src/app/modules/auth/service/authentication.service'
import { User } from 'src/app/modules/model/user.model'
import { Room } from '../../model/accomodation.model'
import { AccomodationService } from '../../service/accomodation.service'
import { RoomService } from '../../service/room.service'
import { BillService } from '../../service/bill.service'
import * as moment from 'moment'

@Component({
    selector: 'app-invoice',
    templateUrl: './invoice.component.html',
    styleUrls: ['./invoice.component.scss'],
    providers: [MessageService],
})
export class InvoiceComponent implements OnInit {
    productDialog: boolean = false
    otherFeesDialog: boolean = false
    deleteProductDialog: boolean = false
    deleteProductsDialog: boolean = false
    accomodations: any[] = []
    selectedAccomodation!: any

    rooms: Room[] = []
    room: any = {}
    selectedProducts: Room[] = []
    submitted: boolean = false
    cols: any[] = []
    statuses: any[] = []
    rowsPerPageOptions = [5, 10, 20]
    selectedService: string[] = []
    user!: User | null
    dataLoading: boolean = false
    loading: boolean = false
    selectedMonth: Date | undefined

    constructor(
        private accomodationService: AccomodationService,
        private auth: AuthenticationService,
        private roomService: RoomService,
        private billService: BillService,
        private messageService: MessageService,
    ) {
        this.cols = [
            { field: 'feeName', header: 'Tên dịch vụ' },
            { field: 'unit', header: 'Đơn vị' },
            { field: 'price', header: 'Đơn giá' },
            { field: 'quantity', header: 'Số lượng' },
        ]
        this.selectedMonth = moment().toDate()
    }

    ngOnInit() {
        this.user = this.auth.userValue
        this.getDropdownAccomodation()
    }

    openNew() {
        this.room = {}
        this.submitted = false
        this.productDialog = true
    }

    getDropdownAccomodation() {
        this.loading = true
        this.accomodationService
            .getDropdownAccomodation(this.user?.id)
            .pipe(
                finalize(() => {
                    this.selectedAccomodation = this.accomodations[0]
                    this.loading = false
                    this.getInvoiceByAccomodation()
                }),
            )
            .subscribe((response) => (this.accomodations = response.data))
    }

    getInvoiceByAccomodation() {
        this.loading = true
        let request: { accomodationId: any; month: any } = { accomodationId: this.selectedAccomodation.id, month: this.selectedMonth }
        console.log(request)
        this.billService
            .getMonthInvoiceByAccomodation(request)
            .pipe(
                finalize(() => {
                    this.loading = false
                }),
            )
            .subscribe((response) => (this.rooms = response.data))
    }

    getInvoiceByMonth() {
        this.loading = true
        let request: { accomodationId: any; month: any } = { accomodationId: this.selectedAccomodation.id, month: this.selectedMonth }
        this.billService
            .getMonthInvoiceByAccomodation(request)
            .pipe(
                finalize(() => {
                    this.loading = false
                }),
            )
            .subscribe((response) => (this.rooms = response.data))
    }

    changePaymentStatus() {
        this.dataLoading = true
        this.billService
            .savePaymentConfirmation(this.room.billId)
            .pipe(
                finalize(() => {
                    this.productDialog = false
                    this.getInvoiceByAccomodation()
                    this.dataLoading = false
                }),
            )
            .subscribe((data) => console.log(data))
    }

    onSelectAccomodation() {
        this.getInvoiceByAccomodation()
    }

    deleteSelectedProducts() {
        this.deleteProductsDialog = true
    }

    editProduct(room: Room) {
        this.room = { ...room }
        this.productDialog = true
    }

    deleteProduct(room: Room) {
        this.deleteProductDialog = true
        this.room = { ...room }
    }

    confirmDeleteSelected() {
        this.deleteProductsDialog = false
        this.rooms = this.rooms.filter((val) => !this.selectedProducts.includes(val))
        this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Products Deleted', life: 3000 })
        this.selectedProducts = []
    }

    confirmDelete() {
        this.deleteProductDialog = false
        this.roomService
            .removeRoom(this.room.id)
            .pipe(
                finalize(() => {
                    this.rooms = this.rooms.filter((val) => val.id !== this.room.id)
                    this.room = {}
                    this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Accomodation Deleted', life: 3000 })
                }),
            )
            .subscribe((data) => console.log(data))
    }

    hideDialog() {
        this.productDialog = false
        this.submitted = false
        console.log(this.room)
    }

    sendInvoice() {
        this.loading = true
        let request: {roomId: any, billId: any, month: any} = {roomId: this.room.id, billId: this.room.billId, month: this.selectedMonth}
        this.billService
            .sendInvoice(request)
            .pipe(
                finalize(() => {
                    this.submitted = false
                    this.getDropdownAccomodation()
                }),
            )
            .subscribe((data) => console.log(data))
        this.productDialog = false
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains')
    }
}
