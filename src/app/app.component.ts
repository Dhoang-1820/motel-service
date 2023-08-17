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
    userRole: any;

    constructor(private permissionsService: NgxPermissionsService, private auth: AuthenticationService) {}

    ngOnInit(): void {
      this.user = this.auth.userValue
      this.userRole = this.user?.roles;
      console.log('role', this.userRole)
      // this.permissionsService.loadPermissions(this.userRole );
    }
    title = 'motel-service'
}
