import { Component, OnInit, ɵɵsetComponentScope } from '@angular/core'
import { LayoutService } from '../landlord/service/layout.service'
import { Router } from '@angular/router'
import { AccomodationService } from '../landlord/service/accomodation.service'
import { finalize } from 'rxjs'
import { DataView } from 'primeng/dataview';
import { FormControl, FormGroup, Validators } from '@angular/forms'
import { BookingService } from './services/booking.service'
import { MessageService } from 'primeng/api'

@Component({
    selector: 'app-users',
    templateUrl: './users.component.html',
    styleUrls: ['./users.component.scss'],
    providers: [MessageService]
})
export class UsersComponent implements OnInit {

    loading: boolean = false
    submitLoading: boolean = false
    rooms: any[] = []
    sortOrder: number = 0;
    sortField: string = '';
    sortOptions: any[] = [];
    detailDialog: boolean = false
    roomSelected: any
    bookingDialog: boolean = false
    bookingForm: FormGroup
    submitForm: {name?: string, email?: string, phone?: string, roomId?: string} = {};
   

    constructor(private messageService: MessageService, public bookingService: BookingService, public layoutService: LayoutService, public router: Router, private accomodationService: AccomodationService,) {

        this.bookingForm = new FormGroup({
            fullname: new FormControl(this.submitForm.name, [Validators.required,]),
            email: new FormControl(this.submitForm.email, [Validators.required]),
            phone: new FormControl(this.submitForm.phone, [Validators.required]),
            roomId: new FormControl(this.submitForm.roomId, [Validators.required]),
        })
    }

    ngOnInit(): void {
        this.getAllRoom()

        this.sortOptions = [
            { label: 'Giá từ thấp đến cao', value: 'price' },
            { label: 'Giá từ cao đến thấp', value: '!price' }
        ];
        
        this.bookingForm.get('fullname')?.valueChanges.subscribe((data) => {
            this.submitForm.name = data
        })        
        this.bookingForm.get('email')?.valueChanges.subscribe((data) => {
            this.submitForm.email = data
        })        
        this.bookingForm.get('phone')?.valueChanges.subscribe((data) => {
            this.submitForm.phone = data
        })        
        this.bookingForm.get('roomId')?.valueChanges.subscribe((data) => {
            this.submitForm.roomId = data
        })        
        
    }

    openBooking(room: any) {
        this.bookingDialog = true
        this.roomSelected = room
        this.bookingForm.get('fullname')?.setValue('')
        this.bookingForm.get('email')?.setValue('')
        this.bookingForm.get('phone')?.setValue('')
        this.bookingForm.get('roomId')?.setValue(this.roomSelected.id)
    }

    saveBooking() {
        console.log(this.submitForm)
        this.submitLoading = true
        this.bookingService.saveBooking(this.submitForm).pipe(
            finalize(() => {
                this.submitLoading = false
                this.bookingDialog = false
                this.detailDialog = false
                this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Thông tin đã được gửi đến chủ trọ, chủ trọ sẽ liên hệ sớm nhất!', life: 3000 })
            })
        ).subscribe(data => console.log(data))
    }

    hideBookingDialog() {
        this.bookingDialog = false
        this.roomSelected = {}
    }

    getAllRoom() {
        this.loading = true
        this.accomodationService.getAllRoomForLanding().pipe(
            finalize(() => {
                this.loading = false;
            })
        ).subscribe(response => this.rooms = response.data)
        
    }

    onShowDialog(room: any) {
        this.roomSelected = room
        this.detailDialog = true
    }

    onSortChange(event: any) {
        const value = event.value;

        if (value.indexOf('!') === 0) {
            this.sortOrder = -1;
            this.sortField = value.substring(1, value.length);
        } else {
            this.sortOrder = 1;
            this.sortField = value;
        }
    }

    onFilter(dv: DataView, event: Event) {
        dv.filter((event.target as HTMLInputElement).value, 'contains');
    }
        
}
