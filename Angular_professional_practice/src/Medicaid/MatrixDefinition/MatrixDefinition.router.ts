import { Routes, RouterModule }  from '@angular/router';
import { MatrixDefinition }         from './MatrixDefinition';
import {CanDeactivateGuard} from '../../shared/canDeactivateGuard.service'


const routes: Routes = [
    { path: '', canDeactivate: [CanDeactivateGuard], component: MatrixDefinition },
    { path: 'matrixDefinition', canDeactivate: [CanDeactivateGuard], component: MatrixDefinition }
];

export const routing = RouterModule.forChild(routes);