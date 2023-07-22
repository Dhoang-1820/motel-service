import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Product } from '../model/accomodation.model';

@Injectable({
  providedIn: 'root',
})
export class AccomodationService {
    constructor(private http: HttpClient) {}

    getProducts() {
        return this.http
            .get<any>('../../../../assets/mock-data/products.json')
            .toPromise()
            .then((res) => res.data as Product[])
            .then((data) => data)
    }
}
