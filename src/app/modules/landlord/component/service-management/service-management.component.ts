import { Component, OnInit } from '@angular/core'
import { FormControl, FormGroup, Validators } from '@angular/forms'
import { MessageService } from 'primeng/api'
import { Table } from 'primeng/table'
import { debounceTime, distinctUntilChanged, finalize } from 'rxjs'
import { AuthenticationService } from 'src/app/modules/auth/service/authentication.service'
import { AppConstant } from 'src/app/modules/common/Constants'
import { User } from 'src/app/modules/model/user.model'
import { AccomodationUtilities } from '../../model/accomodation.model'
import { AccomodationService } from '../../service/accomodation.service'

@Component({
    selector: 'app-room-service',
    templateUrl: './service-management.component.html',
    styleUrls: ['./service-management.component.scss'],
    providers: [MessageService],
})
export class ServiceManagementComponent implements OnInit {
    addDialog: boolean = false
    accomodations: any[] = []
    selectedAccomodation!: any
    cols: any[] = []
    rowsPerPageOptions = [5, 10, 20]
    user!: User | null
    loading: boolean = false
    deleteDialog: boolean = false

    services: AccomodationUtilities[] = []
    service: AccomodationUtilities = {};
    serviceForm: FormGroup
    units: String[] = AppConstant.UNITS
    isValidating: boolean = false
    oldName: any = ''

    constructor(
        private accomodationService: AccomodationService,
        private auth: AuthenticationService,
        private messageService: MessageService,
    ) {
        this.serviceForm = new FormGroup({
            name: new FormControl(this.service.name, [Validators.required]),
            price: new FormControl(this.service.price, [Validators.required]),
            unit: new FormControl(this.service.unit, [Validators.required]),
            description: new FormControl(this.service.description, []),
        })
    }

    ngOnInit() {
        this.user = this.auth.userValue
        this.serviceForm.get('name')?.valueChanges.pipe(
            debounceTime(500),
            distinctUntilChanged()
        ).subscribe(data => {
            if (data) {
                this.service.name = data
                if (this.oldName !== this.service.name) {
                    this.checkValidService()
                }
            }
        })
        this.serviceForm.get('price')?.valueChanges.subscribe(data => {
            this.service.price = data
        })
        this.serviceForm.get('unit')?.valueChanges.subscribe(data => {
            this.service.unit = data
        })
        this.serviceForm.get('description')?.valueChanges.subscribe(data => {
            this.service.description = data
        })
        this.getDropdownAccomodation()
    }

    checkValidService() {
        let isValid = false;
        this.isValidating = true
        this.service.accomodationId = this.selectedAccomodation.id
        this.accomodationService.checkValidService(this.service).pipe(
            finalize(() => {
                this.isValidating = false
                if (!isValid) {
                    this.serviceForm.get('name')?.setErrors({nameExisted: true})
                }
            })
        ).subscribe(response => isValid = response.data)
    }

    onHideAddDialog() {
        this.serviceForm.reset()
    }

    getDropdownAccomodation() {
        this.loading = true
        this.accomodationService
            .getDropdownAccomodation(this.user?.id)
            .pipe(
                finalize(() => {
                    this.selectedAccomodation = this.accomodations[0]
                    this.getServiceByAccomodation().pipe(
                        finalize(() => {
                            this.loading = false
                        })
                    ).subscribe(response => this.services = response.data)
                }),
            )
            .subscribe(response => this.accomodations = response.data)
    }

    openNewService() {
        this.addDialog = true
        this.service = {}
        this.oldName = ''
        this.serviceForm.get('name')?.setValue(null)
        this.serviceForm.get('price')?.setValue(null)
        this.serviceForm.get('unit')?.setValue(null)
        this.serviceForm.get('description')?.setValue(null)
        this.serviceForm.get('name')?.enable()
        this.serviceForm.get('unit')?.enable()
    }

    getServiceByAccomodation() {
        return this.accomodationService.getAccomodationService(this.selectedAccomodation.id)
    }
    
    onSelectAccomodation() {
        this.loading = true
        this.getServiceByAccomodation().pipe(
            finalize(() => {
                this.loading = false;
            })
        ).subscribe(response => this.services = response.data)
    }

    editService(service: AccomodationUtilities) {
        this.service = {...service}
        this.oldName = service.name
        this.serviceForm.get('name')?.setValue(this.service.name)
        this.serviceForm.get('price')?.setValue(this.service.price)
        this.serviceForm.get('unit')?.setValue(this.service.unit)
        this.serviceForm.get('description')?.setValue(this.service.description)
        if (this.service.isDefault) {
            this.serviceForm.get('name')?.disable()
            this.serviceForm.get('unit')?.disable()
        } else {
            this.serviceForm.get('name')?.enable()
            this.serviceForm.get('unit')?.enable()
        }
        this.addDialog = true
    }  

    deleteService(service: AccomodationUtilities) {
        this.deleteDialog = true
    }

    hideDialog() {
        this.addDialog = false
    }

    saveService() {
       if (!this.serviceForm.invalid) {
        this.loading = true
        let message: string
        if (this.service.id) {
            message = 'Chỉnh sửa thành công'
        } else {
            message = 'Thêm thành công'
        }
        this.service.accomodationId = this.selectedAccomodation.id
        this.accomodationService
            .saveService(this.service)
            .pipe(
                finalize(() => {
                    this.loading = false
                    this.messageService.add({ severity: 'success', summary: 'Successful', detail: message, life: 3000 })
                }),
            )
            .subscribe(response => this.services = response.data)
        this.addDialog = false
       } else {
        this.serviceForm.markAllAsTouched()
       }
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains')
    }
}
