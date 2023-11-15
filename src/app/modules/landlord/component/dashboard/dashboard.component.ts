import { Component, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Subscription, finalize } from 'rxjs';
import { LayoutService } from '../../service/layout.service';
import { UserService } from '../../service/user.service';
import { User } from 'src/app/modules/model/user.model';
import { AuthenticationService } from 'src/app/modules/auth/service/authentication.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  items!: MenuItem[];


    chartData: any;

    chartOptions: any;

    subscription!: Subscription;
    user!: User | null
    dashboards: any = {}
    loading: boolean = false

    constructor(public layoutService: LayoutService, private userService: UserService, private auth: AuthenticationService,) {

    }

    ngOnInit() {
        this.user = this.auth.userValue

        this.items = [
            { label: 'Add New', icon: 'pi pi-fw pi-plus' },
            { label: 'Remove', icon: 'pi pi-fw pi-minus' }
        ];
        this.getDashboard()
    }

    getDashboard() {
      this.loading = true
      this.userService.getDashboard(this.user?.id).pipe(
        finalize(() => {
          this.loading = false
        })
      ).subscribe(response => this.dashboards = response.data)
    }

    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }
}
