import { Injectable }    from '@angular/core';
import { CanDeactivate } from '@angular/router';
import { Observable }    from 'rxjs/Observable';
import { AppService } from './app.service';
export interface CanComponentDeactivate {
    canDeactivate: () => boolean | Observable<boolean>;
}
@Injectable()
export class CanDeactivateGuard implements CanDeactivate<CanComponentDeactivate> {

    constructor(private service: AppService) { }

    canDeactivate(component: CanComponentDeactivate): Observable<boolean> | Promise<boolean> | boolean {
        if (component.canDeactivate) { component.canDeactivate(); }
        return this.service.giveWarningOnChangeNavigation();
    }
}