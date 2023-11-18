import { Component } from '@angular/core'
import { ConfirmationService, MessageService } from 'primeng/api'

@Component({
    selector: 'app-room-images',
    templateUrl: './room-images.component.html',
    styleUrls: ['./room-images.component.scss'],
    providers: [ConfirmationService, MessageService],
})
export class RoomImagesComponent  {
    
}
