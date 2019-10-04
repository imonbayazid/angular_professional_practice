import { NgModule, ModuleWithProviders } from '@angular/core';
import {SharedModule}          from '../../../shared/shared.module';
import {CriteriaFormComponent} from './CriteriaForm.component';
import {MatrixDetailComponent} from './MatrixDetail.component';
import {ClassOfTradeTabComponent} from './ClassOfTradeTab.component';
import {EstimationsTabComponent} from './EstimationsTab.component';
import {MatrixExceptionsTabComponent} from './MatrixExceptionsTab.component';
import {TransactionTypesTabComponent} from './TransactionTypesTab.component';


const COM_LIST = [ 
    MatrixDetailComponent,CriteriaFormComponent, ClassOfTradeTabComponent, EstimationsTabComponent, MatrixExceptionsTabComponent, TransactionTypesTabComponent
];

@NgModule({
    imports: [SharedModule],
    declarations: COM_LIST,
    exports: COM_LIST,
    providers: []
})
export class ApproveMatrixChangesSubModule {


}
