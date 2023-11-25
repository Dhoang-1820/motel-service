/** @format */

import { Component, OnInit } from '@angular/core'
import { FormControl, FormGroup, Validators } from '@angular/forms'
import { MenuItem, MessageService } from 'primeng/api'
import { Table } from 'primeng/table'
import { finalize, forkJoin } from 'rxjs'
import { AuthenticationService } from 'src/app/modules/auth/service/authentication.service'
import { AppConstant } from 'src/app/modules/common/Constants'
import { User } from 'src/app/modules/model/user.model'
import { AccomodationUtilities, Room } from '../../model/accomodation.model'
import { Post } from '../../model/post.model'
import { AccomodationService } from '../../service/accomodation.service'
import { PostService } from '../../service/post.service'
import { RoomService } from '../../service/room.service'
import { AddressService } from '../../service/address.service'

@Component({
    selector: 'app-post',
    templateUrl: './post.component.html',
    styleUrls: ['./post.component.scss'],
    providers: [MessageService],
})
export class PostComponent implements OnInit {
    invoiceDialog: boolean = false

    accomodations: any[] = []
    selectedAccomodation!: any

    posts: Post[] = []
    post: Post = {}
    rowsPerPageOptions = [5, 10, 20]
    user!: User | null
    dataLoading: boolean = false
    loading: boolean = false
    postForm: FormGroup
    issueRequest!: { roomId: any; month?: Date }
    postDialog: boolean = false

    services: AccomodationUtilities[] = []
    servicesDisplayed: AccomodationUtilities[] = []
    selectedServices: AccomodationUtilities[] = []
    contractInfoLoading: boolean = false

    items: MenuItem[] = []
    linkUpload: string = "http://localhost:8080/motel-service/api/post/image/"
    responsiveOptions: any[];
    deleteImageDialog: boolean = false
    selectedImage: any;
    deleteLoading: boolean = false;
    gender: any = AppConstant.GENDER

    provices: any[] = []
    districts: any[] = []
    wards: any[] = []

    selectedProvince: any
    selectedDistrict: any
    selectedWard: any
    existingProvince!: any;
    existingDistrict!: any;
    existingWard: any = {}

    addLoading: boolean = false

    constructor(
        private accomodationService: AccomodationService,
        private auth: AuthenticationService,
        private messageService: MessageService,
        private postService: PostService,
        private roomService: RoomService,
        private addressService: AddressService,
    ) {
        this.postForm = new FormGroup({
            title: new FormControl(this.post.title, [Validators.required]),
            content: new FormControl(this.post.content, [Validators.required]),
            price: new FormControl(this.post.price, [Validators.required]),
            acreage: new FormControl(this.post.acreage, []),
            capacity: new FormControl(this.post.capacity, []),
            status: new FormControl(this.post.status, []),
            province: new FormControl(this.post.province, [Validators.required]),
            district: new FormControl(this.post.district, [Validators.required]),
            ward: new FormControl(this.post.ward, [Validators.required]),
            addressLine: new FormControl(this.post.addressLine, [Validators.required]),
        })

        this.responsiveOptions = [
            {
                breakpoint: '1024px',
                numVisible: 5
            },
            {
                breakpoint: '768px',
                numVisible: 3
            },
            {
                breakpoint: '560px',
                numVisible: 1
            }
        ];

    }

