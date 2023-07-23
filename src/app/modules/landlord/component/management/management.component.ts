import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from 'src/app/modules/auth/service/authentication.service';
import { User } from 'src/app/modules/model/user.model';


@Component({
  selector: 'app-management',
  templateUrl: './management.component.html',
  styleUrls: ['./management.component.scss']
})
export class ManagementComponent implements OnInit {
  value: number = 0;
  user?: User | null;
  checked: boolean = false;

  constructor(private authenticationService: AuthenticationService) { 
    this.authenticationService.user.subscribe((user) => this.user = user)
  }

  ngOnInit(): void {
    console.log('user', this.user)
  }

}
