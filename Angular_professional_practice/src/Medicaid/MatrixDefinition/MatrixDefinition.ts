import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { juForm, FormElement, FormOptions } from '../../shared/juForm/juForm';
import { FV } from '../../shared/juForm/FV';
import { AppService } from '../../shared/app.service';
import { MatrixDefinitionService } from './MatrixDefinition.service';
import { MatrixDefinationSubModule } from './MatrixDefinationSubModule/MatrixDefinationSub.module';
import { DataLoad } from './MatrixDefinationSubModule/DataLoad';
import {ActivatedRoute} from '@angular/router';
import { MatrixDetail } from './MatrixDefinationSubModule/MatrixDetail';
import { Trade } from './MatrixDefinationSubModule/Trade';
import { Transaction } from './MatrixDefinationSubModule/Transaction';
import { Estimation } from './MatrixDefinationSubModule/Estimation';
import { MatrixException } from './MatrixDefinationSubModule/MatrixException';
import { COT } from './MatrixDefinationSubModule/COT';
import { CONSTANTS } from '../../shared/constant';

@Component({
    moduleId: module.id,
    selector: 'matrix-definition-main-form',
    template: `<div><h5> {{service.appService.deployedEnvironment}}  > {{agency}} > Matrix Definition[ {{windowTitle}} ]</h5></div>
    <div juForm (onLoad)="loadForm($event)" [options]="options"></div>`,
    encapsulation: ViewEncapsulation.None // load all css files if we use native then it will load just the css file of same directory
})
export class MatrixDefinition {

    public options: FormOptions;
    public form: juForm;
    activeTab: string = 'Matrix Details';
    previousTab: string = 'Matrix Details';
    currentTab: string;//new
    Tag: any = null;
    menuName: any = "MATRIX DEFINITION - ";//MATRIX DEFINITION - MEDICAID
    windowTitle: any = "Matrix Definition";
    agency: any;

    matrixDetails: MatrixDetail;
    trade: Trade;
    transaction: Transaction;
    estimation: Estimation;
    cot: COT;
    matrixException: MatrixException;
    public readOnly: any = false;

    constructor(private service: MatrixDefinitionService, route: ActivatedRoute) {
        this.service.is_agency = route.snapshot.data['agency'];
        this.agency = this.service.is_agency;
        this.initForm();
        this.service.loadDropdownData();
       
    }
    public ngOnInit() {
        this.preOpen();
    }
    public ngOnDestroy() {

    }

