/** @format */

import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { Observable } from 'rxjs'
import { environment } from 'src/environments/environment'

@Injectable({
    providedIn: 'root',
})
export class PostService {
    constructor(private http: HttpClient) {}

    getByUserIdAndAccomodation(userId: any, accomodationId: any): Observable<any> {
        return this.http.get<any>(`${environment.apiUrl}/post/${accomodationId}/${userId}`)
    }

    savePost(request: any): Observable<any> {
        return this.http.post<any>(`${environment.apiUrl}/post`, request)
    }

    changeStatusPost(post: any): Observable<any> {
        return this.http.put<any>(`${environment.apiUrl}/post`, post)
    }

    removePost(postId: any): Observable<any> {
        return this.http.delete<any>(`${environment.apiUrl}/post/${postId}`)
    }

    getPostForLanding(): Observable<any> {
        return this.http.get<any>(`${environment.apiUrl}/post`)
    }

    getImageByPost(postId: any): Observable<any> {
        return this.http.get<any>(`${environment.apiUrl}/post/image/${postId}`)
    }

    removeImage(imgId: number): Observable<any> {
        return this.http.delete<any>(`${environment.apiUrl}/post/image/${imgId}`)
    }

    getAllPostAddress(): Observable<any> {
        return this.http.get<any>(`${environment.apiUrl}/post/address/all`)
    }

    getPostByAddress(request: any): Observable<any> {
        return this.http.post<any>(`${environment.apiUrl}/post/address`, request)
    }

    getPostByPrice(request: any): Observable<any> {
        return this.http.post<any>(`${environment.apiUrl}/post/price`, request)
    }

    getPostByAreage(request: any): Observable<any> {
        return this.http.post<any>(`${environment.apiUrl}/post/areage`, request)
    }

    searchPost(request: any): Observable<any> {
        return this.http.post<any>(`${environment.apiUrl}/post/search`, request)
    }
}
