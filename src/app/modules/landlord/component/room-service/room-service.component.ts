import { Component, OnInit } from '@angular/core'
import { MessageService } from 'primeng/api'
import { Table } from 'primeng/table'
import { finalize, findIndex } from 'rxjs'
import { AuthenticationService } from 'src/app/modules/auth/service/authentication.service'
import { User } from 'src/app/modules/model/user.model'
import { Room } from '../../model/accomodation.model'
import { AccomodationService } from '../../service/accomodation.service'
import { OtherFeeService } from '../../service/other-fee.service'
import { RoomService } from '../../service/room.service'
import { FormGroup } from '@angular/forms'

@Component({
    selector: 'app-room-service',
    templateUrl: './room-service.component.html',
    styleUrls: ['./room-service.component.scss'],
    providers: [MessageService],
})
export class RoomServiceComponent implements OnInit {
    productDialog: boolean = false
    otherFeesDialog: boolean = false
    addRoomFeeDialog: boolean = false
    addOtherFeesDialog: boolean = false
    deleteProductDialog: boolean = false
    deleteProductsDialog: boolean = false
    accomodations: any[] = []
    selectedAccomodation!: any
    selectedFee!: any
    selectedProducts: Room[] = []
    submitted: boolean = false
    cols: any[] = []
    statuses: any[] = []
    rowsPerPageOptions = [5, 10, 20]
    selectedService: string[] = []
    user!: User | null
    selectedRoomId: any
    roomServices: any = []
    room: any = {}
    roomFee: any = {}
    roomFees: any[] = []
    remainFees: any[] = []
    roomFeeForm: FormGroup
    rooms: Room[] = []
    roomSelected: any = {}
    roomHasService: any[] = []

    addFeeLoading: boolean = false
    addRoomFeeLoading: boolean = false
    feeDropdownLoading: boolean = false
    loading: boolean = false
    
    isEdit: boolean = false;
    deleteRoomFeeDialog: boolean = false
    selectedRoomFee: any;

    constructor(
        private otherFeeService: OtherFeeService,
        private accomodationService: AccomodationService,
        private auth: AuthenticationService,
        private roomService: RoomService,
        private messageService: MessageService,
    ) {
        this.roomFeeForm = new FormGroup({})
    }

    ngOnInit() {
        this.user = this.auth.userValue
        this.getDropdownAccomodation()
    }

    openRoomService() {
        this.getDropdownRemainOtherFee()
    }

    getDropdownAccomodation() {
        this.loading = true
        this.accomodationService
            .getDropdownAccomodation(this.user?.id)
            .pipe(
                finalize(() => {
                    this.selectedAccomodation = this.accomodations[0]
                    this.getOtherFeeByAccomodation()
                    this.loading = false
                }),
            )
            .subscribe((response) => (this.accomodations = response.data))
    }

    getRoomByAccomodation() {
        this.roomService
            .getRoomNotHasService(this.selectedAccomodation.id)
            .pipe(
                finalize(() => {
                    if (this.rooms.length > 0) {
                        this.roomSelected = this.rooms[0]
                        this.room = this.roomSelected
                        this.addRoomFeeDialog = true
                    } else {
                        this.messageService.add({
                            severity: 'warn',
                            summary: 'Cảnh báo',
                            detail: 'Toàn bộ phòng của khu trọ đã được thêm phí dịch vụ',
                            life: 3000,
                        })
                    }
                    this.addRoomFeeLoading = false
                }),
            )
            .subscribe((response) => (this.rooms = response.data))
    }

    getDropdownRemainOtherFee() {
        this.feeDropdownLoading = true
        this.otherFeeService
            .getRemainOtherFeeByRoom(this.room.room.roomId || this.room.roomId, this.selectedAccomodation.id)
            .pipe(
                finalize(() => {
                    this.feeDropdownLoading = false
                    if (this.remainFees.length > 0) {
                        this.selectedFee = this.remainFees[0]
                        this.addOtherFeesDialog = true
                    } else {
                        this.messageService.add({ severity: 'warn', summary: 'Cảnh báo', detail: 'Toàn bộ phí của khu trọ đã được thêm', life: 3000 })
                    }
                }),
            )
            .subscribe((res) => (this.remainFees = res.data))
    }

