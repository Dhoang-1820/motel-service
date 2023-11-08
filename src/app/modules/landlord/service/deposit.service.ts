import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { Observable, delay, retry } from 'rxjs'
import { environment } from 'src/environments/environment'
import { CancelDepositRequest } from '../model/deposit.model'

@Injectable({
    providedIn: 'root',
})
export class DepositService {
    constructor(private http: HttpClient) {}

    getDepositByAccomodation(accomodationId: any): Observable<any> {
        return this.http.get<any>(`${environment.apiUrl}/deposit/${accomodationId}`).pipe(retry(1), delay(1000))
    }

    saveDeposit(deposit: any) : Observable<any> {
        return this.http.post<any>(`${environment.apiUrl}/deposit`, deposit).pipe(retry(1), delay(1000))
    }

    cancelDeposit(request: CancelDepositRequest): Observable<any>  {
        return this.http.put<any>(`${environment.apiUrl}/deposit`, request).pipe(retry(1), delay(1000))
    }
}
