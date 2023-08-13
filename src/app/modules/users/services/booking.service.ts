import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, delay, retry } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BookingService {

  constructor(private http: HttpClient) {}

  saveBooking(request: any): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/booking`, request).pipe(retry(1), delay(1000))
}
}
