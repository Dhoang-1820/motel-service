/** @format */

import { Component, OnInit } from '@angular/core'
import { FormControl, FormGroup, Validators } from '@angular/forms'
import { Router } from '@angular/router'
import * as moment from 'moment'
import { MenuItem, MessageService } from 'primeng/api'
import { DataView } from 'primeng/dataview'
import { finalize } from 'rxjs'
import { AuthenticationService } from 'src/app/modules/auth/service/authentication.service'
import { AppConstant } from 'src/app/modules/common/Constants'
import { Post } from 'src/app/modules/landlord/model/post.model'
import { LayoutService } from 'src/app/modules/landlord/service/layout.service'
import { PostService } from 'src/app/modules/landlord/service/post.service'
import { BookingService } from '../../services/booking.service'

interface RangeRequest {
    from: number
    to: number
}

interface Address {
    name: string
    code: number
    level: number
    parentCode?: number
}

@Component({
    selector: 'app-main',
    templateUrl: './main.component.html',
    styleUrls: ['./main.component.scss'],
})
export class MainComponent implements OnInit {
    home: MenuItem
    items: MenuItem[]
    searchForm: FormGroup
    bookingForm: FormGroup
    submitForm: { name?: string; email?: string; phone?: string; postId?: string; reviewDate?: Date, userId?: number } = {}
    searchPostRequest: { address?: Address; price?: RangeRequest; areage?: RangeRequest } = {}

    loading: boolean = false
    submitLoading: boolean = false
    posts: Post[] = []
    sortOrder: number = 0
    sortField: string = ''
    sortOptions: any[] = []
    detailDialog: boolean = false
    post: any
    bookingDialog: boolean = false
    isAddReviewDate: boolean = false
    today: Date = new Date()
    minDate!: Date
    provinces: any[] = []
    selectedAddress: any = null
    searchPriceDialog: boolean = false
    searhAreageDialog: boolean = false
    rangePrice: number[] = []
    rangeAreage: number[] = []
    quickRangePrice: any[] = AppConstant.QUICK_PRICE
    quickRangeAreage: any[] = AppConstant.QUICK_AREAGE
    priceSelected: number[] = []
    areageSelected: number[] = []
    selectedPriceRange: any
    selectedAreageRange: any

    constructor(
        private messageService: MessageService,
        public bookingService: BookingService,
        public layoutService: LayoutService,
        public router: Router,
        private postService: PostService,
        private auth: AuthenticationService,
    ) {
        this.minDate = moment(this.today, 'DD-MM-YYYY').add(1, 'd').toDate()
        this.bookingForm = new FormGroup({
            fullname: new FormControl(this.submitForm.name, [Validators.required]),
            email: new FormControl(this.submitForm.email, [Validators.required]),
            phone: new FormControl(this.submitForm.phone, [Validators.required]),
            reviewDate: new FormControl(this.submitForm.reviewDate, []),
        })
        this.searchForm = new FormGroup({
            address: new FormControl(this.selectedAddress, []),
        })

        this.items = [{ label: 'Phòng trọ' }, { label: 'Tìm phòng trọ toàn quốc' }]

        this.home = { icon: 'pi pi-home', routerLink: '/' }
    }

    ngOnInit(): void {
        this.getAllRoom()
        this.getAllPostAddress()

        this.sortOptions = [
            { label: 'Giá từ thấp đến cao', value: 'price' },
            { label: 'Giá từ cao đến thấp', value: '!price' },
        ]

        this.bookingForm.get('fullname')?.valueChanges.subscribe((data) => {
            this.submitForm.name = data
        })
        this.bookingForm.get('email')?.valueChanges.subscribe((data) => {
            if (data) {
                this.submitForm.email = data
                this.validateGmail(data)
            }
        })
        this.bookingForm.get('phone')?.valueChanges.subscribe((data) => {
            if (data) {
                this.submitForm.phone = data
                this.validatePhoneNumber(data)
            }
        })
        
        this.bookingForm.get('reviewDate')?.valueChanges.subscribe((data) => {
            this.submitForm.reviewDate = data
        })

        this.searchForm.get('address')?.valueChanges.subscribe((data) => {
            this.selectedAddress = data
            this.searchPost()
        })
    }

