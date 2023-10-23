import { Component, OnInit } from '@angular/core'
import { FormControl, FormGroup, Validators } from '@angular/forms'
import { MessageService } from 'primeng/api'
import { Table } from 'primeng/table'
import { finalize, forkJoin } from 'rxjs'
import { AuthenticationService } from 'src/app/modules/auth/service/authentication.service'
import { AppConstant } from 'src/app/modules/common/Constants'
import { User } from 'src/app/modules/model/user.model'
import { Accomodation, AccomodationUtilities } from '../../model/accomodation.model'
import { AccomodationService } from '../../service/accomodation.service'
import { AddressService } from '../../service/address.service'

@Component({
    selector: 'app-accomodations',
    templateUrl: './accomodations.component.html',
    styleUrls: ['./accomodations.component.scss'],
    providers: [MessageService],
})
export class AccomodationsComponent implements OnInit {
    addDialog: boolean = false
    otherFeesDialog: boolean = false
    deleteDialog: boolean = false
    accomodations: Accomodation[] = []
    accomodation: Accomodation = {}
    submitted: boolean = false
    rowsPerPageOptions = [5, 10, 20]
    dataLoading: boolean = false
    loading: boolean = false
    provices: any[] = []
    districts: any[] = []
    wards: any[] = []
    selectedProvince: any
    selectedDistrict: any
    selectedWard: any
    user!: User | null

    existingProvince!: any;
    existingDistrict!: any;
    existingWard: any = {}

    accomodationForm: FormGroup
    accomodationUtilities!: AccomodationUtilities[]
    accomodationUtility!: AccomodationUtilities
    waterPrice!: Number | undefined;
    electricPrice!: Number | undefined

    constructor(
        private accomodationService: AccomodationService,
        private messageService: MessageService,
        private auth: AuthenticationService,
        private addressService: AddressService,
    ) {
        this.accomodationForm = new FormGroup({
            name: new FormControl(this.accomodation.name, [Validators.required]),
            province: new FormControl(this.accomodation.province, [Validators.required]),
            district: new FormControl(this.accomodation.district, [Validators.required]),
            ward: new FormControl(this.accomodation.ward, [Validators.required]),
            addressLine: new FormControl(this.accomodation.addressLine, [Validators.required]),
            waterPrice: new FormControl(this.waterPrice, [Validators.required]),
            electricPrice: new FormControl(this.electricPrice, [Validators.required])
        })
    }

    ngOnInit() {
        this.user = this.auth.userValue

        forkJoin({
            provinces: this.getProvinces(),
            accomodations: this.getAccomodationsByUser(),
        })
        .subscribe((response) => {
                this.provices = response.provinces
                this.accomodations = response.accomodations.data
            })

        this.accomodationForm.get('name')?.valueChanges.subscribe(data => {
            this.accomodation.name = data
        })
        this.accomodationForm.get('waterPrice')?.valueChanges.subscribe(data => {
            this.waterPrice = data
        })
        this.accomodationForm.get('electricPrice')?.valueChanges.subscribe(data => {
            this.electricPrice = data
        })
        this.accomodationForm.get('province')?.valueChanges.subscribe(data => {
            if (data) {
                this.accomodation.province = data.name
                this.accomodation.provinceCode = data.code
                this.selectedProvince = data.code
            }
        })      
        this.accomodationForm.get('district')?.valueChanges.subscribe(data => {
            if (data) {
                this.accomodation.district = data.name
                this.accomodation.districtCode = data.code
                this.selectedDistrict = data.code
            }
        })        
        this.accomodationForm.get('ward')?.valueChanges.subscribe(data => {
            if (data) {
                this.accomodation.ward = data.name
                this.accomodation.wardCode = data.code
            }
        })       
        this.accomodationForm.get('addressLine')?.valueChanges.subscribe(data => {
            if (data) {
                this.accomodation.addressLine = data
            }
        })  
    }

    getAccomodationsByUser() {
        this.dataLoading = true
        return this.accomodationService.getAccomodationByUserId(this.user?.id).pipe(
            finalize(() => {
                this.dataLoading = false
            }),
        )
    }

    getWardByDistrict() {
        this.wards = []
        this.addressService.getWardByDistrict(this.selectedDistrict).subscribe((result) => (this.wards = result.wards))
    }

    getDistrictByProvince() {
        this.districts = []
        this.wards = []
        this.addressService
            .getDistrictByProvince(this.selectedProvince)
            .subscribe((result) => (this.districts = result.districts))
    }

    getProvinces() {
        return this.addressService.getAllProvinces().pipe(
            finalize(() => this.selectedProvince = this.provices[0])
        )
    }

