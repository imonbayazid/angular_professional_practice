import { Injectable }    from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable }    from 'rxjs/Observable';

export interface CanComponentActivate {
    canActivate: () => boolean | Observable<boolean>;
}

@Injectable()
export class CanActivateGuard implements CanActivate {

    canActivate( route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
        console.log('route: ', route);
        console.log('state: ', state);
        return true;
    }
}