import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { Router } from '@angular/router'
import { BehaviorSubject, Observable, catchError, map, of } from 'rxjs'
import { environment } from 'src/environments/environment'
import { User } from '../../model/user.model'

@Injectable({
    providedIn: 'root',
})
export class AuthenticationService {
    private userSubject: BehaviorSubject<User | null>
    public user: Observable<User | null>

    constructor(private router: Router, private http: HttpClient) {
        let user = JSON.parse(localStorage.getItem('user')!)
        if (!user) {
            JSON.parse(sessionStorage.getItem('user')!)
        }
        this.userSubject = new BehaviorSubject(user)
        this.user = this.userSubject.asObservable()
    }

    public get userValue() {
        return this.userSubject.value
    }

    login(userName: string, password: string) {
        return this.http.post<any>(`${environment.apiUrl}/user/auth/signin`, { userName, password }).pipe(
            map((user) => {
                this.userSubject.next(user)
                return user
            })
        )
    }

    logout() {
        localStorage.removeItem('user')
        this.userSubject.next(null)
        this.router.navigate(['/auth'])
    }

    refreshToken() {
        console.log(this.userValue?.refreshToken)
        return this.http.post<any>(`${environment.apiUrl}/user/auth/refreshtoken`, {refreshToken: this.userValue?.refreshToken}).pipe(
            map((data) => {
                if (this.userValue) {
                    this.userValue.token = data.accessToken
                    this.userValue.refreshToken = data.refreshToken
                    this.userSubject.next(this.userValue)
                    localStorage['user'] = JSON.stringify(this.userValue)
                    return this.userValue
                } else {
                    this.router.navigate(['/auth'])
                    return null
                }
            }),
        )
    }


}
