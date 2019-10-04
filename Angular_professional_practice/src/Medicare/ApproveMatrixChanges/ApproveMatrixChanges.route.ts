import { Routes, RouterModule }  from '@angular/router';

import { ApproveMatrixChanges }         from './ApproveMatrixChanges.component';
import {MatrixChangesCanActivateGuard} from './MatrixChangesCanActivateGaurd.service';
import {CanDeactivateGuard} from '../../shared/canDeactivateGuard.service';
import {CONSTANTS} from '../../shared/constant';



const routes: Routes = [
    { path: '', component: ApproveMatrixChanges },
];

export const routing = RouterModule.forChild(routes);