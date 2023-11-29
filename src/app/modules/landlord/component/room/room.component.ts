/** @format */

import { Component, OnInit } from '@angular/core'
import { MessageService } from 'primeng/api'
import { Table } from 'primeng/table'
import { debounceTime, distinctUntilChanged, finalize } from 'rxjs'
import { AuthenticationService } from 'src/app/modules/auth/service/authentication.service'
import { User } from 'src/app/modules/model/user.model'
import { Room } from '../../model/accomodation.model'
import { AccomodationService } from '../../service/accomodation.service'
import { RoomService } from '../../service/room.service'
import { FormControl, FormGroup, Validators } from '@angular/forms'

@Component({
    selector: 'app-room',
    templateUrl: './room.component.html',
    styleUrls: ['./room.component.scss'],
    providers: [MessageService],
})
export class RoomComponent implements OnInit {
    addDialog: boolean = false
    otherFeesDialog: boolean = false
    deleteProductDialog: boolean = false
    deleteProductsDialog: boolean = false
    accomodations: any[] = []
    selectedAccomodation!: any
    rooms: Room[] = []
    room: Room = {}
    selectedProducts: Room[] = []
    submitted: boolean = false
    cols: any[] = []
    statuses: any[] = []
    rowsPerPageOptions = [5, 10, 20]
    selectedService: string[] = []
    user!: User | null
    dataLoading: boolean = false
    loading: boolean = false
    uploadedFiles: any[] = []
    thumb!: any
    roomForm!: FormGroup
    isValidating: boolean = false
    isAdd: boolean = false
    oldRoomName: any = ''

    constructor(
        private accomodationService: AccomodationService,
        private auth: AuthenticationService,
        private roomService: RoomService,
        private messageService: MessageService,
    ) {
        this.roomForm = new FormGroup({
            roomName: new FormControl(this.room.name, [Validators.required]),
            price: new FormControl(this.room.price, [Validators.required]),
            acreage: new FormControl(this.room.acreage, [Validators.required]),
            maxCapacity: new FormControl(this.room.capacity, [Validators.required])
        })
    }

    ngOnInit() {
        this.user = this.auth.userValue
        this.getDropdownAccomodation().subscribe((response) => (this.accomodations = response.data))

        this.roomForm.get('roomName')?.valueChanges.pipe(
            debounceTime(500),
            distinctUntilChanged()
        ).subscribe(data => {
            if (data) {
                this.room.name = data
                if (this.oldRoomName !== this.room.name) {
                    this.checkRoomDuplicated()
                }
            }
        })
        this.roomForm.get('price')?.valueChanges.subscribe(data => {
            this.room.price = data
        })
        this.roomForm.get('acreage')?.valueChanges.subscribe(data => {
            this.room.acreage = data
        })
        this.roomForm.get('maxCapacity')?.valueChanges.subscribe(data => {
            this.room.capacity = data
        })
    }

    openNew() {
        this.room = {}
        this.oldRoomName = ''
        this.roomForm.get('roomName')?.setValue(null)
        this.roomForm.get('price')?.setValue(null)
        this.roomForm.get('acreage')?.setValue(null)
        this.roomForm.get('maxCapacity')?.setValue(null)
        this.addDialog = true
    }

    getDropdownAccomodation() {
        this.loading = true
        return this.accomodationService.getDropdownAccomodation(this.user?.id).pipe(
            finalize(() => {
                this.selectedAccomodation = this.accomodations[0]
                this.loading = false
                this.getRoomByAccomodation()
            }),
        )
    }

    getRoomByAccomodation() {
        this.loading = true
        this.roomService
            .getRoomByAccomodation(this.selectedAccomodation.id)
            .pipe(
                finalize(() => {
                    this.loading = false
                }),
            )
            .subscribe((response) => (this.rooms = response.data))
    }

    onSelectAccomodation() {
        this.getRoomByAccomodation()
    }

    editRoom(room: Room) {
        this.room = { ...room }
        this.oldRoomName = room.name
        this.roomForm.get('roomName')?.setValue(this.room.name)
        this.roomForm.get('price')?.setValue(this.room.price)
        this.roomForm.get('acreage')?.setValue(this.room.acreage)
        this.roomForm.get('maxCapacity')?.setValue(this.room.capacity)
        this.addDialog = true
    }

    deleteRoom(room: Room) {
        this.deleteProductDialog = true
        this.room = { ...room }
    }

    onHideDialog() {
        this.roomForm.reset()
    }

    confirmDelete() {
        this.loading = true
        this.deleteProductDialog = false
        this.roomService
            .removeRoom(this.room.id)
            .pipe(
                finalize(() => {
                    this.getRoomByAccomodation()
                    this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Xoá thành công!', life: 3000 })
                }),
            )
            .subscribe((data) => console.log(data))
    }

    hideDialog() {
        this.addDialog = false
        this.submitted = false
    }

    checkRoomDuplicated() {
        let isDuplicated = false;
        this.isValidating = true
        this.roomService.checkRoomDuplicated(this.room.name, this.selectedAccomodation.id).pipe(
            finalize(() => {
                this.isValidating = false
                if (isDuplicated) {
                    this.roomForm.get('roomName')?.setErrors({duplicated: true})
                }
            })
        ).subscribe(response => isDuplicated = response.data)
    }

    saveRoom() {
        if (!this.roomForm.invalid) {
            this.loading = true
            this.room.accomodationId = this.selectedAccomodation.id
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
                        this.loading = false
                        this.messageService.add({ severity: 'success', summary: 'Successful', detail: message, life: 3000 })
                    }),
                )
                .subscribe((response) => (this.rooms = response.data))
            this.addDialog = false
        } else {
            this.roomForm.markAllAsTouched()
        }
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains')
    }
}
