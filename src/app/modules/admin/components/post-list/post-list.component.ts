/** @format */

import { Component, OnInit } from '@angular/core'
import { MenuItem, MessageService } from 'primeng/api'
import { Table } from 'primeng/table'
import { Post } from 'src/app/modules/landlord/model/post.model'
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

    constructor() {}

    ngOnInit(): void {}

    onShowMenu(post: Post) {
        this.getMenuItems(post)
    }

    toggleMenu(menu: any, event: any) {
        menu.toggle(event)
    }

    getMenuItems(post: Post): MenuItem[] {
        this.items = [
            {
                icon: 'pi pi-pencil',
                label: 'Xem chi tiết',
                command: (e: any) => {
                    // this.editPost(e.item.data)
                },
            },
            {
                icon: 'pi pi-check',
                label: 'Khoá bài',
                visible: post.isActive,
                command: (e: any) => {
                    this.post = { ...e.item.data }
                    // this.changeStatusPost(false)
                },
            },
            {
                icon: 'pi pi-check',
                label: 'Duyệt bài',
                visible: !post.isActive,
                command: (e: any) => {
                    this.post = { ...e.item.data }
                    // this.changeStatusPost(true)
                },
            }
        ]
        this.items.forEach((menuItem: any) => {
            menuItem.data = post
        })
        return this.items
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains')
    }
}
