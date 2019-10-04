import { NgModule, ModuleWithProviders } from '@angular/core';
import {SharedModule}          from '../../shared/shared.module';
import { ApprovePricesComponent }         from './ApprovePrices.component';
import {ApprovePricesService} from './ApprovePrices.service'; 
import { routing }             from './ApprovePrices.router';


@NgModule({
    imports: [SharedModule, routing],
    declarations: [ApprovePricesComponent],
    exports: [],
    providers: [ApprovePricesService]
})
export default class ApprovePricesModule {

    
}
