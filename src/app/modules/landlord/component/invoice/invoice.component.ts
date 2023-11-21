/** @format */

import { Component, OnInit } from '@angular/core'
import { FormControl, FormGroup, Validators } from '@angular/forms'
import { Packer } from 'docx'
import * as saveAs from 'file-saver'
import * as moment from 'moment'
import { MenuItem, MessageService } from 'primeng/api'
import { Table } from 'primeng/table'
import { finalize, forkJoin } from 'rxjs'
import { AuthenticationService } from 'src/app/modules/auth/service/authentication.service'
import { AppConstant } from 'src/app/modules/common/Constants'
import { User } from 'src/app/modules/model/user.model'
import { Invoice } from '../../model/bill.model'
import { AccomodationService } from '../../service/accomodation.service'
import { BillService } from '../../service/bill.service'
import { DocumentCreator } from '../../service/docx.service'
import { UserService } from '../../service/user.service'

@Component({
    selector: 'app-invoice',
    templateUrl: './invoice.component.html',
    styleUrls: ['./invoice.component.scss'],
    providers: [MessageService],
})
export class InvoiceComponent implements OnInit {
    invoiceDialog: boolean = false

    accomodations: any[] = []
    selectedAccomodation!: any

    invoices: Invoice[] = []
    invoice: Invoice = {}
    rowsPerPageOptions = [5, 10, 20]
    user!: User | null
    dataLoading: boolean = false
    loading: boolean = false
    selectedMonth: Date | undefined
    invoiceForm: FormGroup
    issueRequest!: { roomId: any; month?: Date }
    getInvoiceRequest!: { id: any; month: any }
    isEdit: boolean = false
    preMonth: Date
    confirmPaymentDialog: boolean = false
    items: MenuItem[] = []

    confirmInvoiceForm: FormGroup
    paidMoney: number = 0
    debt: number = 0

    constructor(
        private accomodationService: AccomodationService,
        private auth: AuthenticationService,
        private billService: BillService,
        private userService: UserService,
        private messageService: MessageService,
    ) {
        this.selectedMonth = moment().toDate()
        this.preMonth = moment(this.selectedMonth).subtract(1, 'months').endOf('month').toDate()

        this.invoiceForm = new FormGroup({
            totalService: new FormControl(this.invoice.totalService, []),
            discount: new FormControl(this.invoice.discount, [Validators.required, Validators.min(0)]),
            totalPrice: new FormControl(this.invoice.totalPrice, []),
            paidMoney: new FormControl(this.invoice.paidMoney, [Validators.required]),
            totalPayment: new FormControl(this.invoice.totalPayment, []),
            debt: new FormControl(this.invoice.debt, []),
            newDebt: new FormControl(this.invoice.newDebt, []),
            description: new FormControl(this.invoice.description, []),
        })

        this.confirmInvoiceForm = new FormGroup({
            paidMoney: new FormControl(this.paidMoney, [Validators.required]),
            debt: new FormControl(this.debt, [Validators.required]),
        })
    }

