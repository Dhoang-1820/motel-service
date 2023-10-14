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

    saveElectricWater(request: any): Observable<any> {
        return this.http.post<any>(`${environment.apiUrl}/invoice/electric-water/save`, request).pipe(retry(1), delay(1000))
    }

    getMonthInvoiceByAccomodation(request: any): Observable<any> {
        return this.http.post<any>(`${environment.apiUrl}/invoice`, request).pipe(retry(1), delay(1000))
    }

    sendInvoice(invoiceId: number): Observable<any> {
        return this.http.post<any>(`${environment.apiUrl}/invoice/send/${invoiceId}`, null).pipe(retry(1), delay(1000))
    }

    getElectricWaterByAccomodation(request: any): Observable<any> {
        return this.http.post<any>(`${environment.apiUrl}/invoice/electric-water`, request).pipe(retry(1), delay(1000))
    }

    issueInvoice(request: any): Observable<any> {
        return this.http.post<any>(`${environment.apiUrl}/invoice/issue`, request).pipe(retry(1), delay(1000))
    }

    getInvoiceDetail(invoiceId: number): Observable<any> {
        return this.http.get<any>(`${environment.apiUrl}/invoice/${invoiceId}`).pipe(retry(1), delay(1000))
    }

    getPreviewInvoice(request: any): Observable<any> {
        return this.http.post<any>(`${environment.apiUrl}/invoice/issue/preview`, request).pipe(retry(1), delay(1000))
    }

    updateInvoice(request: Invoice): Observable<any> {
        return this.http.put<any>(`${environment.apiUrl}/invoice`, request).pipe(retry(1), delay(1000))
    }

    confirmPayment(invoiceId: any): Observable<any> {
        return this.http.put<any>(`${environment.apiUrl}/invoice/confirm/${invoiceId}`, null).pipe(retry(1), delay(1000))
    }

    removeInvoice(invoiceId: any): Observable<any> {
        return this.http.delete<any>(`${environment.apiUrl}/invoice/${invoiceId}`).pipe(retry(1), delay(1000))
    }
}
