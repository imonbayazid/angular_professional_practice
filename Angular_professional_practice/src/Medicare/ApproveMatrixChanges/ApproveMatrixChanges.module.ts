import { NgModule, ModuleWithProviders } from '@angular/core';
import { SharedModule }          from '../../shared/shared.module';
import { ApproveMatrixChanges }         from './ApproveMatrixChanges.component';
import { ApproveMatrixChangesService }         from './ApproveMatrixChanges.service';
import { routing } from './ApproveMatrixChanges.route';




@NgModule({
    imports: [SharedModule, routing],
    declarations: [ApproveMatrixChanges],
    exports: [],
    providers: [ApproveMatrixChangesService]
})
export default class ApproveMatrixChangesModule {
   
}
