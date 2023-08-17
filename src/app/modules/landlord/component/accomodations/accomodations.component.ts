import { Component, OnInit } from '@angular/core'
import { OtherFee, Accomodation } from '../../model/accomodation.model'
import { MessageService } from 'primeng/api'
import { AccomodationService } from '../../service/accomodation.service'
import { Table } from 'primeng/table'
import { finalize } from 'rxjs'
import { User } from 'src/app/modules/model/user.model'
import { AuthenticationService } from 'src/app/modules/auth/service/authentication.service'
import { OtherFeeService } from '../../service/other-fee.service'

@Component({
    selector: 'app-accomodations',
    templateUrl: './accomodations.component.html',
    styleUrls: ['./accomodations.component.scss'],
    providers: [MessageService],
})
export class AccomodationsComponent implements OnInit {
    productDialog: boolean = false
    otherFeesDialog: boolean = false
    deleteProductDialog: boolean = false
    deleteProductsDialog: boolean = false
    accomodations: Accomodation[] = []
    accomodation: Accomodation = {}
    selectedProducts: Accomodation[] = []
    submitted: boolean = false
    rowsPerPageOptions = [5, 10, 20]
    otherFees: OtherFee[] = []
    otherFee: OtherFee = {}
    selectedService: any[] = []
    selectedOtherFees: any[] = []
    dataLoading: boolean = false
    loading: boolean = false
    user!: User | null

    constructor(
        private accomodationService: AccomodationService,
        private messageService: MessageService,
        private auth: AuthenticationService,
        private otherFeeService: OtherFeeService,
    ) {}

    ngOnInit() {
        this.selectedService = ['waterPrice', 'electricPrice']
        this.user = this.auth.userValue
        this.getAccomodationsByUser().subscribe((result) => (this.accomodations = result.data))
    }

    getAccomodationsByUser() {
        this.dataLoading = true
        return this.accomodationService
            .getAccomodationByUserId(this.user?.id)
            .pipe(
                finalize(() => {
                    this.dataLoading = false
                    this.fillOtherFee()
                }),
            )
    }

    openOtherFee() {
        this.otherFee = {}
        this.otherFeesDialog = true
    }

    hideOtherFeeDialog() {
        this.otherFeesDialog = false
        this.submitted = false
    }

    test() {
        console.log('test', this.selectedOtherFees)
    }

    fillOtherFee() {
        this.selectedOtherFees = []
        this.accomodations.forEach((item) => {
            item.otherFees?.forEach((fee) => {
                this.selectedOtherFees.push(fee)
            })
        })
    }

    saveOtherFee() {
        if (this.accomodation.id) {
            let otherFeeResponse: any;
            this.loading = true
            this.otherFee.accomodationId = this.accomodation.id
            this.otherFeeService
                .saveOtherFee(this.otherFee)
                .pipe(
                    finalize(() => {
                        if (this.accomodation.otherFees) {
                            if (this.otherFee.id) {
                                let id = this.accomodation.otherFees.findIndex((item) => item.id === otherFeeResponse.id)
                                this.accomodation.otherFees[id] = otherFeeResponse
                            } else {
                                this.accomodation.otherFees?.push(otherFeeResponse)
                            }   
                        }
                        this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Chỉnh sửa thành công', life: 3000 })
                        this.loading = false
                        this.otherFeesDialog = false
                        this.otherFee = {}
                    })
                )
                .subscribe((response) => otherFeeResponse = response.data)
        } else {
            this.otherFees.push(this.otherFee)
            if (this.accomodation.otherFees) {
                this.accomodation.otherFees?.push(this.otherFee)
            } else {
                this.accomodation.otherFees = []
                this.accomodation.otherFees?.push(this.otherFee)
            }
            this.selectedOtherFees.push(this.otherFee)
        }
       
        this.otherFeesDialog = false
    }

    editOtherFee(otherFee: OtherFee) {
        this.otherFee = { ...otherFee }
        this.otherFeesDialog = true
    }

    deleteOtherFee(otherFee: OtherFee) {
        this.otherFee = { ...otherFee }
        if (this.otherFee.id) {
            this.loading = true
            this.otherFeeService
                .deleteOtherFee(this.otherFee.id)
                .pipe(
                    finalize(() => {
                        this.accomodation.otherFees = this.accomodation.otherFees?.filter((val) => val.id !== this.otherFee.id)
                        this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Xoá thành công', life: 3000 })
                        this.loading = false
                    }),
                )
                .subscribe((data) => console.log(data))
        }
    }

    openNew() {
        this.accomodation = {}
        this.submitted = false
        this.productDialog = true
    }

    deleteSelectedProducts() {
        this.deleteProductsDialog = true
    }

    editProduct(accomodation: Accomodation) {
        this.accomodation = { ...accomodation }
        this.productDialog = true
    }

    deleteProduct(accomodation: Accomodation) {
        this.deleteProductDialog = true
        this.accomodation = { ...accomodation }
    }

    confirmDeleteSelected() {
        this.deleteProductsDialog = false
        this.accomodations = this.accomodations.filter((val) => !this.selectedProducts.includes(val))
        this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Products Deleted', life: 3000 })
        this.selectedProducts = []
    }

    confirmDelete() {
        this.deleteProductDialog = false
        this.accomodations = this.accomodations.filter((val) => val.id !== this.accomodation.id)
        this.accomodationService.removeAccomodation(this.accomodation.id).pipe().subscribe()
        this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Accomodation Deleted', life: 3000 })
        this.accomodation = {}
    }

    hideDialog() {
        let index = this.accomodation.otherFees?.findIndex((item) => item.name == this.otherFee.name)
        console.log(this.otherFee)
        console.log(index)
        if (index && index > 0) {
            this.accomodation.otherFees?.splice(index, 1)
        }
        this.productDialog = false
        this.submitted = false
        this.otherFee = {}
    }

    saveAccomodation() {
        this.accomodation.isActive = true
        this.accomodation.otherFees = this.otherFees
        this.accomodation.userId = this.user?.id
        this.dataLoading = true
        this.accomodationService
            .saveAccomodation(this.accomodation)
            .pipe(
                finalize(() => {
                    this.submitted = false
                    this.getAccomodationsByUser().subscribe((result) => (this.accomodations = result.data))
                    this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Chỉnh sửa thành công', life: 3000 })
                }),
            )
            .subscribe((data) => console.log(data))
        this.productDialog = false
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains')
    }
}
