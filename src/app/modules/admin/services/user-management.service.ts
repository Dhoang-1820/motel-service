/** @format */

import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { Observable, delay, retry } from 'rxjs'
import { environment } from 'src/environments/environment'

@Injectable({
    providedIn: 'root',
})
export class UserManagementService {
    constructor(private http: HttpClient) {}

    getAllUsers(): Observable<any> {
        return this.http.get<any>(`${environment.apiUrl}/user`).pipe(retry(1), delay(1000))
    }

    getNewRegisterUsers(): Observable<any> {
        return this.http.get<any>(`${environment.apiUrl}/user/new-register`).pipe(retry(1), delay(1000))
    }

    updateUser(request: any): Observable<any> {
        return this.http.put<any>(`${environment.apiUrl}/user`, request).pipe(retry(1), delay(1000))
    }

    resetPassword(userId: any): Observable<any> {
        return this.http.put<any>(`${environment.apiUrl}/user/reset/password/${userId}`, null).pipe(retry(1), delay(1000))
    }

    checkDuplicatedEmail(email: any): Observable<any> {
        return this.http.post<any>(`${environment.apiUrl}/user/email/duplicated`, email).pipe(retry(1), delay(1000))
    }

    checkDuplicatedUsername(username: any): Observable<any> {
        return this.http.post<any>(`${environment.apiUrl}/user/username/duplicated`, username).pipe(retry(1), delay(1000))
    }
}
