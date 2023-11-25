/** @format */

import { Component, OnInit } from '@angular/core'
import { MenuItem, MessageService } from 'primeng/api'
import { Table } from 'primeng/table'
import { forkJoin, finalize } from 'rxjs'
import { Post } from 'src/app/modules/landlord/model/post.model'
import { AddressService } from 'src/app/modules/landlord/service/address.service'
import { PostService } from 'src/app/modules/landlord/service/post.service'
import { User } from 'src/app/modules/model/user.model'

@Component({
    selector: 'app-post-list',
    templateUrl: './post-list.component.html',
    styleUrls: ['./post-list.component.scss'],
    providers: [MessageService],
})
export class PostListComponent implements OnInit {
    posts: Post[] = []
    post: Post = {}
    rowsPerPageOptions = [5, 10, 20]
    user!: User | null
    items: MenuItem[] = []
    loading: boolean = false
    provices: any[] = []
    selectedProvince: any
    detailDialog: boolean = false
    roomSelected: any

    currentStatus: string | null = null
    activeIndex: number = 0
    status = new Map<number, string | null>()

    constructor(private postService: PostService, private addressService: AddressService, private messageService: MessageService) {
        this.status.set(0, 'IN_PROGRESS')
        this.status.set(1, 'APPROVED')
        this.status.set(2, 'REJECTED')
        this.status.set(3, null)
    }

    ngOnInit(): void {
        this.getPostByStatus()
    }

    onShowMenu(post: Post) {
        this.getMenuItems(post)
    }

    toggleMenu(menu: any, event: any) {
        menu.toggle(event)
    }

    onChangeTab(e: any) {
        console.log(this.activeIndex)

        this.loading = true
        this.getPostByStatus()
    }

    getPostByStatus() {
        this.loading = true
        this.posts = []
        let request: { status: string | null | undefined } = { status: this.status.get(this.activeIndex) }
        this.postService
            .getPostByStatus(request)
            .pipe(
                finalize(() => {
                    this.loading = false
                }),
            )
            .subscribe((response) => (this.posts = response.data))
    }

    getProvinces() {
        return this.addressService.getAllProvinces().pipe(finalize(() => (this.selectedProvince = this.provices[0])))
    }

    getMenuItems(post: Post): MenuItem[] {
        this.items = [
            {
                icon: 'pi pi-info-circle',
                label: 'Xem chi tiết',
                command: (e: any) => {
                    this.onShowDetail(e.item.data)
                },
            },
            {
                icon: 'pi pi-lock',
                label: 'Khoá bài',
                visible: post.status === 'APPROVED' || post.status === 'IN_PROGRESS',
                command: (e: any) => {
                    this.post = { ...e.item.data }
                    this.changeStatusPost({postId: this.post.id, status: 'REJECTED'})
                },
            },
            {
                icon: 'pi pi-lock-open',
                label: 'Mở khoá',
                visible: post.status === 'REJECTED',
                command: (e: any) => {
                    this.post = { ...e.item.data }
                    this.changeStatusPost({postId: this.post.id, status: 'IN_PROGRESS'})
                },
            },
            {
                icon: 'pi pi-check',
                label: 'Duyệt bài',
                visible: post.status === 'IN_PROGRESS',
                command: (e: any) => {
                    this.post = { ...e.item.data }
                    this.changeStatusPost({postId: this.post.id, status: 'APPROVED'})
                },
            },
        ]
        this.items.forEach((menuItem: any) => {
            menuItem.data = post
        })
        return this.items
    }

    changeStatusPost(request: {postId: any, status: any}) {
        this.loading = true
        let message: string
        switch (request.status) {
            case 'IN_PROGRESS':
                message = 'Mở khoá thành công'
                break;
            case 'APPROVED':
                message = 'Duyệt bài đăng thành công'
                break;
            case 'REJECTED':
                message = 'Khoá bài đăng thành công'
                break;
            default:
                break;
        }
        this.postService
            .changeStatusPost(request)
            .pipe(
                finalize(() => {
                    this.getPostByStatus()
                    this.post = {}
                    this.messageService.add({ severity: 'success', summary: 'Thành công', detail: message, life: 3000 })
                }),
            )
            .subscribe()
    }

    onShowDetail(room: any) {
        this.roomSelected = room
        this.detailDialog = true
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains')
    }
}
