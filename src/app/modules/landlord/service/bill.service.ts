import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { Observable, delay, retry } from 'rxjs'
import { environment } from 'src/environments/environment'
@Injectable({
    providedIn: 'root',
})
export class BillService {
    constructor(private http: HttpClient) {}

    getBillsMonthByAccomodation(request: any): Observable<any> {
        return this.http.post<any>(`${environment.apiUrl}/invoice`, request).pipe(retry(1), delay(1000))
    }

    saveBill(request: any): Observable<any> {
        return this.http.post<any>(`${environment.apiUrl}/invoice/save`, request).pipe(retry(1), delay(1000))
    }

    getMonthInvoiceByAccomodation(request: any): Observable<any> {
        return this.http.post<any>(`${environment.apiUrl}/invoice/bill`, request).pipe(retry(1), delay(1000))
    }

    savePaymentConfirmation(billId: any): Observable<any> {
        return this.http.put<any>(`${environment.apiUrl}/invoice/${billId}`, null).pipe(retry(1), delay(1000))
    }

    sendInvoice(requets: any): Observable<any> {
        return this.http.put<any>(`${environment.apiUrl}/invoice`, requets).pipe(retry(1), delay(1000))
    }
}