    getOtherFeeByAccomodation() {
        this.otherFeeService
            .getOtherFeeByAccomodation(this.selectedAccomodation.id)
            .pipe(
                finalize(() => {
                    this.roomHasService = this.roomServices
                }),
            )
            .subscribe((res) => (this.roomServices = res.data))
    }

    openNewRoomFee() {
        this.addRoomFeeLoading = true
        this.getRoomByAccomodation()
    }

    onSelectAccomodation() {
        this.getOtherFeeByAccomodation()
    }

    deleteSelectedProducts() {
        this.deleteProductsDialog = true
    }

    editProduct(room: Room) {
        this.room = { ...room }
        this.selectedRoomId = this.room.room.roomId
        this.productDialog = true
        console.log('room', this.room)
    }

    editOtherFee(fee: any) {
        this.isEdit = true
        this.roomFee = { ...fee }
        this.otherFeesDialog = true
        console.log('roomFee',this.roomFee)
    }

    deleteOtherFeeDialog(fee: any) {
        this.selectedRoomFee = fee
        this.deleteRoomFeeDialog = true
    }

    confirmDeleteRoomFee() {
        this.loading = true
        this.deleteRoomFeeDialog = false
        this.productDialog = false
        this.roomService.removeRoomFee( this.selectedRoomFee.roomId, this.selectedRoomFee.feeId).pipe(
            finalize(() => {
                this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Xoá thành công', life: 3000 })
                this.getDropdownAccomodation();
            })
        ).subscribe()   
    }

    saveOtherFee() {
        let isExist = this.roomFees.findIndex((item) => item.feeId == this.roomFee.feeId)
        if (isExist !== -1) {
            this.roomFees.splice(isExist, 1)
        }
        this.roomFees.push(this.roomFee)
        let feeIndex = this.room.fees.findIndex((item: any) => item.feeId == this.roomFee.feeId)
        this.room.fees[feeIndex] = this.roomFee
        this.otherFeesDialog = false
        console.log(this.roomFees)
    }

    reloadAfterSaveFee() {
        this.otherFeeService
            .getOtherFeeByAccomodation(this.selectedAccomodation.id)
            .pipe(
                finalize(() => {
                    this.room = this.roomServices.find((item: any) => item.room.roomId == this.selectedRoomId)
                    this.loading = false
                }),
            )
            .subscribe((res) => (this.roomServices = res.data))
    }

    saveRoomFee() {
        this.addFeeLoading = true
        let request: { feeId?: any; roomId?: any; quantity?: any } = {}
        let message: string
        if (this.isEdit) {
            request = {
                feeId: this.roomFee.feeId,
                roomId: this.roomFee.roomId,
                quantity: this.roomFee.quantity
            }
            message = 'Chỉnh sửa thành công'
        } else {
            request = {
                feeId: this.selectedFee.id,
                roomId: this.room.room.roomId || this.room.roomId,
                quantity: this.selectedFee.quantity,
            }
            message = 'Thêm thành công'
        }
        
        this.roomService
            .saveRoomFee(request)
            .pipe(
                finalize(() => {
                    this.reloadAfterSaveFee()
                    this.addFeeLoading = false
                    this.addOtherFeesDialog = false
                    this.addOtherFeesDialog = false
                    this.addRoomFeeDialog = false
                    this.otherFeesDialog = false
                    this.isEdit = false
                    this.messageService.add({ severity: 'success', summary: 'Successful', detail: message, life: 3000 })
                }),
            )
            .subscribe((data) => console.log(data))
    }

    deleteProduct(room: Room) {
        this.deleteProductDialog = true
        this.room = { ...room }
    }


    hideDialog() {
        this.productDialog = false
        this.submitted = false
        console.log(this.room)
    }

    saveRoom() {
        this.loading = true
        let message: string
        if (this.room.id) {
            message = 'Chỉnh sửa thành công'
        } else {
            message = 'Thêm thành công'
        }
        this.room.accomodationId = this.selectedAccomodation.id
        this.roomService
            .saveRoom(this.room)
            .pipe(
                finalize(() => {
                    this.submitted = false
                    this.getDropdownAccomodation()
                    this.messageService.add({ severity: 'success', summary: 'Successful', detail: message, life: 3000 })
                }),
            )
            .subscribe((data) => console.log(data))
        this.productDialog = false
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains')
    }
}
