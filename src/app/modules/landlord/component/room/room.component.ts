import { Component, OnInit } from '@angular/core'
import { Room } from '../../model/accomodation.model'
import { AccomodationService } from '../../service/accomodation.service'
import { MessageService } from 'primeng/api'
import { Table } from 'primeng/table'
import { RoomService } from '../../service/room.service'
import { User } from 'src/app/modules/model/user.model'
import { AuthenticationService } from 'src/app/modules/auth/service/authentication.service'
import { finalize } from 'rxjs'

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
    accomodations: any[] = []
    selectedAccomodation!: any;
    rooms: Room[] = []
    room: Room = {}
    selectedProducts: Room[] = []
    submitted: boolean = false
    cols: any[] = []
    statuses: any[] = []
    rowsPerPageOptions = [5, 10, 20]
    selectedService: string[] = []
    user!: User | null
    dataLoading: boolean = false;
    loading: boolean = false

    constructor(private accomodationService: AccomodationService, private auth: AuthenticationService, private roomService: RoomService, private messageService: MessageService) {}

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
        this.accomodationService.getDropdownAccomodation(this.user?.id).pipe(
            finalize(() => {
                this.getRoomByAccomodation()
                this.selectedAccomodation = this.accomodations[0];
                console.log('selectedAccomodation', this.selectedAccomodation)
                this.loading = false;
            })
        ).subscribe(response => this.accomodations = response.data)
        
    }

    getRoomByAccomodation() {
        this.roomService.getRoomByAccomodation(1).pipe(
            finalize(() => {
                console.log('asldkjgh')
            })
        ).subscribe(data => console.log(data))
    }

    onSelectAccomodation() {
        console.log(this.selectedAccomodation)
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

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains')
    }
}
