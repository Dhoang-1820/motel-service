/** @format */

import { Component, OnInit } from '@angular/core'
import * as moment from 'moment'
import { MessageService } from 'primeng/api'
import { finalize } from 'rxjs'
import { AuthenticationService } from 'src/app/modules/auth/service/authentication.service'
import { User } from 'src/app/modules/model/user.model'
import { UserService } from '../../service/user.service'

interface CommonConfig {
    id?: number
    issueInvoiceDate?: Date
    electricWaterDate?: Date
    userId?: number
}

@Component({
    selector: 'app-common-config',
    templateUrl: './common-config.component.html',
    styleUrls: ['./common-config.component.scss'],
    providers: [MessageService],
})
export class CommonConfigComponent implements OnInit {
    commonConfig: CommonConfig = {}
    user!: User | null
    loading: boolean = false
    disabledSave: boolean = false

    constructor(private userService: UserService, private auth: AuthenticationService, private messageService: MessageService) {}

    ngOnInit(): void {
        this.user = this.auth.userValue
        this.getUserPreference()
    }

    getUserPreference() {
        this.loading = true
        let result: any
        this.userService
            .getUserPreference(this.user?.id)
            .pipe(
                finalize(() => {
                    this.loading = false
                    if (result) {
                        this.commonConfig = result
                        this.retrieveDate()
                    } else {
                      const lastDayOfMonth = moment('1/1/2023').endOf('month').toDate()
                      this.commonConfig.electricWaterDate = moment(lastDayOfMonth).subtract(3, 'days').toDate()
                      this.commonConfig.issueInvoiceDate = lastDayOfMonth 
                    }
                }),
            )
            .subscribe((response) => (result = response.data))
    }

    isValid() {
        if (this.commonConfig.electricWaterDate && this.commonConfig.issueInvoiceDate) {
            const eletricDate = moment(this.commonConfig.electricWaterDate)
            const invoiceDate = moment(this.commonConfig.issueInvoiceDate)
            console.log(eletricDate)
            console.log(invoiceDate)
            console.log(eletricDate.isSameOrAfter(invoiceDate))
            if (eletricDate.isSameOrAfter(invoiceDate)) {
                this.disabledSave = true
                this.messageService.add({
                    severity: 'warn',
                    summary: 'Cảnh báo',
                    detail: 'Ngày chốt chỉ số điện nước cần trước ngày xuất hoá đơn!',
                    life: 5000,
                })
            } else {
                this.disabledSave = false
            }
        }
    }

    retrieveDate() {
        this.commonConfig.electricWaterDate = moment(this.commonConfig.electricWaterDate).toDate()
        this.commonConfig.issueInvoiceDate = moment(this.commonConfig.issueInvoiceDate).toDate()
        this.isValid()
    }

    saveUserPreference() {
        this.disabledSave = false
        this.loading = true
        this.commonConfig.userId = this.user?.id
        this.userService
            .updateUserPreference(this.commonConfig)
            .pipe(
                finalize(() => {
                    this.loading = false
                    this.messageService.add({ severity: 'success', summary: 'Thành công', detail: 'Chỉnh sửa thành công', life: 3000 })
                    this.retrieveDate()
                }),
            )
            .subscribe((response) => (this.commonConfig = response.data))
    }
}
