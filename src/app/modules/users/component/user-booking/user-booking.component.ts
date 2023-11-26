/** @format */

import { Component, OnInit } from '@angular/core'
import { Table } from 'primeng/table'
import { finalize } from 'rxjs'
import { Booking } from 'src/app/modules/landlord/model/booking.model'
import { BookingService } from '../../services/booking.service'
import { AuthenticationService } from 'src/app/modules/auth/service/authentication.service'
import { User } from 'src/app/modules/model/user.model'
import { Router } from '@angular/router'

@Component({
    selector: 'app-user-booking',
    templateUrl: './user-booking.component.html',
    styleUrls: ['./user-booking.component.scss'],
})
export class UserBookingComponent implements OnInit {
    bookedList: Booking[] = []
    loading: boolean = false
    user!: User | null

    constructor(private bookingService: BookingService, private auth: AuthenticationService, public router: Router) {}

    ngOnInit(): void {
        this.user = this.auth.userValue
        if (!(this.user && this.user.roles === 'ROLE_POSTER')) {
            this.router.navigateByUrl('/auth')
        } else {
            this.getAllBookedRoomByUserId()
        }
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains')
    }

    getAllBookedRoomByUserId() {
        this.loading = true
        this.bookingService
            .getBookingByUserId(this.user?.id)
            .pipe(
                finalize(() => {
                    this.loading = false
                }),
            )
            .subscribe((response) => (this.bookedList = response.data))
    }
}
