import { Component, OnInit } from '@angular/core';
import { LayoutService } from '../landlord/service/layout.service';
import { AuthenticationService } from './service/authentication.service';
import { User } from '../model/user.model';
import { finalize } from 'rxjs';
import { AppConstant } from '../common/Constants';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxPermissionsService } from 'ngx-permissions';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent implements OnInit {

  valCheck: string[] = ['remember'];
  loading = false;
  username!: string;
  password!: string;
  userRole!: string | undefined;
  rememberLogin: boolean = false

  user!: User;

  constructor(private permissionsService: NgxPermissionsService, public layoutService: LayoutService, private authenticationService: AuthenticationService, private router: Router, private route: ActivatedRoute,) { }

  ngOnInit(): void {
  }

  login() {
    this.loading = true;
    this.authenticationService.login(this.username, this.password).pipe(
      finalize(() => {
        if (this.user) {
          this.userRole = this.user.roles;
          if (this.userRole === AppConstant.ROLE_LANDLORD) {
             this.router.navigateByUrl('/motel-management/accomodation');
          } else if (this.userRole === AppConstant.ROLE_ADMIN) {
            this.router.navigateByUrl('/administration/user-management');
          } else {
            this.router.navigateByUrl('/motel-service');
          }
          if (this.user.roles) {
            const permissions = [this.user.roles]
            this.permissionsService.loadPermissions(permissions);
          }
          if (this.rememberLogin) {
            localStorage.setItem('user', JSON.stringify(this.user))
          }
          this.loading = false;
        }
      })
    )
    .subscribe(data => this.user = data)
  }

}
