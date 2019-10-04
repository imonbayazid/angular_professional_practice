import { Routes, RouterModule }  from '@angular/router';
import {HomeComponent} from './home.component';
import {CanDeactivateGuard} from '../shared/canDeactivateGuard.service'


const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'home', canDeactivate: [CanDeactivateGuard], component: HomeComponent }


];

export const routing = RouterModule.forChild(routes);