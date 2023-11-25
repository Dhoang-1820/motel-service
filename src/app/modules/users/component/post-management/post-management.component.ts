/** @format */

import { Component, OnInit } from '@angular/core'
import { FormGroup, FormControl, Validators } from '@angular/forms'
import { MessageService, MenuItem } from 'primeng/api'
import { Observable, finalize, forkJoin } from 'rxjs'
import { AuthenticationService } from 'src/app/modules/auth/service/authentication.service'
import { AppConstant } from 'src/app/modules/common/Constants'
import { AccomodationUtilities } from 'src/app/modules/landlord/model/accomodation.model'
import { Post } from 'src/app/modules/landlord/model/post.model'
import { AccomodationService } from 'src/app/modules/landlord/service/accomodation.service'
import { AddressService } from 'src/app/modules/landlord/service/address.service'
import { PostService } from 'src/app/modules/landlord/service/post.service'
import { RoomService } from 'src/app/modules/landlord/service/room.service'
import { User } from 'src/app/modules/model/user.model'
import { Table } from 'primeng/table'
import { Router } from '@angular/router'

@Component({
    selector: 'app-post-management',
    templateUrl: './post-management.component.html',
    styleUrls: ['./post-management.component.scss'],
    providers: [MessageService],
})
export class PostManagementComponent implements OnInit {
    invoiceDialog: boolean = false

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
    linkUpload: string = 'http://localhost:8080/motel-service/api/post/image/'
    responsiveOptions: any[]
    deleteImageDialog: boolean = false
    selectedImage: any[] = []
    deleteLoading: boolean = false
    gender: any = AppConstant.GENDER

    provices: any[] = []
    districts: any[] = []
    wards: any[] = []

    selectedProvince: any
    selectedDistrict: any
    selectedWard: any
    existingProvince!: any
    existingDistrict!: any
    existingWard: any = {}

    addLoading: boolean = false
    selectedFiles: File[] = []
    previewImage: any[] = []
    currentFile?: File

    imageInfos?: Observable<any>

