import { Component, OnInit } from '@angular/core';


@Component({
  selector: 'app-management',
  templateUrl: './management.component.html',
  styleUrls: ['./management.component.scss']
})
export class ManagementComponent implements OnInit {
  value: number = 0;
    
  checked: boolean = false;

  constructor() { }

  ngOnInit(): void {
  }

}
