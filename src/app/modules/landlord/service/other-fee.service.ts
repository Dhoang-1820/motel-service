import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { OtherFee } from '../model/accomodation.model'
import { environment } from 'src/environments/environment'
import { delay, retry } from 'rxjs'

@Injectable({
    providedIn: 'root',
})
export class OtherFeeService {
    constructor(private http: HttpClient) {}

    saveOtherFee(request: OtherFee) {
        return this.http.post<any>(`${environment.apiUrl}/other-fee`, request).pipe(retry(1), delay(1000))
    }

    deleteOtherFee(id: number) {
        return this.http.delete<any>(`${environment.apiUrl}/other-fee/${id}`).pipe(retry(1), delay(1000))
    }

    getOtherFeeByAccomodation(accomodationId: any) {
        return this.http.get<any>(`${environment.apiUrl}/other-fee/accomodation/${accomodationId}`)
    }

    getRemainOtherFeeByRoom(roomId: any, accomodationId: any) {
        return this.http.get<any>(`${environment.apiUrl}/other-fee?room=${roomId}&accomodation=${accomodationId}`)
    }

}