    //<transaction (onLoad)="config.loadTransaction($event)"></transaction>
    protected initForm() {
        this.options = {
            viewMode: 'form', modules: [MatrixDefinationSubModule], tabClick: this.tabClick.bind(this),
            btnSaveDisabled: true,
            isReadonly: this.readOnly,
            tabs: { 
                'Matrix Details': [{ type: 'html', content: '<matrix-detail (onLoad)="config.loadMatrixDetail($event)"></matrix-detail>' }],               
                'Classes of Trade': [{ type: 'html', content: '<trade (onLoad)="config.loadTrade($event)"></trade>' }],
                'COT Exceptions': [{ type: 'html', content: '<cot (onLoad)="config.loadCOTExceptions($event)"></cot>' }],
                'Transaction Types': [{ type: 'html', content: '<transaction (onLoad)="config.loadTransaction($event)"></transaction>' }],
                'Matrix Exceptions': [{ type: 'html', content: '<matrix-exception (onLoad)="config.loadMatrixException($event)"></matrix-exception>' }],
                'Estimations': [{ type: 'html', content: '<estimation (onLoad)="config.loadEstimations($event)"></estimation>' }]
            },

            buttons: { save: { type: 'button', cssClass: 'btn btn-primary', exp: `[disabled]="config.btnSaveDisabled"`, click: () => { this.save(); } } },
            loadMatrixDetail: (md: MatrixDetail) => {
                this.matrixDetails = md;
               // console.log('Set metrix details');
                if (this.service.is_agency === 'MEDICAID') {
                    //console.log('matrix details');
                    this.activeTab = 'Matrix Details';
                    this.service.appService.async_call(() => { this.form.setActiveTab('Matrix Details'); });
                }
            },
            loadTrade: (trade: Trade) => {
                this.trade = trade;
                if (this.service.is_agency !== 'MEDICAID') {
                    //this.tabClick('Classes of Trade');
                }
            },
            loadMatrixException: (matrixException: MatrixException) => {
                this.matrixException = matrixException;
            },
            loadTransaction: (transaction: Transaction) => {
                this.transaction = transaction;
            },
            loadEstimations: (estimation: Estimation) => {
                this.estimation = estimation;
            },
            loadCOTExceptions: (cot: COT) => {
                this.cot = cot;
            }
        };
        if (this.service.is_agency !== 'MEDICAID') {
            delete this.options.tabs['Matrix Details'];
        } 
    }
    protected loadForm(form: juForm) {
        this.form = form;
        
    }
    public tabClick(tabName) {
        this.currentTab = tabName;
       // console.log('tabName previousTab activeTab', tabName, this.previousTab, this.activeTab);
       // if (this.previousTab === tabName) return; //// new code
        this.save();// console.log('tab-click', tabName, this.activeTab);
        this.previousTab = this.activeTab;
       
        if (this.activeTab === 'Matrix Details' && tabName !== 'Matrix Details') {
           
            if (this.service.is_agency === 'MEDICAID') { this.matrixDetails ? this.matrixDetails.setMatrixDetail() : this.of_setHistProfileId(0);}
            else this.of_setHistProfileId(0); // For VA/MEDICARE as there is no matrix details tab set histProfileId 0
               // this.trade.of_getFocus();// //below function call, when this tab get focus u_tabpg_matrix.of_getFocus()___
        }
        this.activeTab = tabName;
        switch (tabName) {
            case 'Classes of Trade': this.trade && this.trade.onDemand(); break;
            case 'Transaction Types': this.transaction.onDemand(); break;
            case 'Estimations':  this.estimation.onDemand(); break;
            case 'COT Exceptions': this.cot.onDemand(); break;
            case 'Matrix Exceptions': this.matrixException.onDemand();  break; 
        }


    }
    public async save() {
        const tab: DataLoad = this.getTabInstance(this.activeTab);
        if (tab) {
            if (!tab.updatePending) { return true; }
            // this.service.appService.setCancelButton(true);
            const li_rc = await this.service.appService.confirmDialogByMessageId(CONSTANTS.CHANGES_PENDING, ['Do You Want to Save The Changes']);
            if (li_rc === 1) {
                return tab.save();
            }
            //else if (li_rc == -1) { return false; }//cancel // this.form.setActiveTab(this.previousTab);
            else {
                this.disableSaveButton(true);
                tab.updatePending = false;
                this.service.appService.get(`sdalhPKG_UI_COMMON.P_ROLLBACK/json?`).toPromise();
                tab.refreshData();
            }
        }
        return true;
    }
    public canDeactivate() {       
        return this.save();
    }
    public disableSaveButton(isDisable: boolean) {
        this.options['btnSaveDisabled'] = isDisable;
        this.options['isReadonly'] = this.readOnly;
        //console.log("this.options['btnSaveDisabled']", this.options['btnSaveDisabled']);
    }
    public checkSaveButton() {
        console.log("btnSaveDisabled  isReadonly", this.options['btnSaveDisabled'], this.options['isReadonly']);
    }
    private getTabInstance(tabName: string): DataLoad {
        switch (tabName) {
            case 'Classes of Trade': return this.trade;
            case 'Transaction Types': return this.transaction;
            case 'Estimations': return this.estimation;
            case 'COT Exceptions': return this.cot;
            case 'Matrix Exceptions': return this.matrixException;
        }
    }
    public changeProfile() {
        Object.keys(this.options.tabs).forEach(tab => {
            const tabInstance = this.getTabInstance(tab)
            if (tabInstance && tabInstance.profileChanged) {
                // if profile id changes then reset the dropdown data 
                // reset all grid data
                tabInstance.profileChanged();
            }
        });
    }
    //common function 
    is_win_type: string;
    is_agency_type: string;
    ii_lock_profiles: number;
    ib_lock_count: boolean = false;
    il_profile_id: number;
    il_hist_prfl_id: number;

    public of_setsave(ab_switch: boolean = true): boolean {

        if (this.ii_lock_profiles === 1) {
            this.options['btnSaveDisabled'] = ab_switch;
        }
        return true;
    }

    public of_setHistProfileId(al_hist_prfl_id: number = 0): boolean {
        this.il_hist_prfl_id = al_hist_prfl_id;
        this.service.of_setHistProfileId(this.il_hist_prfl_id);
        return true;
    }


    private async  preOpen() {
        switch (this.service.is_agency) {
            case CONSTANTS.MED_AGENCY_TYPE: this.Tag = this.menuName + this.service.is_agency.toUpperCase(); break;
            case CONSTANTS.VA_AGENCY_TYPE: this.Tag = this.menuName + this.service.is_agency.toUpperCase(); break;
            case CONSTANTS.MEDICARE_AGENCY_TYPE: this.Tag = this.menuName + this.service.is_agency.toUpperCase(); break;
            default: this.service.appService.messageDialog(' ', 'Internal Error! Invalid window type passed (MATRIX)');
        }
        var windowStatus = await this.service.appService.getUserPermission(this.Tag, this.windowTitle);
        this.windowTitle = windowStatus.windowTitle;

        // set updateable true/false 
        this.service.updatable = windowStatus.isUpdatable;
        this.readOnly = !(this.service.updatable);
        this.options['isReadonly'] = this.readOnly;

        if (windowStatus.userPermission == true) {
 
           
         } else {
             // if user has no permission then show nothing

         } 


    }

}