    hideOtherFeeDialog() {
        this.otherFeesDialog = false
        this.submitted = false
    }
    openNew() {
        this.accomodation = {}
        this.accomodationForm.get('name')?.setValue(null)        
        this.accomodationForm.get('province')?.setValue(null)        
        this.accomodationForm.get('district')?.setValue(null)        
        this.accomodationForm.get('ward')?.setValue(null)        
        this.accomodationForm.get('addressLine')?.setValue(null)  
        this.accomodationForm.get('waterPrice')?.setValue(null)  
        this.accomodationForm.get('electricPrice')?.setValue(null) 
        this.addDialog = true
    }

    getFullAddress() {
        return forkJoin({
            districts: this.addressService.getDistrictByProvince(this.accomodation.provinceCode),
            wards: this.addressService.getWardByDistrict(this.accomodation.districtCode)
        })
    }

    editAccomodation(accomodation: any) {
        this.accomodation = { ...accomodation }
        console.log(this.accomodation)
        accomodation.loading = true;
        this.existingProvince = this.findAddressByName(this.accomodation.provinceCode, this.provices)
        this.accomodationForm.get('name')?.setValue(this.accomodation.name)     
        this.accomodationForm.get('province')?.setValue(this.existingProvince )        
        this.accomodationForm.get('addressLine')?.setValue(this.accomodation.addressLine) 
        let electric = null
        let water = null
        this.accomodation.services?.forEach(item => {
            if (item.name === AppConstant.ELECTRIC_PRICE_NAME) {
                electric = item.price
            } else if (item.name === AppConstant.WATER_PRICE_NAME) {
                water = item.price
            }
        })
        this.accomodationForm.get('electricPrice')?.setValue(electric) 
        this.accomodationForm.get('waterPrice')?.setValue(water)  
        
        this.getFullAddress().pipe(
            finalize(() => {
                this.existingDistrict = this.findAddressByName(this.accomodation.districtCode, this.districts)
                this.existingWard = this.findAddressByName(this.accomodation.wardCode, this.wards)
                this.accomodationForm.get('district')?.setValue(this.existingDistrict)  
                this.accomodationForm.get('ward')?.setValue(this.existingWard)       
                this.addDialog = true
                accomodation.loading = false
            })
        ).subscribe((response: any) => {
            this.districts = response.districts.districts
            this.wards = response.wards.wards
        })
    }

    findAddressByName(code: any, source: any[]) {
        return source.find((item: any) => item.code === code)
    }

    deleteAccomodation(accomodation: Accomodation) {
        this.deleteDialog = true
        this.accomodation = { ...accomodation }
    }

    confirmDelete() {
        this.deleteDialog = false
        this.accomodations = this.accomodations.filter((val) => val.id !== this.accomodation.id)
        this.accomodationService.removeAccomodation(this.accomodation.id).pipe().subscribe()
        this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Accomodation Deleted', life: 3000 })
        this.accomodation = {}
    }

    saveAccomodation() {
        if (!this.accomodationForm.invalid) {
            let accomodationSubmit = Object.assign({}, this.accomodation)
            console.log('this.accomodation', this.accomodation)
            let message: string
            if (accomodationSubmit.id) {
                message = 'Chỉnh sửa thành công'
                accomodationSubmit.services?.forEach(item => {
                    if (item.name === AppConstant.ELECTRIC_PRICE_NAME) {
                        item.price = this.electricPrice
                    } else if (item.name === AppConstant.WATER_PRICE_NAME) {
                        item.price = this.waterPrice
                    }
                })
            } else {
                message = 'Thêm thành công'
                let service: AccomodationUtilities = {};
                let services: AccomodationUtilities[] = []
                service.name = AppConstant.ELECTRIC_PRICE_NAME
                service.price = this.electricPrice
                service.unit = 'Số (kWh)'
                service.isDefault = true
                services.push(service);
                service = {}
                // 
                service.name = AppConstant.WATER_PRICE_NAME
                service.price = this.waterPrice
                service.unit = 'Khối (m3)'
                service.isDefault = true
                services.push(service)
                accomodationSubmit.services = services
            }
            console.log('accomodationSubmit',accomodationSubmit)
            accomodationSubmit.userId = this.user?.id
            this.dataLoading = true
            this.accomodationService
                .saveAccomodation(accomodationSubmit)
                .pipe(
                    finalize(() => {
                        this.submitted = false
                        this.messageService.add({ severity: 'success', summary: 'Successful', detail: message, life: 3000 })
                        this.dataLoading = false
                    }),
                )
                .subscribe((result) => this.accomodations = result.data)
            this.addDialog = false
        } else {
            this.accomodationForm.markAllAsTouched()
        }
    }

    hideDialog() {
        this.addDialog = false
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains')
    }
}
