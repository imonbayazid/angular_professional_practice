
import { NgModule, ModuleWithProviders } from '@angular/core';
import {SharedModule}          from '../../../shared/shared.module';
import {Filter} from './Filter'
import {DataSwitcher} from './DataSwitcher';
import {MatrixException} from './MatrixException';
import {Trade} from './Trade';
import {COT} from './COT';
import {Estimation} from './Estimation';
import {MatrixDetail} from './MatrixDetail';
import {Transaction} from './Transaction';
import { MatrixExceptionModal } from './MatrixExceptionModal';


const COM_LIST=[
    Trade, COT, Estimation, Transaction, MatrixException, MatrixDetail, DataSwitcher, Filter, MatrixExceptionModal
    ];

@NgModule({
    imports: [SharedModule],
    declarations: COM_LIST,
    exports: COM_LIST,
    providers: []
})
export  class MatrixDefinationSubModule {

    
}
