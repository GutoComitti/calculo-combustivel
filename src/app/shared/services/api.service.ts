import { Injectable } from '@angular/core';
import 'rxjs';
import { HttpClient } from '@angular/common/http';

import { Result } from '../models/result.model';
import { Price } from '../models/price.model';
import { Supply } from '../models/supply.model';
import { Spent } from '../models/spent.model';

@Injectable()
export class ApiService {

  constructor(private http: HttpClient) {}

  baseURL = "https://challenge-for-adventurers.herokuapp.com/";
  id = "5ccda53002f7db00145707ad";

  addResults(results: Result[]) {
    return this.http.post<Result[]>(this.baseURL + "check?id=" + this.id, results);
  }

  // getPrices(){
  //   return this.http.get<Price[]>(this.baseURL + "data/" + this.id + "/prices");
  // }

  // getSupplies(){
  //   return this.http.get<Supply[]>(this.baseURL + "data/" + this.id + "/supplies");
  // }

  // getSpents(){
  //   return this.http.get<Spent[]>(this.baseURL + "data/" + this.id + "/spents");
  // }

  getPrices(){
    return this.http.get<Price[]>("assets/prices.json");
  }

  getSupplies(){
    return this.http.get<Supply[]>("assets/supplies.json");
  }

  getSpents(){
    return this.http.get<Spent[]>("assets/spents.json");
  }
}