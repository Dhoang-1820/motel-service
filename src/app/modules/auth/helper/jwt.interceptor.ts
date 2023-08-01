import { Injectable } from '@angular/core'
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http'
import { BehaviorSubject, Observable, catchError, switchMap, throwError } from 'rxjs'
import { AuthenticationService } from '../service/authentication.service'
import { environment } from 'src/environments/environment'
import { User } from '../../model/user.model'

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
    isRefreshing = false;
    user!: any;
    isLoggedIn: boolean = false;

    constructor(private authenticationService: AuthenticationService) {
        this.user = this.authenticationService.userValue
        this.isLoggedIn = this.user?.token
    }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<any> {
        const isApiUrl = request.url.startsWith(environment.apiUrl)
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
                    return throwError(() => new Error(error));
                  }
            })
        )
    }
    

    private handle401Error(request: HttpRequest<any>, next: HttpHandler) {
        if (!this.isRefreshing) {
          this.isRefreshing = true;
          if (this.isLoggedIn) {
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
