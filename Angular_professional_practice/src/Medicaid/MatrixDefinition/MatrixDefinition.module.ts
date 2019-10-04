import { NgModule, ModuleWithProviders } from '@angular/core';
import {SharedModule}          from '../../shared/shared.module';
import { routing }             from './MatrixDefinition.router';
import {MatrixDefinitionService} from './MatrixDefinition.service'; 
import { MatrixDefinition }         from './MatrixDefinition';



@NgModule({
    imports: [SharedModule, routing],
    declarations: [
        MatrixDefinition      
        ],
    exports: [],
    providers: [MatrixDefinitionService]
})
export default class MatrixDefinitionModule {

}
