import { Component, OnInit } from '@angular/core'
import { MessageService } from 'primeng/api'
import { Table } from 'primeng/table'
import { finalize } from 'rxjs'
import { AuthenticationService } from 'src/app/modules/auth/service/authentication.service'
import { Room } from 'src/app/modules/landlord/model/accomodation.model'
import { User } from 'src/app/modules/model/user.model'
import { UserManagementService } from '../../services/user-management.service'

@Component({
    selector: 'app-user-management',
    templateUrl: './user-management.component.html',
    styleUrls: ['./user-management.component.scss'],
    providers: [MessageService],
})
export class UserManagementComponent implements OnInit {
    userDialog: boolean = false
    deleteUserDialog: boolean = false
    users: any[] = []
    userSelected: any = {}
    selectedProducts: Room[] = []
    submitted: boolean = false
    cols: any[] = []
    statuses: any[] = []
    rowsPerPageOptions = [5, 10, 20]
    user!: User | null
    dataLoading: boolean = false
    loading: boolean = false

    constructor(private auth: AuthenticationService, private messageService: MessageService, private userService: UserManagementService) {}

    ngOnInit() {
        this.user = this.auth.userValue
        this.getAllUsers().subscribe((response) => (this.users = response.data))
    }

    openNew() {
        this.userSelected = {}
        this.userSelected.active = true
        this.submitted = false
        this.userDialog = true
    }

    getAllUsers() {
        this.loading = true
        return this.userService.getAllUsers().pipe(
            finalize(() => {
                this.loading = false
            }),
        )
    }

    editProduct(userSelected: any) {
        console.log(this.userSelected)
        this.userSelected = { ...userSelected }
        this.userDialog = true
    }

    deleteProduct(userSelected: any) {
        this.deleteUserDialog = true
        this.userSelected = { ...userSelected }
    }

    confirmDelete() {
        this.deleteUserDialog = false
        //   this.roomService.removeRoom(this.userSelected.id).pipe(
        //       finalize(() => {
        //           this.users = this.users.filter((val) => val.id !== this.userSelected.id)
        //           this.userSelected = {}
        //           this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Accomodation Deleted', life: 3000 })
        //       })
        //   ).subscribe(data => console.log(data))
    }

    hideDialog() {
        this.userDialog = false
        this.submitted = false
        console.log(this.userSelected)
    }

    saveUser() {
        this.loading = true
        console.log(this.userSelected)
        let message: string
        if (this.userSelected.userId) {
            message = 'Chỉnh sửa thành công'
        } else {
            message = 'Thêm thành công'
            this.userSelected.role = 'landlord'
        }
        this.userService
            .updateUser(this.userSelected)
            .pipe(
                finalize(() => {
                    this.submitted = false
                    this.getAllUsers()
                        .pipe(
                            finalize(() => {
                                this.messageService.add({ severity: 'success', summary: 'Successful', detail: message, life: 3000 })
                            }),
                        )
                        .subscribe((response) => (this.users = response.data))
                }),
            )
            .subscribe((data) => console.log(data))
        this.userDialog = false
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains')
    }
}
