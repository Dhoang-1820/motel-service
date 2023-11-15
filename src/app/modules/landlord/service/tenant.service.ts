import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { Observable, delay, retry } from 'rxjs'
import { environment } from 'src/environments/environment'

@Injectable({
    providedIn: 'root',
})
export class TenantService {
    constructor(private http: HttpClient) {}

    getTenantByAccomodation(id: any): Observable<any> {
        return this.http.get<any>(`${environment.apiUrl}/tenant/${id}`).pipe(retry(1), delay(1000))
    }

    getTenantWithoutDeposit(accomodationId: any): Observable<any> {
        return this.http.get<any>(`${environment.apiUrl}/tenant/deposit/${accomodationId}`).pipe(retry(1), delay(1000))
    }

    getTenantWithoutContract(accomodationId: any): Observable<any> {
        return this.http.get<any>(`${environment.apiUrl}/tenant/contract/${accomodationId}`).pipe(retry(1), delay(1000))
    }

    saveTenant(request: any): Observable<any> {
        return this.http.post<any>(`${environment.apiUrl}/tenant`, request).pipe(retry(1), delay(1000))
    }

    checkDuplicated(identifyNum: any): Observable<any> {
        return this.http.post<any>(`${environment.apiUrl}/tenant/duplicated`, identifyNum).pipe(retry(1), delay(1000))
    }
}
