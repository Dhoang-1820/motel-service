import { Component, OnInit } from '@angular/core'
import { FormControl, FormGroup, Validators } from '@angular/forms'
import * as moment from 'moment'
import { MessageService } from 'primeng/api'
import { Table } from 'primeng/table'
import { finalize, forkJoin } from 'rxjs'
import { AuthenticationService } from 'src/app/modules/auth/service/authentication.service'
import { User } from 'src/app/modules/model/user.model'
import { Room } from '../../model/accomodation.model'
import { Tenant } from '../../model/tenant.model'
import { AccomodationService } from '../../service/accomodation.service'
import { RoomService } from '../../service/room.service'
import { TenantService } from '../../service/tenant.service'

@Component({
    selector: 'app-tenants',
    templateUrl: './tenants.component.html',
    styleUrls: ['./tenants.component.scss'],
    providers: [MessageService],
})
export class TenantsComponent implements OnInit {
    selectedTenant: any
    dataLoading: boolean = false
    user!: User | null
    accomodations: any[] = []
    loading: boolean = false
    tentant: Tenant = {}
    tentants: Tenant[] = []
    cols: any[] = []
    tenantDialog: boolean = false
    deleteTenantDialog: boolean = false
    selectedAccomodation!: any
    rooms: Room[] = []
    selectedRoom: any
    tenantForm: FormGroup
    returnDate: Date | undefined = moment(Date.now()).toDate()

    constructor(
        private messageService: MessageService,
        private auth: AuthenticationService,
        private accomodationService: AccomodationService,
        private roomService: RoomService,
        private tenantService: TenantService,
    ) {
        this.tenantForm = new FormGroup({
            firstName: new FormControl(this.tentant.firstName, [Validators.required]),
            lastName: new FormControl(this.tentant.lastName, [Validators.required]),
            startDate: new FormControl(this.tentant.startDate, [Validators.required]),
            identifyNum: new FormControl(this.tentant.identifyNum, [Validators.required]),
            phone: new FormControl(this.tentant.phone, [Validators.required]),
            email: new FormControl(this.tentant.email, []),
        })
    }

    ngOnInit(): void {
        this.user = this.auth.userValue
        this.getDropdownAccomodation()
        this.tenantForm.get('firstName')?.valueChanges.subscribe((data) => (this.tentant.firstName = data))
        this.tenantForm.get('lastName')?.valueChanges.subscribe((data) => (this.tentant.lastName = data))
        this.tenantForm.get('startDate')?.valueChanges.subscribe((data) => (this.tentant.startDate = data))
        this.tenantForm.get('identifyNum')?.valueChanges.subscribe((data) => (this.tentant.identifyNum = data))
        this.tenantForm.get('phone')?.valueChanges.subscribe((data) => (this.tentant.phone = data))
        this.tenantForm.get('email')?.valueChanges.subscribe((data) => (this.tentant.email = data))
    }

    getDropdownAccomodation() {
        this.loading = true
        this.accomodationService
            .getDropdownAccomodation(this.user?.id)
            .pipe(
                finalize(() => {
                    this.selectedAccomodation = this.accomodations[0]
                    this.getRoomAndTenantData()
                }),
            )
            .subscribe((response) => (this.accomodations = response.data))
    }

    openNew() {
        this.tentant = {}
        this.tenantForm.get('firstName')?.setValue(null)
        this.tenantForm.get('lastName')?.setValue(null)
        this.tenantForm.get('startDate')?.setValue(null)
        this.tenantForm.get('identifyNum')?.setValue(null)
        this.tenantForm.get('phone')?.setValue(null)
        this.tenantForm.get('email')?.setValue(null)
        this.tenantDialog = true
    }

    getRoomByAccomodation() {
        return this.roomService.getRoomDropDown(this.selectedAccomodation.id).pipe(
            finalize(() => {
                this.loading = false
            }),
        )
    }

    getTenantByAccomodation() {
        return this.tenantService.getTenantByAccomodation(this.selectedAccomodation.id).pipe(
            finalize(() => {
                this.loading = false
            }),
        )
    }

    getRoomAndTenantData() {
        forkJoin({
            rooms: this.getRoomByAccomodation(),
            tenants: this.getTenantByAccomodation(),
        })
            .pipe(
                finalize(() => {
                    this.loading = false
                }),
            )
            .subscribe((response) => {
                this.rooms = response.rooms.data
                this.tentants = response.tenants.data
            })
    }

    onSelectAccomodation() {
        this.loading = true
        this.getRoomAndTenantData()
    }

    returnRoom(tentant: Tenant) {
        this.deleteTenantDialog = true
        this.tentant = { ...tentant }
        let request: { id: any; returnDate: any } = { id: this.tentant.id, returnDate: this.returnDate }
        this.tenantService.returnRoom(request).pipe(
            finalize(() => {
                this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Trả phòng thành công', life: 3000 })
            }),
        ).subscribe
    }

    editTenant(tentant: Tenant) {
        this.tentant = { ...tentant }
        this.tenantForm.get('firstName')?.setValue(tentant.firstName)
        this.tenantForm.get('lastName')?.setValue(tentant.lastName)
        if (tentant.startDate) {
            this.tenantForm.get('startDate')?.setValue(moment(tentant.startDate).toDate())
        } else {
            this.tenantForm.get('startDate')?.setValue(moment(new Date()).toDate())
        }
        this.tenantForm.get('identifyNum')?.setValue(tentant.identifyNum)
        this.tenantForm.get('email')?.setValue(tentant.email)
        this.tenantForm.get('phone')?.setValue(tentant.phone)
        this.tenantDialog = true
    }

    hideDialog() {
        this.tenantDialog = false
    }

    saveTenant() {
        this.loading = true
        let message: string
        if (this.tentant.id) {
            message = 'Chỉnh sửa thành công'
        } else {
            message = 'Thêm thành công'
        }
        this.tenantService
            .saveTenant(this.tentant)
            .pipe(
                finalize(() => {
                    this.messageService.add({ severity: 'success', summary: 'Successful', detail: message, life: 3000 })
                    this.getRoomAndTenantData()
                }),
            )
            .subscribe((data) => console.log(data))
        this.tenantDialog = false
    }

    confirmDelete() {
        this.loading = true
        this.deleteTenantDialog = false
        let request: { id?: any; returnDate?: any } = { id: this.tentant.id, returnDate: this.returnDate }
        console.log(request)
        this.tenantService
            .returnRoom(request)
            .pipe(
                finalize(() => {
                    this.getTenantByAccomodation()
                        .pipe(
                            finalize(() => {
                                this.loading = false
                            }),
                        )
                        .subscribe((res) => (this.tentants = res.data))
                }),
            )
            .subscribe()
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains')
    }
}
