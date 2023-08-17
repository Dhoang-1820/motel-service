import { Component, OnInit } from '@angular/core'
import { MessageService } from 'primeng/api'
import { Table } from 'primeng/table'
import { finalize } from 'rxjs'
import { AuthenticationService } from 'src/app/modules/auth/service/authentication.service'
import { User } from 'src/app/modules/model/user.model'
import { Room } from '../../model/accomodation.model'
import { AccomodationService } from '../../service/accomodation.service'
import { RoomService } from '../../service/room.service'


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
    uploadedFiles: any[] = [];
    thumb!: any;

    constructor(private accomodationService: AccomodationService, private auth: AuthenticationService, private roomService: RoomService, private messageService: MessageService) {}

    ngOnInit() {
        this.user = this.auth.userValue
        this.getDropdownAccomodation().subscribe(response => this.accomodations = response.data)
    }

    openNew() {
        this.room = {}
        this.submitted = false
        this.productDialog = true
    }

    getDropdownAccomodation() {
        this.loading = true
        return this.accomodationService.getDropdownAccomodation(this.user?.id).pipe(
            finalize(() => {
                this.selectedAccomodation = this.accomodations[0];
                this.loading = false;
                this.getRoomByAccomodation()
            })
        )
    }

    getRoomByAccomodation() {
        this.loading = true
        this.roomService.getRoomByAccomodation(this.selectedAccomodation.id).pipe(
            finalize(() => {
                this.loading = false;
            })
        ).subscribe(response => this.rooms = response.data)
    }

    onSelectAccomodation() {
        this.getRoomByAccomodation()
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
        this.roomService.removeRoom(this.room.id).pipe(
            finalize(() => {
                this.rooms = this.rooms.filter((val) => val.id !== this.room.id)
                this.room = {}
                this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Accomodation Deleted', life: 3000 })
            })
        ).subscribe(data => console.log(data))
    }

    hideDialog() {
        this.productDialog = false
        this.submitted = false
        console.log(this.room)
    }

    onUpload(event: any) {
        for(let file of event.files) {
            this.uploadedFiles.push(file);
        }
        console.log(this.uploadedFiles)
        // this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Tải ảnh thành công', life: 3000 })
    }


    saveRoom() {
        this.loading = true
        console.log(this.room)
        this.room.accomodationId = this.selectedAccomodation.id;
        let message: string
        if (this.room.id) {
            message = 'Chỉnh sửa thành công'
        } else {
            message = 'Thêm thành công'
        }
        this.roomService
            .saveRoom(this.room)
            .pipe(
                finalize(() => {
                    this.submitted = false
                    this.getDropdownAccomodation().pipe(
                        finalize(() => {
                            this.messageService.add({ severity: 'success', summary: 'Successful', detail: message, life: 3000 })
                        })
                    ).subscribe(response => this.accomodations = response.data)
                }),
            )
            .subscribe((data) => console.log(data))
        this.productDialog = false
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains')
    }
}
