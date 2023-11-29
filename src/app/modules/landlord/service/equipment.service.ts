import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { Observable, delay, retry } from 'rxjs'
import { environment } from 'src/environments/environment'
import { Equipment } from '../model/equipment.model'
@Injectable({
    providedIn: 'root',
})
export class EquipmentService {
    constructor(private http: HttpClient) {}

    saveEquipment(request: Equipment[]): Observable<any> {
        return this.http.post<any>(`${environment.apiUrl}/equipment`, request).pipe(retry(1), delay(1000))
    }

    getByAccomodation(accomodationId: Number): Observable<any> {
        return this.http.get<any>(`${environment.apiUrl}/equipment/accomodation/${accomodationId}`).pipe(retry(1), delay(1000))
    }

    getByRoom(roomId: Number): Observable<any> {
        return this.http.get<any>(`${environment.apiUrl}/equipment/room/${roomId}`).pipe(retry(1), delay(1000))
    }

    getByName(name: String, accomodationId: number): Observable<any> {
        return this.http.get<any>(`${environment.apiUrl}/equipment?name=${name}&accomodationId=${accomodationId}`).pipe(retry(1), delay(1000))
    }

    deleleById(equipmentId: any): Observable<any> {
        return this.http.delete<any>(`${environment.apiUrl}/equipment/${equipmentId}`).pipe(retry(1), delay(1000))
    }
}
