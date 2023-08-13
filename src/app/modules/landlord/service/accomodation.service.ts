import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Accomodation } from '../model/accomodation.model'
import { Observable, delay, retry, take } from 'rxjs'
import { environment } from 'src/environments/environment'

@Injectable({
    providedIn: 'root',
})
export class AccomodationService {
    constructor(private http: HttpClient) {}

    getProducts() {
        return this.http
            .get<any>('../../../../assets/mock-data/products.json')
            .toPromise()
            .then((res) => res.data as Accomodation[])
            .then((data) => data)
    }

    getDropdownAccomodation(id: any): Observable<any> {
        return this.http.get<any>(`${environment.apiUrl}/accomodation/utility/${id}`).pipe(retry(1), delay(1000))
    }

    saveAccomodation(request: Accomodation): Observable<any> {
        return this.http.post<any>(`${environment.apiUrl}/accomodation`, request).pipe(
            retry(1),
            delay(1000)
        )
    }

    removeAccomodation(id: any): Observable<any> {
        return this.http.delete<any>(`${environment.apiUrl}/accomodation/${id}`).pipe(
            retry(1),
            delay(1000)
        )
    }

    getAccomodationByUserId(id: any): Observable<any> {
        return this.http.get<any>(`${environment.apiUrl}/accomodation/${id}`).pipe(
            retry(1),
            delay(1000)
        )
    }

    getAllRoomForLanding() {
        return this.http.get<any>(`${environment.apiUrl}/accomodation`).pipe(
            retry(1),
            delay(1000),
        )
    }
}
