import { NgModule, ModuleWithProviders } from '@angular/core';
import { SharedModule }          from '../../shared/shared.module';
import { CalculatePrices }         from './CalculatePrices.component';
import { ProfileListComponent }         from './ProfileList.component';
import { ProfileResultComponent }         from './ProfileResult.component';
import { PricingFormComponent }         from './PricingForm.component';
import { OverrideFormComponent }         from './OverrideForm.component';
import { BpReviewFormComponent }         from './BpReviewForm.component';
import { BpPointsImportComponent }         from './BpPointsImport.component';
import { CalculatePricesService }         from './CalculatePrices.service';
import { BestPriceTransactionComponent } from './BestPriceTransaction.component';
import { routing } from './CalculatePrices.router';



@NgModule({
    imports: [SharedModule, routing],
    declarations: [
                CalculatePrices,
                ProfileListComponent,
                ProfileResultComponent,
                PricingFormComponent,
                OverrideFormComponent,
                BpReviewFormComponent,
                BpPointsImportComponent,
                BestPriceTransactionComponent
    ],               
    exports: [],
    providers: [CalculatePricesService]
})
export default class CalculatePricesModule {

}
