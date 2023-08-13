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
    selectedAccomodation!: any;
    rooms: Room[] = []
    selectedRoom: any;
    tenantForm: FormGroup;

    constructor(private auth: AuthenticationService, private accomodationService: AccomodationService, private roomService: RoomService, private tenantService: TenantService) {
        this.tenantForm = new FormGroup (
            {
                firstName: new FormControl(this.tentant.firstName, [Validators.required]),
                lastName: new FormControl(this.tentant.lastName, [Validators.required]),
                room: new FormControl(this.tentant.room),
                status: new FormControl(this.tentant.imageUrl, [Validators.required]),
                startDate: new FormControl(this.tentant.startDate, [Validators.required]),
                identifyNum: new FormControl(this.tentant.identifyNum, [Validators.required]),
                image: new FormControl(this.tentant.imageUrl),
                phone: new FormControl(this.tentant.phone, [Validators.required]),
                email: new FormControl(this.tentant.email, [Validators.required])
            }
        )
    }

    ngOnInit(): void {
        this.user = this.auth.userValue
        this.getDropdownAccomodation()
        this.tenantForm.get('firstName')?.valueChanges.subscribe(data => this.tentant.firstName = data)
        this.tenantForm.get('lastName')?.valueChanges.subscribe(data => this.tentant.lastName = data)
        this.tenantForm.get('room')?.valueChanges.subscribe(data => this.tentant.room = data)
        this.tenantForm.get('status')?.valueChanges.subscribe(data => this.tentant.isStayed = data)
        this.tenantForm.get('startDate')?.valueChanges.subscribe(data => this.tentant.startDate = data)
        this.tenantForm.get('identifyNum')?.valueChanges.subscribe(data => this.tentant.identifyNum = data)
        this.tenantForm.get('image')?.valueChanges.subscribe(data => this.tentant.imageUrl = data)
        this.tenantForm.get('phone')?.valueChanges.subscribe(data => this.tentant.phone = data)
        this.tenantForm.get('email')?.valueChanges.subscribe(data => this.tentant.email = data)
    }

    getDropdownAccomodation() {
        this.loading = true
        this.accomodationService.getDropdownAccomodation(this.user?.id).pipe(
            finalize(() => {
                this.selectedAccomodation = this.accomodations[0];
                this.getRoomAndTenantData()
            })
        ).subscribe(response => this.accomodations = response.data)
    }

    openNew() {
        this.tentant = {}
        this.tenantForm.get('firstName')?.setValue('')
        this.tenantForm.get('lastName')?.setValue('')
        this.tenantForm.get('room')?.setValue({})
        this.tenantForm.get('status')?.setValue(true)
        this.tenantForm.get('startDate')?.setValue('')
        this.tenantForm.get('identifyNum')?.setValue('')
        this.tenantForm.get('image')?.setValue('')
        this.tenantForm.get('phone')?.setValue('')
        this.tenantForm.get('email')?.setValue('')
        this.tenantDialog = true
    }

    getRoomByAccomodation() {
        return this.roomService
            .getRoomDropDown(this.selectedAccomodation.id)
            .pipe(
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
        forkJoin(
            {
                rooms: this.getRoomByAccomodation(),
                tenants: this.getTenantByAccomodation()
            }
        ).pipe(
            finalize(() => {
                this.loading = false;
            })
        ).subscribe(response => {
            this.rooms = response.rooms.data
            this.tentants = response.tenants.data
        })
    }
 
    onSelectAccomodation() {
        this.loading = true;
        this.getRoomAndTenantData()
    }

    deleteTenant(tentant: Tenant) {
        this.deleteTenantDialog = true
        this.tentant = { ...tentant }
    }

    editTenant(tentant: Tenant) {
        this.tentant = { ...tentant }
        this.tenantForm.get('firstName')?.setValue(tentant.firstName)
        this.tenantForm.get('lastName')?.setValue(tentant.lastName)
        this.tenantForm.get('room')?.setValue(tentant.room)
        this.tenantForm.get('status')?.setValue(tentant.isStayed)
        this.tenantForm.get('startDate')?.setValue(moment(tentant.startDate).toDate())
        this.tenantForm.get('identifyNum')?.setValue(tentant.identifyNum)
        this.tenantForm.get('image')?.setValue(tentant.imageUrl)
        this.tenantForm.get('email')?.setValue(tentant.email)
        this.tenantForm.get('phone')?.setValue(tentant.phone)
        this.tenantDialog = true
    }

    hideDialog() {
        this.tenantDialog = false
    }

    saveTenant() {
        this.loading = true
        
        this.tenantService.saveTenant(this.tentant).pipe(
            finalize(() => {
                this.getRoomAndTenantData()
            })
        ).subscribe(data => console.log(data))
        this.tenantDialog = false
    }

    confirmDelete() {
        this.deleteTenantDialog = false
        
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains')
    }
}
