import { HttpErrorResponse, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { Observable, catchError, switchMap, throwError } from 'rxjs'
import { environment } from 'src/environments/environment'
import { AuthenticationService } from '../service/authentication.service'

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
    isRefreshing = false;
    user!: any;
    isLoggedIn: boolean = false;
    expiryTime: any;
    token: any;

    constructor(private authenticationService: AuthenticationService) {
        this.user = this.authenticationService.userValue
        this.isLoggedIn = this.user?.token
        if (this.isLoggedIn) {
            this.token = JSON.parse(atob( this.user.token.split('.')[1]));
            this.expiryTime = (this.token.exp * 1000);
        }
    }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<any> {
        const isApiUrl = request.url.startsWith(environment.apiUrl)
        this.user = this.authenticationService.userValue
        this.isLoggedIn = this.user?.token
        if (this.isLoggedIn && isApiUrl) {
            request = request.clone({
                setHeaders: {
                    Authorization: `Bearer ${this.user.token}`,
                }
            })
        }
        return next.handle(request).pipe(
            catchError((error) => {
                if (error instanceof HttpErrorResponse && error.status === 401) {
                    return this.handle401Error(request, next);
                  } else {
                }
                return throwError(() => new Error(error));
            })
        )
    }
    

    private handle401Error(request: HttpRequest<any>, next: HttpHandler) {
        const isExpired: boolean = Date.now() > this.expiryTime;
        if (!this.isRefreshing) {
          this.isRefreshing = true;
          if (this.isLoggedIn && !isExpired) {
            return this.authenticationService.refreshToken().pipe(
                switchMap(() => {
                    this.isRefreshing = false;
                    return next.handle(request)
                }),
                catchError((error) => {
                    this.isRefreshing = false;
                    return throwError(() => error);
                })
            )
          }
        } 
        return next.handle(request);
    }

    
}
