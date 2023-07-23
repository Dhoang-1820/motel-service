import { Injectable } from '@angular/core'
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http'
import { Observable } from 'rxjs'
import { AuthenticationService } from '../../auth/service/authentication.service'
import { environment } from 'src/environments/environment'

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
    constructor(private authenticationService: AuthenticationService) {}

    intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
        const user = this.authenticationService.userValue
        const isLoggedIn = user?.token
        const isApiUrl = request.url.startsWith(environment.apiUrl)
        if (isLoggedIn && isApiUrl) {
            request = request.clone({
                setHeaders: {
                    Authorization: `Bearer ${user.token}`,
                }
            })
        }
        console.log('request', request)
        return next.handle(request)
    }
}
