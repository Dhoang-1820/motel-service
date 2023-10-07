import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { Observable, delay, retry } from 'rxjs'

@Injectable({
    providedIn: 'root',
})
export class AddressService {
    constructor(private http: HttpClient) {}

    getAllProvinces(): Observable<any> {
        return this.http.get<any>(`https://provinces.open-api.vn/api/p/`).pipe(retry(1), delay(1000))
    }

    getDistrictByProvince(provinceId: any): Observable<any> {
        return this.http.get<any>(`https://provinces.open-api.vn/api/p/${provinceId}?depth=2`).pipe(retry(1), delay(1000))
    }

    getWardByDistrict(districtId: any): Observable<any> {
        return this.http.get<any>(`https://provinces.open-api.vn/api/d/${districtId}?depth=2`).pipe(retry(1), delay(1000))
    }
}
