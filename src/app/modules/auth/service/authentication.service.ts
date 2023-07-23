import { Injectable } from '@angular/core'
import { BehaviorSubject, Observable, map } from 'rxjs'
import { User } from '../../model/user.model'
import { Router } from '@angular/router'
import { HttpClient } from '@angular/common/http'
import { environment } from 'src/environments/environment'

@Injectable({
    providedIn: 'root',
})
export class AuthenticationService {
    private userSubject: BehaviorSubject<User | null>
    public user: Observable<User | null>

    constructor(private router: Router, private http: HttpClient) {
        this.userSubject = new BehaviorSubject(JSON.parse(localStorage.getItem('user')!))
        this.user = this.userSubject.asObservable()
    }

    public get userValue() {
        return this.userSubject.value
    }

    login(userName: string, password: string) {
        return this.http.post<any>(`${environment.apiUrl}/user/auth/signin`, { userName, password }).pipe(
            map((user) => {
                localStorage.setItem('user', JSON.stringify(user))
                this.userSubject.next(user)
                return user
            }),
        )
    }

    logout() {
        localStorage.removeItem('user')
        this.userSubject.next(null)
        this.router.navigate(['/login'])
    }
}
