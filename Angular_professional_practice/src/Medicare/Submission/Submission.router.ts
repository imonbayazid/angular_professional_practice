import { Routes, RouterModule }  from '@angular/router';

import { Submission }         from './Submission.component';
import {CanDeactivateGuard} from '../../shared/canDeactivateGuard.service'


const routes: Routes = [
    { path: '', component: Submission },
    { path: 'calculatePrices', canDeactivate: [CanDeactivateGuard], component: Submission }

];

export const routing = RouterModule.forChild(routes);