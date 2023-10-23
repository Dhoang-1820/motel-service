import { Component, OnInit } from '@angular/core'
import { ConfirmationService, MessageService } from 'primeng/api'
import { Table } from 'primeng/table'
import { finalize } from 'rxjs'
import { AuthenticationService } from 'src/app/modules/auth/service/authentication.service'
import { User } from 'src/app/modules/model/user.model'
import { Room } from '../../model/accomodation.model'
import { AccomodationService } from '../../service/accomodation.service'
import { RoomService } from '../../service/room.service'

@Component({
    selector: 'app-room-images',
    templateUrl: './room-images.component.html',
    styleUrls: ['./room-images.component.scss'],
    providers: [ConfirmationService, MessageService],
})
export class RoomImagesComponent implements OnInit {
    accomodations: any[] = []
    dataLoading: boolean = false
    loading: boolean = false
    uploadedFiles: any[] = []
    thumb!: any
    selectedAccomodation!: any
    rooms: Room[] = []
    selectedRoom: Room = {}
    user!: User | null
    roomImages: any[] = []
    deleteLoading: boolean = false;
    deleteImageDialog: boolean = false;
    selectedImage: any;
    linkUpload: string = "http://localhost:8080/motel-service/api/room/image/"

    constructor(
        private accomodationService: AccomodationService,
        private auth: AuthenticationService,
        private roomService: RoomService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) {}

    ngOnInit(): void {
        this.user = this.auth.userValue
        this.getDropdownAccomodation()
    }

    getDropdownAccomodation() {
        this.loading = true
        this.accomodationService
            .getDropdownAccomodation(this.user?.id)
            .pipe(
                finalize(() => {
                    this.selectedAccomodation = this.accomodations[0]
                    this.loading = false
                    this.getRoomByAccomodation()
                }),
            )
            .subscribe((response) => (this.accomodations = response.data))
    }

    getRoomByAccomodation() {
        this.selectedRoom = {}
        this.loading = true
        this.roomService
            .getRoomByAccomodation(this.selectedAccomodation.id)
            .pipe(
                finalize(() => {
                    this.loading = false
                    this.selectedRoom = this.rooms[0]
                    console.log('in get room', this.selectedRoom)
                    this.getImagesByRoom()
                }),
            )
            .subscribe((response) => (this.rooms = response.data))
    }

    onSelectAccomodation() {
        this.getRoomByAccomodation()
    }

    onSelectRoom() {
        this.getImagesByRoom()
    }

    getImagesByRoom() {
        this.loading = true;
        console.log(this.selectedRoom)
        this.roomService.getImageByRoom(this.selectedRoom.id).pipe(
            finalize(() => {
                this.loading = false
            }),
        ).subscribe(res => this.roomImages = res.data.images)
    }

    onDeleteImage(imgId: any) {
        this.deleteImageDialog = true;
        this.selectedImage = imgId;
    }

    confirmDelete() {
        this.deleteImageDialog = false
        this.loading = true;
        this.roomService.removeImage(this.selectedImage).pipe(
            finalize(() => {
                this.getImagesByRoom();
            }),
        ).subscribe(data => console.log(data))
    }

    onUpload() {
        this.getImagesByRoom()
    }
}