    ngOnInit() {
        this.user = this.auth.userValue
        this.getDropdownAccomodation()

        this.postForm.get('title')?.valueChanges.subscribe((data) => {
            this.post.title = data
        })
        this.postForm.get('content')?.valueChanges.subscribe((data) => {
            this.post.content = data
        })

        this.postForm.get('price')?.valueChanges.subscribe(data => {
            this.post.price = data
        })
        this.postForm.get('acreage')?.valueChanges.subscribe(data => {
            this.post.acreage = data
        })
        this.postForm.get('capacity')?.valueChanges.subscribe(data => {
            this.post.capacity = data
        })

        this.postForm.get('province')?.valueChanges.subscribe(data => {
            if (data) {
                this.post.province = data.name
                this.post.provinceCode = data.code
                this.selectedProvince = data.code
            }
        })      
        this.postForm.get('district')?.valueChanges.subscribe(data => {
            if (data) {
                this.post.district = data.name
                this.post.districtCode = data.code
                this.selectedDistrict = data.code
            }
        })        
        this.postForm.get('ward')?.valueChanges.subscribe(data => {
            if (data) {
                this.post.ward = data.name
                this.post.wardCode = data.code
            }
        })       
        this.postForm.get('addressLine')?.valueChanges.subscribe(data => {
            if (data) {
                this.post.addressLine = data
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

    getFullAddress() {
        return forkJoin({
            districts: this.addressService.getDistrictByProvince(this.selectedAccomodation.provinceCode),
            wards: this.addressService.getWardByDistrict(this.selectedAccomodation.districtCode)
        })
    }

    findAddressByName(code: any, source: any[]) {
        return source.find((item: any) => item.code === code)
    }

    openNew() {
        this.post = {}
        this.existingProvince = this.findAddressByName(this.selectedAccomodation.provinceCode, this.provices)
        this.postForm.get('province')?.setValue(this.existingProvince )        
        this.postForm.get('addressLine')?.setValue(this.selectedAccomodation.addressLine) 
        this.addLoading = true
        this.getFullAddress().pipe(
            finalize(() => {
                this.existingDistrict = this.findAddressByName(this.selectedAccomodation.districtCode, this.districts)
                this.existingWard = this.findAddressByName(this.selectedAccomodation.wardCode, this.wards)
                this.postForm.get('district')?.setValue(this.existingDistrict)  
                this.postForm.get('ward')?.setValue(this.existingWard)   
                this.addLoading = false    
                this.postDialog = true
            })
        ).subscribe((response: any) => {
            this.districts = response.districts.districts
            this.wards = response.wards.wards
        })
       
    }
    

    onShowMenu(post: Post) {
        this.getMenuItems(post)
    }

    onMoveBackService(value: any) {
        value.items.forEach((service: any) => (service.quantity = 1))
    }

    getMenuItems(post: Post): MenuItem[] {
        this.items = [
            {
                icon: 'pi pi-pencil',
                label: 'Sửa bài đăng',
                command: (e: any) => {
                    this.editPost(e.item.data)
                },
            },
            {
                icon: 'pi pi-check',
                label: 'Gỡ bài',
                visible: post.isActive,
                command: (e: any) => {
                    this.post = {...e.item.data}
                    this.changeStatusPost(false)
                },
            },
            {
                icon: 'pi pi-check',
                label: 'Đăng bài',
                visible: !post.isActive,
                command: (e: any) => {
                    this.post = {...e.item.data}
                    this.changeStatusPost(true)
                },
            },
            {
                label: 'Xoá',
                icon: 'pi pi-trash',
                command: (e) => {
                    this.post = {...e.item.data}
                    this.removePost()
                },
            },
        ]
        this.items.forEach((menuItem: any) => {
            menuItem.data = post
        })
        return this.items
    }

    toggleMenu(menu: any, event: any) {
        menu.toggle(event)
    }

    removePost() {
        this.loading = true
        this.postService.removePost(this.post.id).pipe(
            finalize(() => {
                this.initData()
                this.post = {}
                this.messageService.add({ severity: 'success', summary: 'Thành công', detail: 'Xoá thành công', life: 3000 })
            }),
        ).subscribe()
    }

    getDropdownAccomodation() {
        this.loading = true
        this.accomodationService
            .getDropdownAccomodation(this.user?.id)
            .pipe(
                finalize(() => {
                    this.selectedAccomodation = this.accomodations[0]
                    this.initData()
                }),
            )
        .subscribe((response) => (this.accomodations = response.data)) 
    }

    initData() {
        forkJoin({
            posts: this.getPostByAccomodation(),
            services: this.getAccomdationService(),
            provinces: this.getProvinces(),
        })
            .pipe(
                finalize(() => {
                    this.loading = false
                    this.servicesDisplayed = JSON.parse(JSON.stringify(this.services))
                }),
            )
            .subscribe((response) => {
                this.posts = response.posts.data
                this.services = response.services.data
                this.provices = response.provinces
            })
    }

    getAccomdationService() {
        return this.accomodationService.getAccomodationService(this.selectedAccomodation.id)
    }

    getRoomNoPostAndDeposit() {
        return this.roomService.getRoomNoPostAndDeposit(this.selectedAccomodation.id)
    }

    getPostByAccomodation() {
        return this.postService.getByUserIdAndAccomodation(this.user?.id, this.selectedAccomodation.id)
    }

    onSelectAccomodation() {
        this.initData()
    }

    hideDialog() {
        this.invoiceDialog = false
    }

    savePost() {
        console.log(this.post)
        if (!this.postForm.invalid) {
            this.loading = true
            let message: string
            if (this.post.id) {
                message = 'Chỉnh sửa thành công'
            } else {
                message = 'Thêm thành công'
            }
            this.post.userId = this.user?.id
            this.postService
                .savePost(this.post)
                .pipe(
                    finalize(() => {
                        this.initData()
                        this.post = {}
                        this.postDialog = false
                        this.messageService.add({ severity: 'success', summary: 'Thành công', detail: message, life: 3000 })
                    }),
                )
                .subscribe()
        } else {
            this.postForm.markAllAsTouched()
        }
    }

    changeStatusPost(status: boolean) {
        this.loading = true
        this.post.isActive = status
        let message: string
        if (status) {
            message = 'Gỡ bài đăng thành công'
        } else {
            message = 'Đăng bài thành công'
        }

        this.postService.changeStatusPost(this.post).pipe(
            finalize(() => {
                this.initData()
                this.post = {}
                this.messageService.add({ severity: 'success', summary: 'Thành công', detail: message, life: 3000 })
            }),
        ).subscribe()
    }

    getById(id: any, source: any[]) {
        let result = Object.assign({}, source.find(item => item.id === id))
        return result
    }

    editPost(post: any) {
        this.post = { ...post }
        this.postForm.get('title')?.setValue(this.post.title)
        this.postForm.get('content')?.setValue(this.post.content)
        this.postForm.get('price')?.setValue(this.post.price)
        this.postForm.get('acreage')?.setValue(this.post.acreage)
        this.postForm.get('capacity')?.setValue(this.post.capacity)
        this.postForm.get('status')?.setValue(this.post.status)
        this.existingProvince = this.findAddressByName(this.selectedAccomodation.provinceCode, this.provices)
        this.postForm.get('province')?.setValue(this.existingProvince )        
        this.postForm.get('addressLine')?.setValue(this.selectedAccomodation.addressLine) 
        this.loading = true
        this.getFullAddress().pipe(
            finalize(() => {
                this.existingDistrict = this.findAddressByName(this.selectedAccomodation.districtCode, this.districts)
                this.existingWard = this.findAddressByName(this.selectedAccomodation.wardCode, this.wards)
                this.postForm.get('district')?.setValue(this.existingDistrict)  
                this.postForm.get('ward')?.setValue(this.existingWard)   
                this.loading = false    
                this.postDialog = true
            })
        ).subscribe((response: any) => {
            this.districts = response.districts.districts
            this.wards = response.wards.wards
        })
    }

    onHideDialog() {
        this.selectedServices = []
        this.servicesDisplayed = JSON.parse(JSON.stringify(this.services))
        this.postForm.reset()
    }

    getImagesByPost() {
        this.loading = true;
        this.postService.getImageByPost(this.post.id).pipe(
            finalize(() => {
                this.loading = false
                this.deleteLoading = false
            }),
        ).subscribe(res => this.post.images = res.data)
    }

    removeImageByPost(imgId: any) {
        this.post.images = this.post.images?.filter(item => item.imageId !== imgId)
    }

    onDeleteImage(imgId: any) {
        this.deleteLoading = true
        this.postService.removeImage(imgId).pipe(
            finalize(() => {
                this.removeImageByPost(imgId)
            }),
        ).subscribe()
    }

    onUpload(e: any) {
        console.log(e)
        this.getImagesByPost()
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains')
    }

    get staticElectricPriceName() {
        return AppConstant.ELECTRIC_PRICE_NAME
    }

    get staticWaterPriceName() {
        return AppConstant.WATER_PRICE_NAME
    }

    getStaticEletricName() {
        return AppConstant.ELECTRIC_PRICE_NAME
    }

    getStaticWaterName() {
        return AppConstant.WATER_PRICE_NAME
    }
}
