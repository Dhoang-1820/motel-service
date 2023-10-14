import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { Observable, delay, retry } from 'rxjs'
import { environment } from 'src/environments/environment'

@Injectable({
    providedIn: 'root',
})
export class RoomService {
    constructor(private http: HttpClient) {}

    getRoomByAccomodation(id: any): Observable<any> {
        return this.http.get<any>(`${environment.apiUrl}/room/accomodations/${id}`).pipe(
            retry(1),
            delay(1000),
        )
    }

    saveRoom(room: any): Observable<any> {
        return this.http.post<any>(`${environment.apiUrl}/room`, room).pipe(
            retry(1),
            delay(1000),
        )
    }

    getRoomDropDown(accomodationId: any): Observable<any> {
        return this.http.get<any>(`${environment.apiUrl}/room/utility/${accomodationId}`).pipe(
            retry(1),
            delay(1000),
        )
    }

    getRoomNotHasService(accomodationId: any): Observable<any> {
        return this.http.get<any>(`${environment.apiUrl}/room/utility/no-service/${accomodationId}`).pipe(
            retry(1),
            delay(1000),
        )
    }
    
    getRoomNotDeposit(accomodationId: any): Observable<any> {
        return this.http.get<any>(`${environment.apiUrl}/room/utility/no-deposit/${accomodationId}`).pipe(
            retry(1),
            delay(1000),
        )
    }

    getRoomNotRented(accomodationId: any): Observable<any> {
        return this.http.get<any>(`${environment.apiUrl}/room/utility/no-rent/${accomodationId}`).pipe(
            retry(1),
            delay(1000),
        )
    }

   checkRoomNotDeposit(roomId: any): Observable<any> {
        return this.http.get<any>(`${environment.apiUrl}/room?roomId=${roomId}`).pipe(
            retry(1),
            delay(1000),
        )
    }

    removeRoom(id: any): Observable<any> {
        return this.http.delete<any>(`${environment.apiUrl}/room/${id}`).pipe(
            retry(1),
            delay(1000),
        )
    }

    saveRoomFee(request: any) {
        return this.http.post<any>(`${environment.apiUrl}/room/fee`, request).pipe(
            retry(1),
            delay(1000),
        )
    }

    removeRoomFee(roomId: any, feeId: any) {
        return this.http.delete<any>(`${environment.apiUrl}/room/fee/${roomId}/${feeId}`).pipe(
            retry(1),
            delay(1000),
        )
    }

    getImageByRoom(roomId: any) {
        return this.http.get<any>(`${environment.apiUrl}/room/image/${roomId}`).pipe(
            retry(1),
            delay(1000),
        )
    }

    removeImage(imgId: any) {
        return this.http.delete<any>(`${environment.apiUrl}/room/image/${imgId}`).pipe(
            retry(1),
            delay(1000),
        )
    }

   

}
