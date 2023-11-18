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

    checkRoomDuplicated(name: any): Observable<any> {
        return this.http.post<any>(`${environment.apiUrl}/room/utility/duplicated`, name).pipe(
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

    getRoomNoElectricWater(request: any): Observable<any> {
        return this.http.post<any>(`${environment.apiUrl}/room/utility/no-electric-water`, request).pipe(
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

    getRoomRentedDate(roomId: any): Observable<any> {
        return this.http.get<any>(`${environment.apiUrl}/room/utility/rented-date/${roomId}`).pipe(
            retry(1),
            delay(1000),
        )
    }

    getRoomNoPost(accomodationId: any): Observable<any> {
        return this.http.get<any>(`${environment.apiUrl}/room/utility/no-post/${accomodationId}`).pipe(
            retry(1),
            delay(1000),
        )
    }

    getRoomNoPostAndDeposit(accomodationId: any): Observable<any> {
        return this.http.get<any>(`${environment.apiUrl}/room/utility/no-post/no-deposit/${accomodationId}`).pipe(
            retry(1),
            delay(1000),
        )
    }

    getRoomRented(accomodationId: any): Observable<any> {
        return this.http.get<any>(`${environment.apiUrl}/room/utility/rented/${accomodationId}`).pipe(
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

}