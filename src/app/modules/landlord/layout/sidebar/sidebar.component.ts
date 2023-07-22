import { Component, ElementRef, OnInit } from '@angular/core';
import { LayoutService } from '../../service/layout.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {

  model: any[] = [];

  constructor(public layoutService: LayoutService, public el: ElementRef) { }

  ngOnInit(): void {
    this.model = [
      {
          label: 'Trang chủ',
          items: [
              { label: 'Dashboard', icon: 'pi pi-fw pi-home', routerLink: ['/'] }
          ]
      },
      {
          label: 'Khu trọ',
          items: [
              { label: 'Nhà trọ', icon: 'pi pi-fw pi-id-card', routerLink: ['/motel-management/accomodation'] },
              { label: 'Phòng', icon: 'pi pi-fw pi-check-square', routerLink: ['/motel-management/room'] },
              { label: 'Dịch vụ', icon: 'pi pi-fw pi-bookmark', routerLink: ['/uikit/floatlabel'] },
              { label: 'Thiết bị', icon: 'pi pi-fw pi-exclamation-circle', routerLink: ['/uikit/invalidstate'] }
          ]
      },
      {
          label: 'Hệ thống',
          items: [
              { label: 'Hồ sơ cá nhân', icon: 'pi pi-fw pi-prime', routerLink: ['/utilities/icons'] },
              { label: 'Cấu hình chung', icon: 'pi pi-fw pi-desktop', url: ['https://www.primefaces.org/primeflex/']},
              { label: 'Danh sách dịch vụ', icon: 'pi pi-fw pi-desktop', url: ['https://www.primefaces.org/primeflex/']}
          ]
      },
      {
          label: 'Hoá đơn',
          icon: 'pi pi-fw pi-briefcase',
          items: [
              {
                  label: 'Điện nước',
                  icon: 'pi pi-fw pi-globe',
                  routerLink: ['/landing']
              },
              {
                  label: 'Xuất hoá đơn',
                  icon: 'pi pi-fw pi-user',
              },
              {
                  label: 'Crud',
                  icon: 'pi pi-fw pi-pencil',
                  routerLink: ['/pages/crud']
              },
              {
                  label: 'Timeline',
                  icon: 'pi pi-fw pi-calendar',
                  routerLink: ['/pages/timeline']
              },
              {
                  label: 'Not Found',
                  icon: 'pi pi-fw pi-exclamation-circle',
                  routerLink: ['/notfound']
              },
              {
                  label: 'Empty',
                  icon: 'pi pi-fw pi-circle-off',
                  routerLink: ['/pages/empty']
              },
          ]
      },
      {
          label: 'Hierarchy',
          items: [
              {
                  label: 'Submenu 1', icon: 'pi pi-fw pi-bookmark',
                  items: [
                      {
                          label: 'Submenu 1.1', icon: 'pi pi-fw pi-bookmark',
                          items: [
                              { label: 'Submenu 1.1.1', icon: 'pi pi-fw pi-bookmark' },
                              { label: 'Submenu 1.1.2', icon: 'pi pi-fw pi-bookmark' },
                              { label: 'Submenu 1.1.3', icon: 'pi pi-fw pi-bookmark' },
                          ]
                      },
                      {
                          label: 'Submenu 1.2', icon: 'pi pi-fw pi-bookmark',
                          items: [
                              { label: 'Submenu 1.2.1', icon: 'pi pi-fw pi-bookmark' }
                          ]
                      },
                  ]
              },
              {
                  label: 'Submenu 2', icon: 'pi pi-fw pi-bookmark',
                  items: [
                      {
                          label: 'Submenu 2.1', icon: 'pi pi-fw pi-bookmark',
                          items: [
                              { label: 'Submenu 2.1.1', icon: 'pi pi-fw pi-bookmark' },
                              { label: 'Submenu 2.1.2', icon: 'pi pi-fw pi-bookmark' },
                          ]
                      },
                      {
                          label: 'Submenu 2.2', icon: 'pi pi-fw pi-bookmark',
                          items: [
                              { label: 'Submenu 2.2.1', icon: 'pi pi-fw pi-bookmark' },
                          ]
                      },
                  ]
              }
          ]
      },
      {
          label: 'Get Started',
          items: [
              {
                  label: 'Documentation', icon: 'pi pi-fw pi-question', routerLink: ['/documentation']
              },
              {
                  label: 'View Source', icon: 'pi pi-fw pi-search', url: ['https://github.com/primefaces/sakai-ng'], target: '_blank'
              }
          ]
      }
  ];
  }

}
