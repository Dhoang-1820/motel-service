import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { Observable, delay, retry } from 'rxjs'
import { environment } from 'src/environments/environment'
import { Invoice } from '../model/bill.model'
@Injectable({
    providedIn: 'root',
})
export class BillService {

    constructor(private http: HttpClient) {}

    getBillsMonthByAccomodation(request: any): Observable<any> {
        return this.http.post<any>(`${environment.apiUrl}/invoice`, request).pipe(retry(1), delay(1000))
    }

    getElectricWaterByRoomAndMonth(request: any): Observable<any> {
        return this.http.post<any>(`${environment.apiUrl}/invoice/room/electric-water`, request).pipe(retry(1), delay(1000))
    }

    saveElectricWater(request: any): Observable<any> {
        return this.http.post<any>(`${environment.apiUrl}/invoice/electric-water/save`, request).pipe(retry(1), delay(1000))
    }

    getMonthInvoiceByAccomodation(request: any): Observable<any> {
        return this.http.post<any>(`${environment.apiUrl}/invoice`, request).pipe(retry(1), delay(1000))
    }

    sendInvoice(request: any): Observable<any> {
        return this.http.post<any>(`${environment.apiUrl}/invoice/send`, request).pipe(retry(1), delay(1000))
    }

    checkRoomIsInputWaterElectric(request: any): Observable<any> {
        return this.http.post<any>(`${environment.apiUrl}/invoice/room/electric-water`, request).pipe(
            retry(1),
            delay(1000),
        )
    }

    checkIsRoomReturnValid(request: any): Observable<any> {
        return this.http.post<any>(`${environment.apiUrl}/invoice/room`, request).pipe(
            retry(1),
            delay(1000),
        )
    }



    returnRoom(request: any): Observable<any> {
        return this.http.post<any>(`${environment.apiUrl}/invoice/return`, request).pipe(
            retry(1),
            delay(1000),
        )
    }

    getElectricWaterByAccomodation(request: any): Observable<any> {
        return this.http.post<any>(`${environment.apiUrl}/invoice/electric-water`, request).pipe(retry(1), delay(1000))
    }

    issueInvoice(request: any): Observable<any> {
        return this.http.post<any>(`${environment.apiUrl}/invoice/issue`, request).pipe(retry(1), delay(1000))
    }

    issueReturnInvoice(request: any): Observable<any> {
        return this.http.post<any>(`${environment.apiUrl}/invoice/return/issue`, request).pipe(retry(1), delay(1000))
    }

    getInvoiceDetail(request: any): Observable<any> {
        return this.http.post<any>(`${environment.apiUrl}/invoice/detail`, request).pipe(retry(1), delay(1000))
    }

    getReturnInvoiceDetail(request: any): Observable<any> {
        return this.http.post<any>(`${environment.apiUrl}/invoice/return/detail`, request).pipe(retry(1), delay(1000))
    }

    getPreviewInvoice(request: any): Observable<any> {
        return this.http.post<any>(`${environment.apiUrl}/invoice/issue/preview`, request).pipe(retry(1), delay(1000))
    }

    updateInvoice(request: Invoice): Observable<any> {
        return this.http.put<any>(`${environment.apiUrl}/invoice`, request).pipe(retry(1), delay(1000))
    }

    confirmPayment(request: any): Observable<any> {
        return this.http.put<any>(`${environment.apiUrl}/invoice/confirm`, request).pipe(retry(1), delay(1000))
    }

    removeInvoice(invoiceId: any): Observable<any> {
        return this.http.delete<any>(`${environment.apiUrl}/invoice/${invoiceId}`).pipe(retry(1), delay(1000))
    }
}
