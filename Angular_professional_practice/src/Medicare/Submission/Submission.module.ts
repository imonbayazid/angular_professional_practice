import { NgModule, ModuleWithProviders } from '@angular/core';
import { SharedModule }          from '../../shared/shared.module';
import { Submission }         from './Submission.component';
import { ProfileListComponent }         from './ProfileList.component';
import { SubmissionService }         from './Submission.service';
import {ProfileProductsComponent}        from './ProfileProducts.component';
import { routing } from './Submission.router';



@NgModule({
    imports: [SharedModule, routing],
    declarations: [
                Submission,
                ProfileListComponent,
                ProfileProductsComponent               
    ],               
    exports: [],
    providers: [SubmissionService]
})
export default class CalculatePricesModule {

}
