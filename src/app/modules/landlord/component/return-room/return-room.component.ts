/** @format */

import { Component, OnInit } from '@angular/core'
import { FormControl, FormGroup, Validators } from '@angular/forms'
import * as moment from 'moment'
import { MenuItem, MessageService } from 'primeng/api'
import { Table } from 'primeng/table'
import { finalize, forkJoin } from 'rxjs'
import { AuthenticationService } from 'src/app/modules/auth/service/authentication.service'
import { User } from 'src/app/modules/model/user.model'
import { Room } from '../../model/accomodation.model'
import { ElectricWater } from '../../model/electric-water.model'
import { AccomodationService } from '../../service/accomodation.service'
import { BillService } from '../../service/bill.service'
import { RoomService } from '../../service/room.service'
import { Invoice } from '../../model/bill.model'
import { AppConstant } from 'src/app/modules/common/Constants'

@Component({
    selector: 'app-return-room',
    templateUrl: './return-room.component.html',
    styleUrls: ['./return-room.component.scss'],
    providers: [MessageService],
})
export class ReturnRoomComponent implements OnInit {
    dataLoading: boolean = false
    user!: User | null
    accomodations: any[] = []
    loading: boolean = false
    checkingLoading: boolean = false
    returnRoom: any = {}
    returnRooms: any[] = []
    cols: any[] = []
    billDialog: boolean = false
    selectedAccomodation!: any
    rooms: Room[] = []
    returnRoomForm: FormGroup
    selectedMonth: Date | undefined
    isEdit: boolean = false
    invoiceDialog: boolean = false
    invoiceForm: FormGroup
    invoice: Invoice = {}
    invoices: Invoice[] = []
    items: MenuItem[] = []
    isReturnRoomValid: boolean = false
    issueLoading: boolean = false

    commonRequest!: { id: any; month: any }

    constructor(
        private auth: AuthenticationService,
        private accomodationService: AccomodationService,
        private roomService: RoomService,
        private billService: BillService,
        private messageService: MessageService,
    ) {
        this.returnRoomForm = new FormGroup({
            room: new FormControl(this.returnRoom.room, [Validators.required]),
            returnDate: new FormControl(this.returnRoom.returnDate, [Validators.required]),
        })

        this.invoiceForm = new FormGroup({
            totalService: new FormControl(this.invoice.totalService, []),
            discount: new FormControl(this.invoice.discount, [Validators.required, Validators.min(0)]),
            totalPrice: new FormControl(this.invoice.totalPrice, []),
            paidMoney: new FormControl(this.invoice.paidMoney, [Validators.required]),
            totalPayment: new FormControl(this.invoice.totalPayment, []),
            debt: new FormControl(this.invoice.debt, []),
            newDebt: new FormControl(this.invoice.newDebt, [Validators.required, Validators.min(0)]),
            description: new FormControl(this.invoice.description, []),
        })

        this.selectedMonth = moment().toDate()
    }

    ngOnInit(): void {
        this.user = this.auth.userValue
        this.getDropdownAccomodation()

        this.returnRoomForm.get('returnDate')?.valueChanges.subscribe((data) => {
            this.returnRoom.returnDate = data
            if (this.returnRoom.room && this.returnRoom.returnDate) {
                this.checkIsRoomInputElectricWater()
            }
        })
        this.returnRoomForm.get('room')?.valueChanges.subscribe((data) => {
            this.returnRoom.room = data
            if (this.returnRoom.room && this.returnRoom.returnDate) {
                this.checkIsRoomInputElectricWater()
            }
        })

        this.invoiceForm.get('totalService')?.valueChanges.subscribe((data) => {
            this.invoice.totalService = data
        })
        this.invoiceForm.get('discount')?.valueChanges.subscribe((data) => {
            this.invoice.discount = data
            if (this.invoice.totalPrice && this.invoice.discount != undefined) {
                let remain = this.invoice.totalPrice - this.invoice.discount
                this.invoiceForm.get('totalPayment')?.setValue(remain)
            }
            if (this.invoiceForm.get('newDebt')?.value < 0) {
                console.log(this.invoiceForm.get('newDebt'))
                this.invoiceForm.setErrors({ incorrect: true })
                this.invoiceForm.get('newDebt')?.markAsTouched()
            } else {
                this.invoiceForm.setErrors(null)
                this.invoiceForm.get('newDebt')?.markAsTouched()
            }
        })
        this.invoiceForm.get('totalPrice')?.valueChanges.subscribe((data) => {
            this.invoice.totalPrice = data
        })
        this.invoiceForm.get('totalPayment')?.valueChanges.subscribe((data) => {
            this.invoice.totalPayment = data
            this.invoice.paidMoney = data
            if (this.invoice.totalPayment && this.invoice.paidMoney) {
                let newDebt = this.invoice.totalPayment - this.invoice.paidMoney
                this.invoiceForm.get('newDebt')?.setValue(newDebt)
            }
        })
        this.invoiceForm.get('debt')?.valueChanges.subscribe((data) => {
            this.invoice.debt = data
        })
        this.invoiceForm.get('newDebt')?.valueChanges.subscribe((data) => {
            this.invoice.newDebt = data
        })
        this.invoiceForm.get('description')?.valueChanges.subscribe((data) => {
            this.invoice.description = data
        })
    }

