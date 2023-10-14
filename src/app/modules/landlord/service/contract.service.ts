import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { Observable, delay, retry } from 'rxjs'
import { environment } from 'src/environments/environment'
import { Contract } from '../model/contract.model'

@Injectable({
    providedIn: 'any',
})
export class ContractService {
    constructor(private http: HttpClient) {}

    getContractByAccomodationId(accomodationId: any): Observable<any> {
        return this.http.get<any>(`${environment.apiUrl}/contract/accomodation/${accomodationId}`).pipe(retry(1), delay(1000))
    }

    saveContract(request: Contract): Observable<any> {
        return this.http.post<any>(`${environment.apiUrl}/contract`, request).pipe(retry(1), delay(1000))
    }
}
