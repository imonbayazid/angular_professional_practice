import { Routes, RouterModule }  from '@angular/router';

import { ApprovePricesComponent }       from './ApprovePrices.component';
import {CanDeactivateGuard} from '../../shared/canDeactivateGuard.service'

const routes: Routes = [
    { path: '', component: ApprovePricesComponent },
    { path: 'approvePrices', canDeactivate: [CanDeactivateGuard], component: ApprovePricesComponent }
  

];

export const routing = RouterModule.forChild(routes);