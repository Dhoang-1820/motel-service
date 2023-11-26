import { Component, OnInit } from '@angular/core'
import { NgxPermissionsService } from 'ngx-permissions'
import { AuthenticationService } from './modules/auth/service/authentication.service';
import { User } from './modules/model/user.model';


@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
    user!: User | null;

    constructor(private permissionsService: NgxPermissionsService, private auth: AuthenticationService) {}

    ngOnInit(): void {
      this.user = this.auth.userValue
      if (this.user?.roles) {
        const permissions = [this.user.roles]
        this.permissionsService.loadPermissions(permissions);
      }
    }
    title = 'motel-service'
}