    constructor(
        private auth: AuthenticationService,
        private messageService: MessageService,
        private postService: PostService,
        private addressService: AddressService,
        public router: Router,
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
                numVisible: 5,
            },
            {
                breakpoint: '768px',
                numVisible: 3,
            },
            {
                breakpoint: '560px',
                numVisible: 1,
            },
        ]
    }

    ngOnInit() {
        this.user = this.auth.userValue
        if (!this.user) {
            this.router.navigateByUrl('/auth')
        }
        this.initData()

        this.postForm.get('title')?.valueChanges.subscribe((data) => {
            this.post.title = data
        })
        this.postForm.get('content')?.valueChanges.subscribe((data) => {
            this.post.content = data
        })

        this.postForm.get('price')?.valueChanges.subscribe((data) => {
            this.post.price = data
        })
        this.postForm.get('acreage')?.valueChanges.subscribe((data) => {
            this.post.acreage = data
        })
        this.postForm.get('capacity')?.valueChanges.subscribe((data) => {
            this.post.capacity = data
        })

        this.postForm.get('province')?.valueChanges.subscribe((data) => {
            if (data) {
                this.post.province = data.name
                this.post.provinceCode = data.code
                this.selectedProvince = data.code
            }
        })
        this.postForm.get('district')?.valueChanges.subscribe((data) => {
            if (data) {
                this.post.district = data.name
                this.post.districtCode = data.code
                this.selectedDistrict = data.code
            }
        })
        this.postForm.get('ward')?.valueChanges.subscribe((data) => {
            if (data) {
                this.post.ward = data.name
                this.post.wardCode = data.code
            }
        })
        this.postForm.get('addressLine')?.valueChanges.subscribe((data) => {
            if (data) {
                this.post.addressLine = data
            }
        })
    }

    getWardByDistrict() {
        this.wards = []
        this.addressService.getWardByDistrict(this.selectedDistrict).subscribe((result) => (this.wards = result.wards))
    }

    getDistrictByProvince() {
        this.districts = []
        this.wards = []
        this.addressService.getDistrictByProvince(this.selectedProvince).subscribe((result) => (this.districts = result.districts))
    }

    getProvinces() {
        return this.addressService.getAllProvinces().pipe(finalize(() => (this.selectedProvince = this.provices[0])))
    }

    getFullAddress() {
        return forkJoin({
            districts: this.addressService.getDistrictByProvince(this.post.provinceCode),
            wards: this.addressService.getWardByDistrict(this.post.districtCode),
        })
    }

    findAddressByName(code: any, source: any[]) {
        return source.find((item: any) => item.code === code)
    }

    openNew() {
        this.post = {}
        this.postForm.get('title')?.setValue(null)
        this.postForm.get('content')?.setValue(null)
        this.postForm.get('price')?.setValue(null)
        this.postForm.get('acreage')?.setValue(null)
        this.postForm.get('capacity')?.setValue(null)
        this.postForm.get('province')?.setValue(null)
        this.postForm.get('district')?.setValue(null)
        this.postForm.get('ward')?.setValue(null)
        this.postForm.get('addressLine')?.setValue(null)
        this.postDialog = true
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
                    this.post = { ...e.item.data }
                    this.changeStatusPost(false)
                },
            },
            {
                icon: 'pi pi-check',
                label: 'Đăng bài',
                visible: !post.isActive,
                command: (e: any) => {
                    this.post = { ...e.item.data }
                    this.changeStatusPost(true)
                },
            },
            {
                label: 'Xoá',
                icon: 'pi pi-trash',
                command: (e) => {
                    this.post = { ...e.item.data }
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
        this.postService
            .removePost(this.post.id)
            .pipe(
                finalize(() => {
                    this.initData()
                    this.post = {}
                    this.messageService.add({ severity: 'success', summary: 'Thành công', detail: 'Xoá thành công', life: 3000 })
                }),
            )
            .subscribe()
    }

    initData() {
        this.loading = true
        forkJoin({
            posts: this.getPostByUserId(),
            provinces: this.getProvinces(),
        })
            .pipe(
                finalize(() => {
                    this.loading = false
                }),
            )
            .subscribe((response) => {
                this.posts = response.posts.data
                this.provices = response.provinces
            })
    }

    getPostByUserId() {
        return this.postService.getByUserId(this.user?.id)
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
            const request: FormData = new FormData()
            for (let i = 0; i < this.selectedFiles.length; i++) {
                request.append('file', this.selectedFiles[i])
            }
            request.append('data', JSON.stringify(this.post))
            console.log(request)
            this.postService
                .savePost(request)
                .pipe(
                    finalize(() => {
                        this.initData()
                        this.post = {}
                        this.previewImage = []
                        this.selectedFiles = []
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

        this.postService
            .changeStatusPost(this.post)
            .pipe(
                finalize(() => {
                    this.initData()
                    this.post = {}
                    this.messageService.add({ severity: 'success', summary: 'Thành công', detail: message, life: 3000 })
                }),
            )
            .subscribe()
    }

    editPost(post: any) {
        this.post = { ...post }
        this.postForm.get('title')?.setValue(this.post.title)
        this.postForm.get('content')?.setValue(this.post.content)
        this.postForm.get('price')?.setValue(this.post.price)
        this.postForm.get('acreage')?.setValue(this.post.acreage)
        this.postForm.get('capacity')?.setValue(this.post.capacity)
        this.postForm.get('status')?.setValue(this.post.status)
        this.existingProvince = this.findAddressByName(this.post.provinceCode, this.provices)
        this.postForm.get('province')?.setValue(this.existingProvince)
        this.postForm.get('addressLine')?.setValue(this.post.addressLine)
        this.loading = true
        this.getFullAddress()
            .pipe(
                finalize(() => {
                    this.existingDistrict = this.findAddressByName(this.post.districtCode, this.districts)
                    this.existingWard = this.findAddressByName(this.post.wardCode, this.wards)
                    this.postForm.get('district')?.setValue(this.existingDistrict)
                    this.postForm.get('ward')?.setValue(this.existingWard)
                    this.loading = false
                    this.postDialog = true
                }),
            )
            .subscribe((response: any) => {
                this.districts = response.districts.districts
                this.wards = response.wards.wards
            })
    }

    onHideDialog() {
        this.selectedServices = []
        this.servicesDisplayed = JSON.parse(JSON.stringify(this.services))
        this.previewImage = []
        this.selectedFiles = []
        this.postForm.reset()
    }

    removeImageByPost(imgId: any) {
        this.post.images = this.post.images?.filter((item) => item.imageId !== imgId)
    }

    onDeleteImage(imgId: any) {
        this.deleteLoading = true
        this.postService
            .removeImage(imgId)
            .pipe(
                finalize(() => {
                    this.removeImageByPost(imgId)
                }),
            )
            .subscribe()
    }

    deleteImage(index: number) {
        this.previewImage.splice(index, 1)
        this.selectedFiles.splice(index, 1)
        if (this.post) {
            console.log('next')
        }
    }

    selectFile(event: any): void {
        const files = event.target.files
        if (files) {
            for (let i = 0; i < files.length; i++) {
                const file: File = files[i]
                this.selectedFiles.push(file)
                if (file) {
                    this.currentFile = file
                    const reader = new FileReader()

                    reader.onload = (e: any) => {
                        this.previewImage.push(e.target.result)
                    }
                    reader.readAsDataURL(this.currentFile)
                }
            }
        }
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
