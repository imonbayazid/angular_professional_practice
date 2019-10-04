import { NgModule, ModuleWithProviders } from '@angular/core';
import { SharedModule }          from '../shared/shared.module';
import { UserSettingsModule2 } from '../Tools/UserSettings/UserSettings.module';

import {ShowUpdatedChecksModalModule2} from '../Utilization/ShowUpdatedChecks/ShowUpdatedChecks.module';

import {HomeComponent} from './home.component';
import {routing} from './home.route';

@NgModule({
    imports: [SharedModule, UserSettingsModule2, ShowUpdatedChecksModalModule2, routing],
    declarations: [
        HomeComponent
    ],
    exports: [],
    providers: []
})
export default class HomeModule {
    
}


