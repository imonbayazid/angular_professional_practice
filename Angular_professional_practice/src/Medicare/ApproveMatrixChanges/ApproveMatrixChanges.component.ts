import {Component, OnInit,OnDestroy, ViewEncapsulation} from '@angular/core';
import { ActivatedRoute,CanActivate } from '@angular/router';
import {juForm, FormOptions, FormElement} from '../../shared/juForm/juForm';
import {juGrid, GridOptions } from '../../shared/juGrid/juGrid';
import {SelectOptions} from '../../shared/juForm/juSelect';
import {FV} from '../../shared/juForm/FV';
import {CONSTANTS} from '../../shared/constant';
import {AppService} from '../../shared/app.service';
import {ApproveMatrixChangesSubModule} from './ApproveMatrixChangesSubModule/ApproveMatrixChangesSub.module';
import {ApproveMatrixChangesService} from './ApproveMatrixChanges.service';
import {Observable, Subscription}   from 'rxjs/Rx';


@Component({
    moduleId: module.id,
    templateUrl: './ApproveMatrixChanges.html',
    encapsulation: ViewEncapsulation.None
})


export class ApproveMatrixChanges implements OnInit, OnDestroy {

    private approveMatrixChangesFormOptions: FormOptions;
    private title: string = 'Matrix Approval';
    private isWinType: string = '';
    private isAgencyType: string = '';
    private Tag: string = '';
    private saveBtnStatus: boolean = false;
    private subscriptionList: Subscription[] = [];


    constructor(private service: ApproveMatrixChangesService, private route: ActivatedRoute,
        private appService: AppService) {
        this.service.getCurrentUserName();
    }


    ngOnInit() {
        this.service.navigationName = this.route.snapshot.data['agencyType'];
        this.initApproveMatrixChangesForm();
        this.pfcPreOpen();
        this.service.saveBtnHandler.subscribe((_: boolean) => {
            //console.log(_);
            this.saveBtnStatus = _;
        });
    }
    ngOnDestroy() {
        this.subscriptionList.forEach(_ => _.unsubscribe());
    }
    
    private async pfcPreOpen(){
        let lsTitle = '';
        const lsParm = (this.service.navigationName + ' ' + this.title).toUpperCase;
        this.isAgencyType = this.service.navigationName;
        this.isWinType = this.title;

        switch (this.isAgencyType) {    
            case CONSTANTS.MED_AGENCY_TYPE:
                lsTitle = this.isWinType + ' - ' + this.isAgencyType.toUpperCase();
                break;
            case CONSTANTS.VA_AGENCY_TYPE:
                lsTitle = this.isWinType + ' - ' + this.isAgencyType.toUpperCase();
                this.setHistoryProfileId(null);
                break;
            case CONSTANTS.MEDICARE_AGENCY_TYPE:
                lsTitle = this.isWinType + ' - ' + this.isAgencyType.toUpperCase();
                this.setHistoryProfileId(null);
                break;
            default:
                this.appService.showMessage(`Internal Error! Invalid agency type ${this.isAgencyType}.`);
                return;
        }

        this.title = lsTitle;
        this.Tag = CONSTANTS.WINTYPE_MATRIX_APPR + ' - ' + this.isAgencyType.toUpperCase();
        const windowStatus: any = await this.appService.getUserPermission(this.Tag, this.title);
        this.title = windowStatus.windowTitle; 
        this.service.ibIsUpdateable = windowStatus.isUpdatable;
    }


    private setHistoryProfileId(id:any):number {
        if (!id || +id < 1) {
            this.service.histPrflId = 0;
        }
        else {
            this.service.histPrflId = id;
        }
        return this.service.SUCCESS;
    }


    private initApproveMatrixChangesForm() {
        this.approveMatrixChangesFormOptions = {
            viewMode: 'form', labelPos: 'left',
            title: ' ', labelSize: 2,
            modules: [ApproveMatrixChangesSubModule],
            tabClick: this.tabClick.bind(this),
            tabs: {
                'Classes of Trade': [
                    { type: 'html', content: '<class-of-trade-tab></class-of-trade-tab>' },
                ],
                'Transaction Types': [
                    { type: 'html', content: '<transaction-type-tab></transaction-type-tab>' },
                ],
                'Matrix Exceptions': [
                    { type: 'html', content: '<matrix-exceptions-tab></matrix-exceptions-tab>' },
                ],
                'Estimations': [
                    { type: 'html', content: '<estimation-tab></estimation-tab>' },
                ]
            }
        }           
    }
    private async tabClick(tabName) {
        if (this.service.isUpdatesPending) {
            await this.service.ueSave();
        }
        this.service.previousTab = this.service.activeTab;
        this.service.activeTab = tabName;
    }
    private saveBtn() {       
        this.service.ueSave();
    }
}