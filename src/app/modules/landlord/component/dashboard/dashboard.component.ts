/** @format */

import { Component, OnInit } from '@angular/core'
import { MenuItem } from 'primeng/api'
import { Subscription, finalize } from 'rxjs'
import { LayoutService } from '../../service/layout.service'
import { UserService } from '../../service/user.service'
import { User } from 'src/app/modules/model/user.model'
import { AuthenticationService } from 'src/app/modules/auth/service/authentication.service'

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
    items!: MenuItem[]

    chartData: any

    chartOptions: any

    subscription!: Subscription
    user!: User | null
    dashboards: any = {}
    loading: boolean = false

    lineData: any
    lineOptions: any
    documentStyle: any
    selectedYear: Date 
    chartLoading: boolean = false

    constructor(public layoutService: LayoutService, private userService: UserService, private auth: AuthenticationService) {
        this.documentStyle = getComputedStyle(document.documentElement)
        const textColor = this.documentStyle.getPropertyValue('--text-color')
        const textColorSecondary = this.documentStyle.getPropertyValue('--text-color-secondary')
        const surfaceBorder = this.documentStyle.getPropertyValue('--surface-border')
        const vnd = new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        });
        this.lineOptions = {
            plugins: {
                legend: {
                    labels: {
                        fontColor: textColor,
                    },
                },
                tooltip: {
                    callbacks: {
                        label: function(context: any) {
                            let label = context.dataset.label || '';
    
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                label += vnd.format(context.parsed.y);
                            }
                            return label;
                        }
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: textColorSecondary,
                    },
                    grid: {
                        color: surfaceBorder,
                        drawBorder: false,
                    },
                },
                y: {
                    ticks: {
                        color: textColorSecondary
                    },
                    grid: {
                        color: surfaceBorder,
                        drawBorder: false,
                    },
                    min: 0,
                }, 
            },
        }

        this.selectedYear = new Date()
    }

    ngOnInit() {
        this.user = this.auth.userValue
        this.selectedYear

        this.items = [
            { label: 'Add New', icon: 'pi pi-fw pi-plus' },
            { label: 'Remove', icon: 'pi pi-fw pi-minus' },
        ]
        this.getDashboard()
    }

    getChartByYear() {
        let result: any
        const request: { userId: any; year: Date } = { userId: this.user?.id, year: this.selectedYear }
        const color: string[] = ['--cyan-500', '--blue-500', '--red-500', '--orange-500', '--green-500',  '']
        let month: string[] = []
        let data: any[] = []
        this.chartLoading = true
        this.userService.getChartRevenue(request).pipe(
            finalize(() => {
                console.log(result)
                this.chartLoading = false
                for (let i = 1; i <= 12; i++) {
                    month.push(`Tháng ${i}`)
                }
                for (let element = 0; element < result.length; element++) {
                    data.push({
                        label: result[element].accomodationName,
                        data: result[element].revenue.data,
                        fill: false,
                        backgroundColor: this.documentStyle.getPropertyValue(color[element]),
                        borderColor: this.documentStyle.getPropertyValue(color[element]),
                        tension: 0.4,
                    })
                }
                this.lineData = {
                    labels: month,
                    datasets: data,
                },
                console.log(this.lineData)
            })
        ).subscribe((response) => (result = response.data))
    }

    getDashboard() {
        this.loading = true
        const request: { userId: any; year: Date } = { userId: this.user?.id, year: this.selectedYear }
        const color: string[] = ['--cyan-500', '--blue-500', '--red-500', '--orange-500', '--green-500',  '']
        let month: string[] = []
        let data: any[] = []
        this.userService
            .getDashboard(request)
            .pipe(
                finalize(() => {
                    this.loading = false

                    for (let i = 1; i <= 12; i++) {
                        month.push(`Tháng ${i}`)
                    }

                    for (let element = 0; element < this.dashboards.revenue.length; element++) {
                        data.push({
                            label: this.dashboards.revenue[element].accomodationName,
                            data: this.dashboards.revenue[element].revenue.data,
                            fill: false,
                            backgroundColor: this.documentStyle.getPropertyValue(color[element]),
                            borderColor: this.documentStyle.getPropertyValue(color[element]),
                            tension: 0.4,
                        })
                    }
                    this.lineData = {
                        labels: month,
                        datasets: data,
                    }
                }),
            )
            .subscribe((response) => (this.dashboards = response.data))
    }

    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe()
        }
    }
}
