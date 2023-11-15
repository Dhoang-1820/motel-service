import { Component, OnInit } from '@angular/core';
import { finalize } from 'rxjs';
import { AuthenticationService } from 'src/app/modules/auth/service/authentication.service';
import { User } from 'src/app/modules/model/user.model';
import { UserService } from '../../service/user.service';
import * as moment from 'moment';
import { MessageService } from 'primeng/api';

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
  disabledSave: boolean = true

  constructor(private userService: UserService,  private auth: AuthenticationService, private messageService: MessageService) { }

  ngOnInit(): void {
    this.user = this.auth.userValue
    this.getUserPreference()
  }

  getUserPreference() {
    this.loading = true
    this.userService.getUserPreference(this.user?.id).pipe(
      finalize(() => {
        this.loading = false
        this.retrieveDate()
      })
    ).subscribe(response => this.commonConfig = response.data)
  }

  retrieveDate() {
    this.commonConfig.electricWaterDate = moment(this.commonConfig.electricWaterDate).toDate()
    this.commonConfig.issueInvoiceDate = moment(this.commonConfig.issueInvoiceDate).toDate()
  }

  saveUserPreference() {
    this.disabledSave = false
    this.loading = true
    this.commonConfig.userId = this.user?.id
    this.userService.updateUserPreference(this.commonConfig).pipe(
      finalize(() => {
        this.loading = false
        this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Chỉnh sửa thành công', life: 3000 })
        this.retrieveDate()
      })
    ).subscribe(response => this.commonConfig = response.data)
    
  }
}
