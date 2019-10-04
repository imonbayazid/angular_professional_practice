import { NgModule, ModuleWithProviders } from '@angular/core';
import {SharedModule}          from '../../shared/shared.module';
import { ManualAdjustments }         from './ManualAdjustments.component';
import {SearchComponent} from './Search.component';
import {MainGridComponent} from './MainGrid.component';
import {EditOrDetailsComponent} from './EditOrDetails.component';
import {ReverseComponent} from './Reverse.component';
import {CustomerIDComponent} from './CustomerId.component';
import {ContractIDComponent} from './ContractId.component';
import {WholesaleIDComponent} from './WholesaleId.component';
import {ImportComponent} from './Import.component';
import {ManualAdjustmentService} from './ManualAdjustment.service'; 
import { routing }             from './ManualAdjustment.router';
import {SafeHtmlPipe} from './EditOrDetails.component';


@NgModule({
    imports: [SharedModule, routing],
    declarations: [ManualAdjustments,
        SearchComponent,MainGridComponent,
        EditOrDetailsComponent, ReverseComponent, ImportComponent,
        CustomerIDComponent, ContractIDComponent, WholesaleIDComponent, SafeHtmlPipe],
    exports: [],
    providers: [ManualAdjustmentService]
})
export default class ManualAdjustmentModule {

    static forRoot(): ModuleWithProviders {
        return {
            ngModule: ManualAdjustmentModule,
            providers: [ManualAdjustmentService]
        };
    }
}
