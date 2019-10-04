import { Routes, RouterModule }  from '@angular/router';

import { CalculatePrices }         from './CalculatePrices.component';
import {CanDeactivateGuard} from '../../shared/canDeactivateGuard.service'


const routes: Routes = [
    { path: '', component: CalculatePrices, canDeactivate: [CanDeactivateGuard] },
    { path: 'calculatePrices', canDeactivate: [CanDeactivateGuard], component: CalculatePrices }

];

export const routing = RouterModule.forChild(routes);