    validatePhoneNumber(phone: string) {
        const isValid = phone.toLowerCase().match(/(84|0[3|5|7|8|9])+([0-9]{8})\b/g)
        if (!isValid) {
            this.bookingForm.get('phone')?.setErrors({ phoneInvalid: true })
        } else {
            this.bookingForm.get('phone')?.setErrors(null)
        }
    }

    validateGmail(email: string) {
        const isValid = email
            .toLowerCase()
            .match(
                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            )
        if (!isValid) {
            this.bookingForm.get('email')?.setErrors({ mailInvalid: true })
        } else {
            this.bookingForm.get('email')?.setErrors(null)
        }
    }

    getAllPostAddress() {
        this.postService
            .getAllPostAddress()
            .pipe(
                finalize(() => {
                    console.log(this.provinces)
                }),
            )
            .subscribe((response) => (this.provinces = response.data))
    }

    clearPrice() {
        this.rangePrice = []
        this.selectedPriceRange = {}
        this.searchPost()
    }

    clearAreage() {
        this.rangeAreage = []
        this.selectedAreageRange = {}
        this.searchPost()
    }

    searchPost() {
        let requestAddress!: Address
        if (this.selectedAddress) {
            requestAddress = this.selectedAddress
        }
        let requestPrice!: RangeRequest
        if (this.rangePrice.length > 0) {
            requestPrice = { from: this.rangePrice[0] * 1000000, to: this.rangePrice[1] * 1000000 }
        }
        let requestAreage!: RangeRequest
        if (this.rangeAreage.length > 0) {
            requestAreage = { from: this.rangeAreage[0], to: this.rangeAreage[1] }
        }
        this.searchPostRequest = { address: requestAddress, price: requestPrice, areage: requestAreage }
        if (this.searchPostRequest.address || this.searchPostRequest.price || this.searchPostRequest.areage) {
            this.postService
                .searchPost(this.searchPostRequest)
                .pipe(
                    finalize(() => {
                        this.searchPriceDialog = false
                        this.searhAreageDialog = false
                        this.searhAreageDialog = false
                    }),
                )
                .subscribe((response) => (this.posts = response.data))
        } else {
            this.getAllRoom()
        }
    }

    openBooking(post: any) {
        this.bookingDialog = true
        this.post = {...post}
        this.bookingForm.get('fullname')?.setValue(null)
        this.bookingForm.get('email')?.setValue(null)
        this.bookingForm.get('phone')?.setValue(null)
        this.bookingForm.get('reviewDate')?.setValue(null)
    }

    saveBooking() {
        this.submitLoading = true
        this.submitForm.reviewDate = moment(this.submitForm.reviewDate).toDate()
        this.submitForm.postId = this.post.id
        this.submitForm.userId = this.post.userId
        this.bookingService
            .saveBooking(this.submitForm)
            .pipe(
                finalize(() => {
                    this.submitLoading = false
                    this.bookingDialog = false
                    this.detailDialog = false
                    this.isAddReviewDate = false
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

    onChangePrice() {
        let value = this.selectedPriceRange.value
        this.rangePrice = [value.from, value.to]
        this.searchPost()
    }

    onChangeAreage() {
        let value = this.selectedAreageRange.value
        this.rangeAreage = [value.from, value.to]
        this.searchPost()
    }

    quickSelectPrice(range: any, isSearch: boolean) {
        let value = range.value
        this.rangePrice = [value.from, value.to]
        if (isSearch) {
            this.searchPost()
        }
    }

    quickSelectAreage(range: any, isSearch: boolean) {
        let value = range.value
        this.rangeAreage = [value.from, value.to]
        if (isSearch) {
            this.searchPost()
        }
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

    onShowDialog(post: any) {
        this.post = {...post}
        this.detailDialog = true
    }

    onHideBooking() {
        this.bookingForm.reset()
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