    ngOnInit() {
        this.user = this.auth.userValue
        this.getDropdownAccomodation()

        this.confirmInvoiceForm.get('paidMoney')?.valueChanges.subscribe((data) => {
            if (data) {
                this.paidMoney = data
                if (this.invoice.paidMoney) {
                    let result = this.invoice.paidMoney - this.paidMoney
                    if (result < 0 || result > this.invoice.paidMoney) {
                        this.confirmInvoiceForm.get('paidMoney')?.setErrors({ invalid: true })
                    } else {
                        this.confirmInvoiceForm.get('debt')?.setValue(result)
                    }
                }
            }
        })

        this.confirmInvoiceForm.get('debt')?.valueChanges.subscribe((data) => {
            this.debt = data
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
            if (this.invoice.totalPayment && this.invoice.paidMoney) {
                let newDebt = this.invoice.totalPayment - this.invoice.paidMoney
                this.invoiceForm.get('newDebt')?.setValue(newDebt)
            }
            this.invoiceForm.get('paidMoney')?.setValue(this.invoice.totalPayment)
        })
        this.invoiceForm.get('paidMoney')?.valueChanges.subscribe((data) => {
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

    openNew() {
        this.invoice = {}
        this.invoiceDialog = true
    }

    onShowMenu(invoice: Invoice) {
        this.getMenuItems(invoice)
    }

    getMenuItems(invoice: Invoice): MenuItem[] {
        this.items = [
            {
                icon: 'pi pi-info-circle',
                label: 'Xem chi tiết hoá đơn',
                command: (e: any) => {
                    this.isEdit = true
                    this.getInvoiceDetail(e.item.data.id)
                },
            },
            {
                icon: 'pi pi-print',
                label: 'In hoá đơn',
                command: (e: any) => {
                    this.printInvoice(e.item.data.id)
                },
            },
            {
                icon: 'pi pi-check',
                label: 'Xác nhận thanh toán',
                disabled: invoice.isPay,
                command: (e: any) => {
                    this.invoice = e.item.data
                    this.onConfirmPayment()
                },
            },
            {
                label: 'Gửi mail',
                icon: 'pi pi-send',
                disabled: invoice.isPay,
                command: (e) => {
                    this.sendInvoiceMail(e.item.data.id)
                },
            },
            {
                label: 'Xoá',
                icon: 'pi pi-trash',
                command: (e) => {
                    this.removeInvoice(e.item.data.id)
                },
            },
        ]
        this.items.forEach((menuItem: any) => {
            menuItem.data = invoice
        })
        return this.items
    }

    initPrintData(invoiceId: any) {
        this.loading = true
        let request: { id: number; month?: Date } = { id: invoiceId, month: this.selectedMonth }
        return forkJoin({
            invoice: this.billService.getInvoiceDetail(request),
            landlord: this.userService.getUserByUserId(this.user?.id),
        })
    }

    printInvoice(invoiceId: any) {
        let invoice: any
        let lanlord: any
        this.initPrintData(invoiceId)
            .pipe(
                finalize(() => {
                    console.log(invoice)
                    this.loading = false

                    let services: { name?: string; quantity?: any; price?: any }[] = []
                    let electricsWaterNum: { name?: string; firstNum?: any; lastNum?: any; quantity?: any; price?: any }[] = []

                    invoice.service?.forEach((item: any) => {
                        if (item.electricNum !== null) {
                            electricsWaterNum.push({
                                name: 'Tiền điện',
                                firstNum: item.firstElectricNum,
                                lastNum: item.lastElectricNum,
                                price: item.totalPrice,
                                quantity: item.electricNum,
                            })
                        } else if (item.waterNum !== null) {
                            electricsWaterNum.push({
                                name: 'Tiền nước',
                                firstNum: item.firstWaterNum,
                                lastNum: item.lastWaterNum,
                                price: item.totalPrice,
                                quantity: item.waterNum,
                            })
                        } else {
                            services.push({ name: item.serviceName, price: item.totalPrice, quantity: item.quantity })
                        }
                    })
                    const month = moment(invoice.billDate).format('MM/YYYY')
                    const debtMonth = moment(this.preMonth).format('MM/YYYY')
                    let printData: any = {
                        services,
                        electricsWaterNum,
                        roomName: invoice.room?.name,
                        month,
                        totalService: invoice.totalService,
                        debtMonth,
                        debt: invoice.debt,
                        totalPrice: invoice.totalPrice,
                        discount: invoice.discount,
                        totalPayment: invoice.totalPayment,
                        paidMoney: invoice.paidMoney,
                        banks: lanlord.bankAccounts,
                    }

                    const documentCreator = new DocumentCreator()
                    const doc = documentCreator.createInvoice(printData)

                    console.log('printData',printData)

                    Packer.toBlob(doc).then((blob) => {
                        console.log(blob)
                        saveAs(blob, 'example.docx')
                        console.log('Document created successfully')
                    })
                }),
            )
            .subscribe((response) => {
                lanlord = response.landlord.data
                invoice = response.invoice.data
            })
    }

    toggleMenu(menu: any, event: any) {
        menu.toggle(event)
    }

    onDialogHide() {
        this.isEdit = false
    }

    getDropdownAccomodation() {
        this.loading = true
        this.accomodationService
            .getDropdownAccomodation(this.user?.id)
            .pipe(
                finalize(() => {
                    this.selectedAccomodation = this.accomodations[0]
                    this.loading = false
                    this.getInvoiceByAccomodation().subscribe((response) => (this.invoices = response.data))
                }),
            )
            .subscribe((response) => (this.accomodations = response.data))
    }

    getInvoiceByAccomodation() {
        this.loading = true
        this.getInvoiceRequest = { id: this.selectedAccomodation.id, month: this.selectedMonth }
        return this.billService.getMonthInvoiceByAccomodation(this.getInvoiceRequest).pipe(
            finalize(() => {
                this.loading = false
            }),
        )
    }

    getInvoiceByMonth() {
        this.loading = true
        this.getInvoiceRequest = { id: this.selectedAccomodation.id, month: this.selectedMonth }
        this.preMonth = moment(this.selectedMonth).subtract(1, 'months').endOf('month').toDate()
        this.billService
            .getMonthInvoiceByAccomodation(this.getInvoiceRequest)
            .pipe(
                finalize(() => {
                    this.loading = false
                }),
            )
            .subscribe((response) => (this.invoices = response.data))
    }

    onSelectAccomodation() {
        this.getInvoiceByAccomodation().subscribe((response) => (this.invoices = response.data))
    }

    getInvoicePreview(invoice: Invoice) {
        invoice.loading = true
        this.issueRequest = { roomId: invoice.room?.id, month: this.selectedMonth }
        this.billService
            .getPreviewInvoice(this.issueRequest)
            .pipe(
                finalize(() => {
                    invoice.loading = false
                    this.editInvoice()
                }),
            )
            .subscribe((response) => (this.invoice = response.data))
    }

    issueInvoice() {
        this.loading = true
        this.invoice.billDate = moment(new Date()).toDate()
        this.billService
            .issueInvoice(this.invoice)
            .pipe(
                finalize(() => {
                    this.hideDialog()
                    this.getInvoiceByAccomodation()
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

    sendInvoiceMail(invoiceId: number) {
        this.loading = true
        let request: { id: number; month?: Date } = { id: invoiceId, month: this.selectedMonth }
        this.billService
            .sendInvoice(request)
            .pipe(
                finalize(() => {
                    this.loading = false
                    this.messageService.add({ severity: 'success', summary: 'Thành công', detail: 'Mail đã gửi thành công' })
                }),
            )
            .subscribe((response) => console.log(response))
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

    getInvoiceDetail(invoiceId: number) {
        this.loading = true
        let request: { id: number; month?: Date } = { id: invoiceId, month: this.selectedMonth }
        this.billService
            .getInvoiceDetail(request)
            .pipe(
                finalize(() => {
                    this.loading = false
                    console.log(this.invoice)
                    this.editInvoice()
                }),
            )
            .subscribe((response) => (this.invoice = response.data))
    }

    removeInvoice(invoiceId: number) {
        this.loading = true
        this.billService
            .removeInvoice(invoiceId)
            .pipe(
                finalize(() => {
                    this.getInvoiceByAccomodation().subscribe((response) => (this.invoices = response.data))
                }),
            )
            .subscribe((response) => console.log(response))
    }

    hideDialog() {
        this.invoiceDialog = false
    }

    confirmPayment() {
        this.loading = true
        let request: { invoiceId: any; paidMoney: number; debt: number } = { invoiceId: this.invoice.id, paidMoney: this.paidMoney, debt: this.debt }
        this.billService
            .confirmPayment(request)
            .pipe(
                finalize(() => {
                    this.hideDialog()
                    this.getInvoiceByAccomodation()
                        .pipe(
                            finalize(() => {
                                this.confirmPaymentDialog = false
                                this.messageService.add({ severity: 'success', summary: 'Thành công', detail: 'Xuất hoá đơn thành công' })
                            }),
                        )
                        .subscribe((response) => (this.invoices = response.data))
                }),
            )
            .subscribe((response) => console.log(response))
    }

    onConfirmPayment() {
        this.confirmPaymentDialog = true
        this.confirmInvoiceForm.get('paidMoney')?.setValue(this.invoice.paidMoney)
        this.confirmInvoiceForm.get('debt')?.setValue(0)
    }

    updateInvoice() {
        if (!this.invoiceForm.invalid) {
            this.loading = true
            this.billService
                .updateInvoice(this.invoice)
                .pipe(
                    finalize(() => {
                        this.hideDialog()
                        this.getInvoiceByAccomodation()
                            .pipe(
                                finalize(() => {
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
