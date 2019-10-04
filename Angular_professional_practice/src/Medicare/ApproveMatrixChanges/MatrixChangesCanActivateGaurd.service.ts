import { Injectable }    from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable }    from 'rxjs/Observable';
import {AppService} from '../../shared/app.service';
import {ApproveMatrixChangesService} from './ApproveMatrixChanges.service';


@Injectable()
export class MatrixChangesCanActivateGuard implements CanActivate {

    constructor(private service: ApproveMatrixChangesService) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot):
        Observable<boolean> | Promise<boolean> | boolean {
        return this.service.checkLockedUnlocked();
    }
}