    issueInvoice() {
        this.loading = true
        this.invoice.billDate = moment(new Date()).toDate()
        this.invoice.returnDate = this.returnRoom.returnDate
        this.billService
            .issueReturnInvoice(this.invoice)
            .pipe(
                finalize(() => {
                    this.hideDialog()
                    this.getReturnInvoiceByAccomodation()
                        .pipe(
                            finalize(() => {
                                this.getRoomByAccomodation().subscribe(response => this.rooms = response.data)
                                this.invoice = {}
                                this.invoiceDialog = false;
                                this.messageService.add({ severity: 'success', summary: 'Thành công', detail: 'Xuất hoá đơn thành công' })
                            }),
                        )
                        .subscribe((response) => (this.invoices = response.data))
                }),
            )
            .subscribe((response) => console.log(response))
    }

    confirmPayment(invoice: Invoice) {
        this.loading = true
        this.invoice.isPay = true
        this.billService
            .confirmPayment(invoice.id)
            .pipe(
                finalize(() => {
                    this.hideDialog()
                    this.getReturnInvoiceByAccomodation()
                        .pipe(
                            finalize(() => {
                                this.messageService.add({ severity: 'success', summary: 'Thành công', detail: 'Xuất hoá đơn thành công' })
                            }),
                        )
                        .subscribe((response) => (this.invoices = response.data))
                }),
            )
            .subscribe((response) => console.log(response))
    }

    getInvoiceByMonth() {
        this.loading = true
        let request = { id: this.selectedAccomodation.id, month: this.selectedMonth, isReturn: true }
        this.billService
            .getMonthInvoiceByAccomodation(request)
            .pipe(
                finalize(() => {
                    this.loading = false
                }),
            )
            .subscribe((response) => (this.invoices = response.data))
    }

    getReturnInvoiceByAccomodation() {
        this.loading = true
        let request = { id: this.selectedAccomodation.id, month: this.selectedMonth, isReturn: true }
        return this.billService.getMonthInvoiceByAccomodation(request).pipe(
            finalize(() => {
                this.loading = false
            }),
        )
    }

    updateInvoice() {
        if (!this.invoiceForm.invalid) {
            this.loading = true
            this.invoice.isReturnBill = true
            this.billService
                .updateInvoice(this.invoice)
                .pipe(
                    finalize(() => {
                        this.getReturnInvoiceByAccomodation()
                        .pipe(
                            finalize(() => {
                                this.getRoomByAccomodation().subscribe(response => this.rooms = response.data)
                                this.invoice = {}
                                this.invoiceDialog = false;
                                this.messageService.add({ severity: 'success', summary: 'Thành công', detail: 'Xuất hoá đơn thành công' })
                            }),
                        )
                        .subscribe((response) => (this.invoices = response.data))
                    }),
                )
                .subscribe((response) => console.log(response))
        } else {
            this.invoiceForm.markAllAsTouched()
        }
    }

    checkIsRoomInputElectricWater() {
        let request: any = { id: this.returnRoom.room.id, month: this.returnRoom.returnDate }
        let result: any
        this.loading = true
        this.billService
            .checkIsRoomReturnValid(request)
            .pipe(
                finalize(() => {
                    this.loading = false
                    if (result.bill) {
                        this.isReturnRoomValid = false
                        this.messageService.add({ severity: 'warn', summary: 'Cảnh báo', detail: `Phòng ${this.returnRoom.room.name} đã được tạo hoá đơn`, life: 5000 })
                    } else if (result.inputed) {
                        this.isReturnRoomValid = true
                        this.messageService.add({ severity: 'warn', summary: 'Cảnh báo', detail: `Phòng ${this.returnRoom.room.name} chưa được nhập chỉ số điện nước`, life: 5000 })
                    } else {
                        this.isReturnRoomValid = true
                    }
                }),
            )
            .subscribe((response) => (result = response.data))
    }

    sendInvoiceMail(invoiceId: number) {
        this.billService
            .sendInvoice(invoiceId)
            .pipe(
                finalize(() => {
                    this.messageService.add({ severity: 'success', summary: 'Thành công', detail: 'Mail đã gửi thành công' })
                }),
            )
            .subscribe((response) => console.log(response))
    }

    onDialogHide() {
        this.isEdit = false
    }

