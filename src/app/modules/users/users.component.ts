/** @format */

import { Component, OnInit } from '@angular/core'
import { FormControl, FormGroup, Validators } from '@angular/forms'
import { Router } from '@angular/router'
import * as moment from 'moment'
import { MessageService } from 'primeng/api'
import { DataView } from 'primeng/dataview'
import { finalize } from 'rxjs'
import { Post } from '../landlord/model/post.model'
import { LayoutService } from '../landlord/service/layout.service'
import { PostService } from '../landlord/service/post.service'
import { BookingService } from './services/booking.service'
import { AddressService } from '../landlord/service/address.service'

@Component({
    selector: 'app-users',
    templateUrl: './users.component.html',
    styleUrls: ['./users.component.scss'],
    providers: [MessageService],
})
export class UsersComponent implements OnInit {
    loading: boolean = false
    submitLoading: boolean = false
    posts: Post[] = []
    sortOrder: number = 0
    sortField: string = ''
    sortOptions: any[] = []
    detailDialog: boolean = false
    roomSelected: any
    bookingDialog: boolean = false
    bookingForm: FormGroup
    submitForm: { name?: string; email?: string; phone?: string; roomId?: string, reviewDate?: Date } = {}
    isAddReviewDate: boolean = false;
    today: Date = new Date();
    minDate!: Date 

    constructor(
        private messageService: MessageService,
        public bookingService: BookingService,
        public layoutService: LayoutService,
        public router: Router,
        private postService: PostService,
        private addressService: AddressService,
    ) {
        this.minDate =  moment(this.today, "DD-MM-YYYY").add(1, 'd').toDate();
        this.bookingForm = new FormGroup({
            fullname: new FormControl(this.submitForm.name, [Validators.required]),
            email: new FormControl(this.submitForm.email, [Validators.required]),
            phone: new FormControl(this.submitForm.phone, [Validators.required]),
            roomId: new FormControl(this.submitForm.roomId, [Validators.required]),
            reviewDate: new FormControl(this.submitForm.reviewDate, []),
        })

    }

    ngOnInit(): void {
        this.getAllRoom()

        this.sortOptions = [
            { label: 'Giá từ thấp đến cao', value: 'price' },
            { label: 'Giá từ cao đến thấp', value: '!price' },
        ]

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
        this.bookingForm.get('reviewDate')?.valueChanges.subscribe((data) => {
            this.submitForm.reviewDate = data
        })
    }


    openBooking(room: any) {
        this.bookingDialog = true
        this.roomSelected = room
        this.bookingForm.get('fullname')?.setValue(null)
        this.bookingForm.get('email')?.setValue(null)
        this.bookingForm.get('phone')?.setValue(null)
        this.bookingForm.get('reviewDate')?.setValue(null)
        this.bookingForm.get('roomId')?.setValue(this.roomSelected.room.id)
    }

    saveBooking() {
        this.submitLoading = true
        this.bookingService
            .saveBooking(this.submitForm)
            .pipe(
                finalize(() => {
                    this.submitLoading = false
                    this.bookingDialog = false
                    this.detailDialog = false
                    this.isAddReviewDate =false
                    this.roomSelected = {}
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Successful',
                        detail: 'Thông tin đã được gửi đến chủ trọ, chủ trọ sẽ liên hệ sớm nhất!',
                        life: 3000,
                    })
                }),
            )
            .subscribe((data) => console.log(data))
    }

    hideBookingDialog() {
        this.bookingDialog = false
    }

    getAllRoom() {
        this.loading = true
        this.postService
            .getPostForLanding()
            .pipe(
                finalize(() => {
                    this.loading = false
                }),
            )
            .subscribe((response) => (this.posts = response.data))
    }

    onShowDialog(room: any) {
        this.roomSelected = room
        this.detailDialog = true
    }

    onSortChange(event: any) {
        const value = event.value

        if (value.indexOf('!') === 0) {
            this.sortOrder = -1
            this.sortField = value.substring(1, value.length)
        } else {
            this.sortOrder = 1
            this.sortField = value
        }
    }

    onFilter(dv: DataView, event: Event) {
        dv.filter((event.target as HTMLInputElement).value, 'contains')
    }
}
