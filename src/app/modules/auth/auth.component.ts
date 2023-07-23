import { Component, OnInit } from '@angular/core';
import { LayoutService } from '../landlord/service/layout.service';
import { AuthenticationService } from './service/authentication.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent implements OnInit {

  valCheck: string[] = ['remember'];

  username!: string;
  password!: string;

  constructor(public layoutService: LayoutService, private authenticationService: AuthenticationService) { }

  ngOnInit(): void {
  }

  login() {
    this.authenticationService.login(this.username, this.password).pipe()
    .subscribe(data => console.log(data))
  }

}