    initData() {
        forkJoin({
            rooms: this.getRoomByAccomodation(),
            invoices: this.getReturnInvoiceByAccomodation(),
        })
            .pipe(
                finalize(() => {
                    this.loading = false
                }),
            )
            .subscribe((response) => {
                this.rooms = response.rooms.data
                this.invoices = response.invoices.data
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

    openNew() {
        this.returnRoom = {}
        this.returnRoomForm.get('returnDate')?.setValue(moment(this.selectedMonth).toDate())
        this.returnRoomForm.get('room')?.setValue(null)
        this.billDialog = true
    }

    getRoomByAccomodation() {
        return this.roomService.getRoomRented(this.selectedAccomodation.id).pipe(
            finalize(() => {
                this.loading = false
            }),
        )
    }

    removeInvoice(invoiceId: number) {
        this.loading = true
        this.billService
            .removeInvoice(invoiceId)
            .pipe(
                finalize(() => {
                    this.getReturnInvoiceByAccomodation().subscribe((response) => (this.invoices = response.data))
                }),
            )
            .subscribe((response) => console.log(response))
    }

    onShowMenu(invoice: Invoice) {
        this.getMenuItems(invoice)
    }

    toggleMenu(menu: any, event: any) {
        menu.toggle(event)
    }

    getMenuItems(invoice: Invoice): MenuItem[] {
        this.items = [
            {
                icon: 'pi pi-pencil',
                label: 'Sửa hoá đơn',
                command: (e: any) => {
                    this.isEdit = true
                    this.getInvoiceDetail(e.item.data.id)
                },
            },
            {
                icon: 'pi pi-check',
                label: 'Xác nhận thanh toán',
                disabled: invoice.isPay,
                command: (e: any) => {
                    this.confirmPayment(e.item.data)
                },
            },
            {
                label: 'Gửi mail',
                icon: 'pi pi-send',
                disabled: invoice.isPay,
                command: (e) => {
                    this.sendInvoiceMail(e.item.data.id)
                },
            }
        ]
        this.items.forEach((menuItem: any) => {
            menuItem.data = invoice
        })
        return this.items
    }

    getInvoiceDetail(invoiceId: number) {
        this.loading = true
        this.billService
            .getReturnInvoiceDetail(invoiceId)
            .pipe(
                finalize(() => {
                    this.loading = false
                    this.editInvoice()
                }),
            )
            .subscribe((response) => (this.invoice = response.data))
    }

    editInvoice() {
        this.invoiceDialog = true
        this.invoiceForm.get('totalService')?.setValue(this.invoice.totalService)
        this.invoiceForm.get('description')?.setValue(this.invoice.description)
        this.invoiceForm.get('discount')?.setValue(this.invoice.discount || 0)
        this.invoiceForm.get('totalPrice')?.setValue(this.invoice.totalPrice)
        this.invoiceForm.get('paidMoney')?.setValue(this.invoice.paidMoney)
        this.invoiceForm.get('totalPayment')?.setValue(this.invoice.totalPayment)
        this.invoiceForm.get('debt')?.setValue(this.invoice.debt)
        this.invoiceForm.get('newDebt')?.setValue(this.invoice.newDebt)
        let totalPayment: number = this.invoice.totalPayment || 0
        let totalPrice: number = this.invoice.totalPrice || 0
        this.invoiceForm.get('paidMoney')?.setValidators([Validators.max(totalPayment)])
        this.invoiceForm.get('discount')?.setValidators([Validators.max(totalPrice)])
        this.invoiceForm.get('paidMoney')?.updateValueAndValidity()
        this.invoiceForm.get('discount')?.updateValueAndValidity()
    }

    onSelectAccomodation() {
        this.loading = true
        this.initData()
    }

    onHideDialog() {
        this.returnRoomForm.reset()
    }

    hideDialog() {
        this.billDialog = false
    }

    setBillField() {
        this.invoiceForm.get('totalService')?.setValue(this.invoice.totalService)
        this.invoiceForm.get('description')?.setValue(this.invoice.description)
        this.invoiceForm.get('discount')?.setValue(this.invoice.discount || 0)
        this.invoiceForm.get('totalPrice')?.setValue(this.invoice.totalPrice)
        this.invoiceForm.get('paidMoney')?.setValue(this.invoice.paidMoney)
        this.invoiceForm.get('totalPayment')?.setValue(this.invoice.totalPayment)
        this.invoiceForm.get('debt')?.setValue(this.invoice.debt)
        this.invoiceForm.get('newDebt')?.setValue(this.invoice.newDebt)
        let totalPayment: number = this.invoice.totalPayment || 0
        let totalPrice: number = this.invoice.totalPrice || 0
        this.invoiceForm.get('paidMoney')?.setValidators([Validators.max(totalPayment)])
        this.invoiceForm.get('discount')?.setValidators([Validators.max(totalPrice)])
        this.invoiceForm.get('paidMoney')?.updateValueAndValidity()
        this.invoiceForm.get('discount')?.updateValueAndValidity()
    }

    saveBill() {
        let request = { roomId: this.returnRoom.room.id, returnDate: this.returnRoom.returnDate }
        this.issueLoading = true
        this.billService
            .returnRoom(request)
            .pipe(
                finalize(() => {
                    this.invoiceDialog = true
                    this.issueLoading = false
                    this.setBillField()
                }),
            )
            .subscribe((response) => (this.invoice = response.data))
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
}
