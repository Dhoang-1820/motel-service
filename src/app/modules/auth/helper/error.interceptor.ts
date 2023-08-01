import { Injectable } from '@angular/core'
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http'
import { Observable, catchError, throwError } from 'rxjs'
import { AuthenticationService } from '../service/authentication.service'

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
    constructor(private authenticationService: AuthenticationService) {}

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(request).pipe(
            catchError((err: any) => {
                if ([401, 403].includes(err.status) && this.authenticationService.userValue) {
                    this.authenticationService.logout()
                }
                const error = (err && err.error && err.error.message) || err.statusText
                console.error(err)
                return throwError(() => new Error(error))
            }),
        )
    }
}
