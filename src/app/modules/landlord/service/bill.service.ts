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
        return this.http.post<any>(`${environment.apiUrl}/bill`, request).pipe(retry(1), delay(1000))
    }

    saveBill(request: any): Observable<any> {
        return this.http.post<any>(`${environment.apiUrl}/bill/save`, request).pipe(retry(1), delay(1000))
    }

    getMonthInvoiceByAccomodation(request: any): Observable<any> {
        return this.http.post<any>(`${environment.apiUrl}/bill/invoice`, request).pipe(retry(1), delay(1000))
    }

    savePaymentConfirmation(billId: any): Observable<any> {
        return this.http.put<any>(`${environment.apiUrl}/bill/${billId}`, null).pipe(retry(1), delay(1000))
    }

    sendInvoice(requets: any): Observable<any> {
        return this.http.put<any>(`${environment.apiUrl}/bill`, requets).pipe(retry(1), delay(1000))
    }
}
