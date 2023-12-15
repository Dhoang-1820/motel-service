import { Component, OnInit } from '@angular/core'
import { MessageService } from 'primeng/api'
import { Table } from 'primeng/table'
import { finalize, forkJoin } from 'rxjs'
import { AuthenticationService } from 'src/app/modules/auth/service/authentication.service'
import { User } from 'src/app/modules/model/user.model'
import { Room } from '../../model/accomodation.model'
import { AccomodationService } from '../../service/accomodation.service'
import { EquipmentService } from '../../service/equipment.service'
import { Equipment } from '../../model/equipment.model'
import { FormControl, FormGroup, Validators } from '@angular/forms'
import { AppConstant } from 'src/app/modules/common/Constants'
import { RoomService } from '../../service/room.service'

interface expandedRows {
    [key: string]: boolean;
}

@Component({
    selector: 'app-equipment',
    templateUrl: './equipment.component.html',
    styleUrls: ['./equipment.component.scss'],
    providers: [MessageService],
})
export class EquipmentComponent implements OnInit {
    addDialog: boolean = false
    deleteProductDialog: boolean = false
    accomodations: any[] = []
    selectedAccomodation!: any
    equipments: Equipment[] = []
    equipment: Equipment = {}
    cols: any[] = []
    rowsPerPageOptions = [5, 10, 20]
    user!: User | null
    dataLoading: boolean = false
    loading: boolean = false
    isAddRoom: boolean = false
    rooms: Room[] = []
    filterRoom!: any
    expandedRows: expandedRows = {};

    equipmentForm: FormGroup
    units: String[] = AppConstant.UNITS
    status: String[] = AppConstant.EQUIPMENT_STATUS

    loadingChild: boolean = false;
    isNew: boolean = false;

    constructor(
        private accomodationService: AccomodationService,
        private auth: AuthenticationService,
        private messageService: MessageService,
        private equipmentService: EquipmentService,
        private roomService: RoomService,
    ) {
        this.equipmentForm = new FormGroup({
            name: new FormControl(this.equipment.name, [Validators.required]),
            unit: new FormControl(this.equipment.unit, [Validators.required]),
            status: new FormControl(this.equipment.status, [Validators.required]),
            description: new FormControl(this.equipment.description, [Validators.required]),
            price: new FormControl(this.equipment.price, []),
            isAddRoom: new FormControl(this.equipment.isAddRoom, []),
            selectedRoom: new FormControl(this.equipment.selectedRoom, []),
            quantity: new FormControl(this.equipment.quantity, []),
            room: new FormControl()
        })
    }

    ngOnInit() {
        this.user = this.auth.userValue
        this.getDropdownAccomodation().subscribe((response) => (this.accomodations = response.data))

        this.equipmentForm.get('name')?.valueChanges.subscribe((data) => {
            this.equipment.name = data
        })
        this.equipmentForm.get('unit')?.valueChanges.subscribe((data) => {
            this.equipment.unit = data
        })
        this.equipmentForm.get('price')?.valueChanges.subscribe((data) => {
            this.equipment.price = data
        })
        this.equipmentForm.get('status')?.valueChanges.subscribe((data) => {
            this.equipment.status = data
        })
        this.equipmentForm.get('description')?.valueChanges.subscribe((data) => {
            this.equipment.description = data
        })
        this.equipmentForm.get('isAddRoom')?.valueChanges.subscribe((data) => {
            this.equipment.isAddRoom = data
            if (this.equipment.isAddRoom) {
                this.equipmentForm.get('selectedRoom')?.setValidators([Validators.required])
                this.equipmentForm.get('quantity')?.setValidators([Validators.required])
            } else {
                this.equipmentForm.get('selectedRoom')?.setValidators([])
                this.equipmentForm.get('quantity')?.setValidators([])
            }
            this.equipmentForm.get('selectedRoom')?.updateValueAndValidity()
            this.equipmentForm.get('quantity')?.updateValueAndValidity()
        })
        this.equipmentForm.get('selectedRoom')?.valueChanges.subscribe((data) => {
            this.equipment.selectedRoom = data
        })
        this.equipmentForm.get('quantity')?.valueChanges.subscribe((data) => {
            this.equipment.quantity = data
        })
        this.equipmentForm.get('room')?.valueChanges.subscribe((data) => {
            if (data) {
                this.equipment.roomId = data.id
            }
        })
    }

    openNew() {
        this.equipment = {}
        this.addDialog = true
        this.isNew = true
        this.equipmentForm.get('name')?.setValue(null)
        this.equipmentForm.get('price')?.setValue(null)
        this.equipmentForm.get('unit')?.setValue(null)
        this.equipmentForm.get('status')?.setValue(null)
        this.equipmentForm.get('description')?.setValue(null)
        this.equipmentForm.get('isAddRoom')?.setValue(false)
        this.equipmentForm.get('selectedRoom')?.setValue([])
        this.equipmentForm.get('quantity')?.setValue(null)
        this.equipmentForm.get('room')?.setValue(null)
    }

