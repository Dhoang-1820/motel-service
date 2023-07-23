import { Component, OnInit } from '@angular/core'
import { OtherFee, Accomodation } from '../../model/accomodation.model'
import { MessageService } from 'primeng/api'
import { AccomodationService } from '../../service/accomodation.service'
import { Table } from 'primeng/table'

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

    cols: any[] = []

    statuses: any[] = []

    rowsPerPageOptions = [5, 10, 20]

    otherFees: OtherFee[] = []

    otherFee: OtherFee = {}

    selectedService: string[] = []

    constructor(private accomodationService: AccomodationService, private messageService: MessageService) {}

    ngOnInit() {
        this.accomodationService.getProducts().then((data) => (this.accomodations = data))

        this.cols = [
            { field: 'product', header: 'Accomodation' },
            { field: 'price', header: 'Price' },
            { field: 'category', header: 'Category' },
            { field: 'rating', header: 'Reviews' },
            { field: 'inventoryStatus', header: 'Status' },
        ]

        this.statuses = [
            { label: 'INSTOCK', value: 'instock' },
            { label: 'LOWSTOCK', value: 'lowstock' },
            { label: 'OUTOFSTOCK', value: 'outofstock' },
        ]

        this.selectedService = [
            'waterPrice', 'electricPrice'
        ]

        this.accomodationService.getAllAccomodation().subscribe(data => console.log('data', data))
    }

    openOtherFee() {
        this.otherFee = {}
        this.otherFeesDialog = true;
    }

    hideOtherFeeDialog() {
        this.otherFeesDialog = false;
        this.submitted = false
    }

    saveOtherFee() {
        this.otherFees.push(this.otherFee);
        this.otherFee = {}
        this.otherFeesDialog = false;
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
        this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Accomodation Deleted', life: 3000 })
        this.accomodation = {}
    }

    hideDialog() {
        this.productDialog = false
        this.submitted = false
    }

    saveProduct() {
        this.submitted = true

        if (this.accomodation.name?.trim()) {
            if (this.accomodation.id) {
                // @ts-ignore
                this.accomodation.inventoryStatus = this.accomodation.inventoryStatus.value ? this.accomodation.inventoryStatus.value : this.accomodation.inventoryStatus
                this.accomodations[this.findIndexById(this.accomodation.id)] = this.accomodation
                this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Accomodation Updated', life: 3000 })
            } else {
                this.accomodation.id = this.createId()
                // @ts-ignore
                this.accomodation.inventoryStatus = this.accomodation.inventoryStatus ? this.accomodation.inventoryStatus.value : 'INSTOCK'
                this.accomodations.push(this.accomodation)
                this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Accomodation Created', life: 3000 })
            }

            this.accomodations = [...this.accomodations]
            this.productDialog = false
            this.accomodation = {}
        }
    }

    findIndexById(id: string): number {
        let index = -1
        for (let i = 0; i < this.accomodations.length; i++) {
            if (this.accomodations[i].id === id) {
                index = i
                break
            }
        }

        return index
    }

    createId(): string {
        let id = ''
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
        for (let i = 0; i < 5; i++) {
            id += chars.charAt(Math.floor(Math.random() * chars.length))
        }
        return id
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains')
    }
}
