
import { Injectable } from '@angular/core';
import { Router, Resolve,ActivatedRouteSnapshot } from '@angular/router';
import { Observable }             from 'rxjs/Observable';

@Injectable()
export class RouterDataResolve implements Resolve<any> {
  constructor(private router: Router) {}
  resolve(route: ActivatedRouteSnapshot):any {    
    return route.data;
 }
}