    onHideDialog() {
        this.equipmentForm.reset()
    }

    onFilterByRoom() {
        if (this.filterRoom) {
            this.loading = true
                this.equipmentService
                    .getByRoom(this.filterRoom)
                    .pipe(
                        finalize(() => {
                            this.loading = false
                            this.collapse()
                        }),
                    )
                    .subscribe((response) => (this.equipments = response.data))
        } else {
            this.onSelectAccomodation()
        }
    }

    onExpand(equipment: any) {
        if (Object.keys(this.expandedRows).length && this.expandedRows[equipment.id] && !equipment.child) {
            let child: any
            this.loading = true
            this.equipmentService
            .getByName(equipment.name, this.selectedAccomodation.id)
            .pipe(
                finalize(() => {
                    this.loading = false
                    equipment.child = child
                }),
            )
            .subscribe((response) => (child = response.data))
        }
    }

    getDropdownAccomodation() {
        this.loading = true
        return this.accomodationService.getDropdownAccomodation(this.user?.id).pipe(
            finalize(() => {
                if (this.accomodations.length > 0) {
                    this.selectedAccomodation = this.accomodations[0]
                    this.getRoomsAndEqip()
                } else {
                    this.loading = false
                    this.messageService.add({ severity: 'warn', summary: 'Cảnh báo', detail: 'Vui lòng tạo khu/nhà trọ trước!', life: 3000 })
                }
            }),
        )
    }

    getRoomsAndEqip() {
        forkJoin({
            rooms: this.getRoomByAccomodation(),
            equips: this.getEquipByAccomodation(),
        })
            .pipe(
                finalize(() => {
                    this.loading = false
                }),
            )
            .subscribe((response) => {
                this.rooms = response.rooms.data
                this.equipments = response.equips.data
            })
    }

    getRoomByAccomodation() {
        return this.roomService.getRoomDropDown(this.selectedAccomodation.id)
    }

    getEquipByAccomodation() {
        return this.equipmentService.getByAccomodation(this.selectedAccomodation.id)
    }

    onSelectAccomodation() {
        if (this.filterRoom) {
            this.filterRoom = null
        }
        this.loading = true
        this.getRoomsAndEqip()
    }

    editEquipment(equipment: Equipment) {
        this.equipment = { ...equipment }
        this.isNew = false
        this.equipmentForm.get('name')?.setValue(this.equipment.name)
        this.equipmentForm.get('price')?.setValue(this.equipment.price)
        this.equipmentForm.get('unit')?.setValue(this.equipment.unit)
        this.equipmentForm.get('status')?.setValue(this.equipment.status)
        this.equipmentForm.get('description')?.setValue(this.equipment.description)
        this.equipmentForm.get('isAddRoom')?.setValue(equipment.isAddRoom)
        this.equipmentForm.get('selectedRoom')?.setValue(equipment.selectedRoom)
        this.equipmentForm.get('room')?.setValue(equipment.room)
        this.addDialog = true
    }

    deleteRoom(room: Equipment) {
        this.deleteProductDialog = true
        this.equipment = { ...room }
    }

    confirmDelete() {
        this.loading = true
        this.equipmentService.deleleById(this.equipment.id).pipe(
            finalize(() => {
                this.deleteProductDialog = false
                this.expandedRows = {}
                this.getRoomsAndEqip()
            })
        ).subscribe()
    }

    hideDialog() {
        this.addDialog = false
        this.isNew = false
    }

    collapse() {
        if (Object.keys(this.expandedRows).length) {
            this.expandedRows = {}
        }
    }

    onClearRoom() {
        this.equipment.roomId = undefined
    }

    saveEquipment() {
        this.loading = true
        this.equipment.accomodationId = this.selectedAccomodation.id
        let message: string
        if (this.equipment.id) {
            message = 'Chỉnh sửa thành công'
        } else {
            message = 'Thêm thành công'
        }

        let equipSubmit: Equipment[] = [];
        let quantity = this.equipmentForm.get('quantity')?.value
        let selectedRoom = this.equipmentForm.get('selectedRoom')?.value
        let newEquipment: any

        if (quantity > 0) {
            for (let j = 0; j < selectedRoom.length; j++) {
                for (let i = 0; i < quantity; i++) {
                    newEquipment = Object.assign({}, this.equipment)
                    newEquipment.roomId = selectedRoom[j]
                    equipSubmit.push(newEquipment)
                }
            }
        } else {
            equipSubmit.push(this.equipment)
        }
        

        this.equipmentService
            .saveEquipment(equipSubmit)
            .pipe(
                finalize(() => {
                    this.loading = false
                    this.equipment = {}
                    this.collapse()
                    this.messageService.add({ severity: 'success', summary: 'Thành công', detail: message, life: 3000 })
                }),
            )
            .subscribe((response) => (this.equipments = response.data))
        this.addDialog = false
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains')
    }
}
