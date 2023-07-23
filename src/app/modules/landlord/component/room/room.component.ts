import { Component, OnInit } from '@angular/core'
import { Room } from '../../model/accomodation.model'
import { AccomodationService } from '../../service/accomodation.service'
import { MessageService } from 'primeng/api'
import { Table } from 'primeng/table'

interface Accomodation {
  id?: number,
  name?: string
}

@Component({
    selector: 'app-room',
    templateUrl: './room.component.html',
    styleUrls: ['./room.component.scss'],
    providers: [MessageService],
})
export class RoomComponent implements OnInit {
    productDialog: boolean = false
    otherFeesDialog: boolean = false
    deleteProductDialog: boolean = false
    deleteProductsDialog: boolean = false
    accomodations: Accomodation[] = []
    selectedAccomodation!: Accomodation
    rooms: Room[] = []
    room: Room = {}
    selectedProducts: Room[] = []
    submitted: boolean = false
    cols: any[] = []
    statuses: any[] = []
    rowsPerPageOptions = [5, 10, 20]
    selectedService: string[] = []

    constructor(private productService: AccomodationService, private messageService: MessageService) {}

    ngOnInit() {
        // this.productService.getProducts().then((data) => (this.accomodations = data))

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

        this.selectedService = []

        this.accomodations.push({id: 1, name: 'asdgsdg'})
    }

    openNew() {
        this.room = {}
        this.submitted = false
        this.productDialog = true
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
        this.rooms = this.rooms.filter((val) => val.id !== this.room.id)
        this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Accomodation Deleted', life: 3000 })
        this.room = {}
    }

    hideDialog() {
        this.productDialog = false
        this.submitted = false
        console.log(this.room)
    }

    saveProduct() {
        this.submitted = true

        if (this.room.name?.trim()) {
            if (this.room.id) {
                // @ts-ignore
                this.room.inventoryStatus = this.room.inventoryStatus.value ? this.room.inventoryStatus.value : this.room.inventoryStatus
                // this.rooms[this.findIndexById(this.room.id)] = this.room
                this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Accomodation Updated', life: 3000 })
            } else {
                // this.room.id = this.createId()
                // @ts-ignore
                this.room.inventoryStatus = this.room.inventoryStatus ? this.room.inventoryStatus.value : 'INSTOCK'
                this.rooms.push(this.room)
                this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Accomodation Created', life: 3000 })
            }

            this.rooms = [...this.rooms]
            this.productDialog = false
            this.room = {}
        }
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
