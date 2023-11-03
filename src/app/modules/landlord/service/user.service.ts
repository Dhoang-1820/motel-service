import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { Observable, delay, retry } from 'rxjs'
import { environment } from 'src/environments/environment'

@Injectable({
    providedIn: 'root',
})
export class UserService {
    constructor(private http: HttpClient) {}

    getUserByUserId(id: any): Observable<any> {
        return this.http.get<any>(`${environment.apiUrl}/user/info/${id}`).pipe(retry(1), delay(1000))
    }

    saveUser(request: any): Observable<any> {
      return this.http.post<any>(`${environment.apiUrl}/user`, request).pipe(retry(1), delay(1000))
    }

    changePassword(request: any): Observable<any> {
        return this.http.put<any>(`${environment.apiUrl}/user/changePassword`, request).pipe(retry(1), delay(1000))
    }

    saveBank(request: any): Observable<any> {
        return this.http.post<any>(`${environment.apiUrl}/user/bank`, request).pipe(retry(1), delay(1000))
    }

    deleteBank(id: any): Observable<any> {
        return this.http.delete<any>(`${environment.apiUrl}/user/bank/${id}`).pipe(retry(1), delay(1000))
    }
}
