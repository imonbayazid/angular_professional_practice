import { Routes, RouterModule }  from '@angular/router';

import { ManualAdjustments }         from './ManualAdjustments.component';
import {CanDeactivateGuard} from '../../shared/canDeactivateGuard.service'


const routes: Routes = [
    { path: '', component: ManualAdjustments },
    { path: 'manualAdjustment', canDeactivate: [CanDeactivateGuard], component: ManualAdjustments }
  

];

export const routing = RouterModule.forChild(routes);