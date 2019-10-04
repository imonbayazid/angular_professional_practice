import {Component, OnInit, ViewEncapsulation,OnDestroy} from '@angular/core';
import {juForm, FormOptions, FormElement} from '../../../shared/juForm/juForm';
import {juGrid, GridOptions } from '../../../shared/juGrid/juGrid';
import {SelectOptions} from '../../../shared/juForm/juSelect';
import {FV} from '../../../shared/juForm/FV';
import {CONSTANTS} from '../../../shared/constant';
import {AppService} from '../../../shared/app.service';
import {ApproveMatrixChangesService} from '../ApproveMatrixChanges.service';
import {Observable, Subscription}   from 'rxjs/Rx';
declare var moment: any;

@Component({
    moduleId: module.id,
    selector: 'matrix-exceptions-tab',
    template: `<criteria-form-options tabName="COT/TT" (onChangeDropdown)="getDropdownValues($event)"></criteria-form-options>
                   <div><input style="vertical-align:sub;" type="checkbox" (click)="clickApproveAll($event)" [(ngModel)]="approve" [disabled]="!approveAll"><label for="approve">&nbsp;&nbsp;Approve All</label></div>
                    <div class="juGrid" [options]="matrixExceptionsGridOptions"></div>
                    <div> {{selectedProfileText}}{{baseProfileId}}</div>`,
    encapsulation: ViewEncapsulation.None
})

export class MatrixExceptionsTabComponent implements OnInit,OnDestroy {

    private matrixExceptionsGridOptions: GridOptions;
    private dropdownValues: any;
    private subscriptionList: Subscription[] = [];
    private iiCoId: number;
    private baseProfileId: string = 'NONE';
    private selectedProfileText: string = '';
    private calculationType: string = '';
    private ilBaseProfileId: number = 0;
    private templateProfileId: number;
    private ilIsUpdateable: boolean;
    private findBtnClicked: boolean = false;
    private approveAll: boolean = true;
    private approve: boolean = false;
    private Tag: string = '';
    private ibIsTemplate: boolean;
    private selectedRow: any = {};
    private dataSourceLoaded: boolean = true;
    private isCommentChanged: boolean = false;

    constructor(private service: ApproveMatrixChangesService, private appService: AppService) {
    }

    ngOnInit() {
        this.service.matrixExceptionsRef = this;
        this.initMatrixExceptionsGridOptions();
        this.ofSetUpPageType(CONSTANTS.COT_TT, true);
        this.subscriptionList.push(this.service.findHandler.subscribe(_ => {
            if (_ === CONSTANTS.COT_TT) {
                this.findFunc();
            }
        }));
        this.subscriptionList.push(this.service.setUpPageHandler.subscribe(_ => {
            if (_ === CONSTANTS.COT_TT) {
                this.ofSetUpPage();
            }
        }));
        this.subscriptionList.push(this.service.resetGridHandler.subscribe(_ => {
            this.approveAll = false;
            this.matrixExceptionsGridOptions.api.grid.empty();
        }));
    }

    ngOnDestroy() {
        this.subscriptionList.forEach(_ => _.unsubscribe());
    }

    private async initCOTTabFunc() {
        let profile: number = await this.service.getBaseProfileId(this.service.navigationName, this.dropdownValues['dataSource']);
        this.templateProfileId = profile;
    }

    private getDropdownValues(model: any) {
        this.dropdownValues = model;
        if (this.dataSourceLoaded) {
            this.ofSetUpPage();
        }
        this.dataSourceLoaded = false;
    }

    private async findFunc() {
        this.findBtnClicked = true;
        //if (this.service.ibIsUpdateable) {
            await this.initCOTTabFunc();
            this.baseProfileId = '' + this.templateProfileId;
            this.ueFind();
        //}
    }

    private async ueFind() {
        let llBaseProfileId: number;
        let liCoId: number = this.dropdownValues['dataSource'];
        let liCalcType: string = this.dropdownValues['calculationType'];

        if (liCoId === 0) {
            this.appService.messageDialog('', "Please specify the data source.");
            return;
        }
        if (liCalcType.length === 0) {
            this.appService.messageDialog('', "Please specify the calculation type.");
            return;
        }

        if (this.ibIsTemplate) {
            llBaseProfileId = this.templateProfileId;
        }
        else {
            llBaseProfileId = this.service.histPrflId;
        }

        if (llBaseProfileId !== this.ilBaseProfileId || !this.ibIsTemplate || this.calculationType !== this.dropdownValues['calculationType']) {
            if (this.ilBaseProfileId > 0) {
                let updatePending: boolean = this.service.isUpdatesPending;
                switch (updatePending) {
                    case false: //this.appService.messageDialog('', 'Internal Error! Unable to check for pending updates.');
                        break;
                    case true: this.appService.setCancelButton(true);
                        const result = await this.appService.confirmDialogPromise(" ", "Do you want to save changes?");
                        if (result == 1) {
                            this.service.pfcSave();
                        }
                        else if (result == 0) { //No
                            this.service.isUpdatesPending = false;
                            this.appService.isSavedPending = this.service.isUpdatesPending;
                            this.service.resetGridHandler.next(true);
                        }
                        else { //Cancel
                            return;
                        }
                        break;

                }
            }

            this.matrixExceptionsGridOptions.api.pager.refresh();
        }
        let lsFilter: string = `co_id = ${liCoId} AND calc_type_cd = ${liCalcType}`;
        //gnv_app.of_hcrs_dwfilter (dw_appr_matrix.inv_filter, ls_filter)

        this.iiCoId = liCoId;
        this.ilBaseProfileId = llBaseProfileId;
        this.setUpPage(this.iiCoId, this.ilBaseProfileId);
    }

    //of_setpagetype (string as_type, boolean ab_istemplate)
    private async ofSetUpPageType(asType: string, abIsTemplate: boolean) {
        if (!asType || asType.length === 0 || typeof abIsTemplate === 'undefined') {
            this.appService.messageDialog('', `Internal Error! Null or no value for arguments to of_setPageType function.
                                                as_type ${asType}, ab_template=${abIsTemplate}`);
            return this.service.FAILURE;
        }
        this.Tag = CONSTANTS.WINTYPE_MATRIX_APPR + ' - ' + this.service.navigationName.toUpperCase();

        if (abIsTemplate) {
            this.selectedProfileText = 'Template Profile Id: ';
            let lsAccess = await this.appService.ofGetAccess(this.Tag);
            if (lsAccess === CONSTANTS.ACCESS_FULL) {
                this.ofSetUpdateable(true);
                this.ofSetEnable(true);
            }
            else {
                this.ofSetUpdateable(false);
                this.ofSetEnable(false);
            }
        }
        else {
            this.selectedProfileText = 'Selected Profile Id: ';

            this.ofSetUpdateable(false);
            this.ofSetEnable(false);
        }
        this.ibIsTemplate = abIsTemplate;
    }

    //of_setupPage
    private setUpPage(coId: number, basePrfl: number) {
        let lsProtect: any;
        if (!basePrfl) {
            basePrfl = 0;
        }
        let lbEnable = this.ofIsUpdateable();
        //if (lbEnable) {
        //    if (coId > 0) {
        //        if (this.ofIsLocked(basePrfl)) {
        //            lbEnable = true;
        //        }
        //        else {
        //            lbEnable = false;
        //        }
        //    }
        //    else {
        //        lbEnable = false;
        //    }
        //}
        if (lbEnable) {
            this.ofSetUpdateable(true);
            this.matrixExceptionsGridOptions['isGridEnabled'] = true;   //should be commented out
            lsProtect = '0';
        }
        else {
            this.ofSetUpdateable(false);
            this.matrixExceptionsGridOptions['isGridEnabled'] = false;    // should be commented out
            lsProtect = '1';
        }

        this.approveAll = this.matrixExceptionsGridOptions.api.grid.getData().length > 0 && lbEnable === true;
        this.matrixExceptionsGridOptions['isApprovedAll'] = this.approveAll;
    }

    //of_set_enable (boolean ab_enable)
    private ofSetEnable(abEnable: boolean) {
        if (abEnable) {
            this.matrixExceptionsGridOptions['isGridEnabled'] = true;
            this.approveAll = true;
        }
        else {
            this.matrixExceptionsGridOptions['isGridEnabled'] = false;
            this.approveAll = false;
        }
        this.matrixExceptionsGridOptions['isApprovedAll'] = this.approveAll;
    }

    private ofSetUpdateable(abSwitch: any) {
        if (abSwitch === null) return -1;
        this.ilIsUpdateable = abSwitch;
        return 1;
    }

    private ofIsUpdateable(): boolean {
        return this.ilIsUpdateable;
    }

    private ofSetUpPage() {
        return this.setUpPage(this.dropdownValues['dataSource'], this.ilBaseProfileId);
    }

    public async clickApproveAll(event: any) {
        if (event.target.checked) {
            if (await this.appService.confirmDialogPromise('Policy Matrix Changes', 'Approve All?')) {
                this.ofSetApprovalStatus(1);
            }
            else {
                this.approve = false;
                //this.matrixExceptionsGridOptions['isApprovedAll'] = this.approveAll;
                return;
            }
        }
        else {
            if (await this.appService.confirmDialogPromise('Policy Matrix Changes', 'Unapprove All?')) {
                this.ofSetApprovalStatus(0);
            }
            else {
                this.approve = true;
                //this.matrixExceptionsGridOptions['isApprovedAll'] = this.approveAll;
                return;
            }
        }
    }

    public ofSetApprovalStatus(aiParam: number) {
        let li_mod_cnt: number = 0;
        if (aiParam === null) return this.service.FAILURE;
        const data: any[] = this.matrixExceptionsGridOptions.api.grid.getData();
        if (aiParam === 1) {
            for (let i = 0; i < data.length; i++) {
                if (data[i].APPRVD_IND === CONSTANTS.NO) {
                    data[i].APPRVD_IND = CONSTANTS.YES;
                    data[i].APPRVD_DT = Date.now();
                    data[i].APPRVD_BY = this.service.currentUserName;
                    li_mod_cnt++;
                    this.saveCOT_TTGridData(data[i].ROW_ID, data[i].APPRVD_IND, moment(data[i].APPRVD_DT).format('MM/DD/YYYY'));

                }
            }
        }
        else {
            for (let i = 0; i < data.length; i++) {
                if (data[i].APPRVD_IND === CONSTANTS.YES) {
                    data[i].APPRVD_IND = CONSTANTS.NO;
                    data[i].APPRVD_DT = Date.now();
                    data[i].APPRVD_BY = this.service.currentUserName;
                    li_mod_cnt++;
                    this.saveCOT_TTGridData(data[i].ROW_ID, data[i].APPRVD_IND, moment(data[i].APPRVD_DT).format('MM/DD/YYYY'));
                }
            }
        }
        if (li_mod_cnt > 0) {
            //this.service.isUpdatesPending = true;
            this.service.ofSetSave(true);
        }
    }

    public saveCOT_TTGridData(rowId: string, approvedInd: string, approvedDate: string, comment: string = '') {
        this.service.isUpdatesPending = true;
        this.appService.isSavedPending = this.service.isUpdatesPending;
        const url = `${this.service.pkgRootUrl}P_MATRIX_CHANGES_U/json?i_rowid=${rowId}&i_apprvd_ind=${approvedInd}&i_apprvd_dt=${approvedDate}&i_apprvd_by=${this.service.currentUserName}&i_cmt_txt=${comment}`;
        const result: any = this.appService.get(url).subscribe(res => {
            this.service.ancestorReturnValue = res.OutputParameters.O_RESULT == 0 ? false : true;
        });
    }

    private loadMatrixExceptionsGridData(params: any) {
        if (!this.findBtnClicked) {
            return Observable.of({ data: [], totalRecords: 0 });
        }

        let pageNo: number = 1;
        let colName = 'PRFL_ID';
        let sortOrder = 'ASC';

        params['i_colName'] = params.sort == '' ? colName : params.sort.split('|')[0];
        params['i_orderType'] = params.sort == '' ? sortOrder : params.sort.split('|')[1];
        let url = `${this.service.pkgRootUrl}P_MATRIX_CHANGES_S/json?i_al_profile_id=${this.baseProfileId}&i_pageNumber=${pageNo}&i_pageSize=${params.pageSize}&i_sortingColumn=${params.i_colName}&i_orderBy=${params.i_orderType}`;

        return this.appService.get(url)
            .do(res => {
                if (res.ResultSets[0].length > 0) {
                    this.selectedRow = res.ResultSets[0][0];
                    this.selectedRow.selected = true;
                    this.calculationType = this.dropdownValues['calculationType'];
                    res.ResultSets[0] = res.ResultSets[0].filter(x => x.CALC_TYP_CD === this.dropdownValues['calculationType']);
                    this.approveAll = res.ResultSets[0].length > 0 && this.ofIsUpdateable() === true;
                    this.matrixExceptionsGridOptions['isApprovedAll'] = this.approveAll;
                }
            })
            .map(res => { return { data: res.ResultSets[0], totalRecords: res.OutputParameters.O_TOTALRECORDS }; });

    }


    private initMatrixExceptionsGridOptions() {
        return this.matrixExceptionsGridOptions = {
            pageSize: 10000, noPager:true, quickSearch: false,
            title: 'Matrix Changes',
            sspFn: this.loadMatrixExceptionsGridData.bind(this),
            colResize: true, scroll: true,
            isGridEnabled: true,
            isApprovedAll: this.approveAll,
            trClass: row => ({ selected: row.selected }),
            rowEvents: '(click)="config.rowClick(row)"',
            classNames: 'table table-bordered', headerHeight: 45, rowHeight: 28,
            columnDefs: [
                { headerName: 'Approval Status', field: 'APPRVD_IND', sort: true, exp: `<input style="text-align: center;width: 100%;" type="checkbox" [checked]="row.APPRVD_IND==='Y'" (click)="config.checkApprovalStatus(row,$event)" [disabled]="!config.isGridEnabled">` },
                { headerName: 'Matrix', field: 'PRI_WHLS_MTHD_DESCR', sort: true },
                { headerName: 'Class of Trade Code', field: 'CLS_OF_TRD_CD', sort: true },
                { headerName: 'Transaction Type Code', field: 'TRANS_TYP_CD', sort: true },
                { headerName: 'Change Type', field: 'CHNG_TYP', sort: true },
                { headerName: 'Change Field', field: 'CHNG_FLD', sort: true },
                { headerName: 'COT Begin Date', field: `COT_BEGN_DT`, sort: true, cellRenderer: row => row.COT_BEGN_DT == null ? '00/00/0000' : moment(row.COT_BEGN_DT).format('MM/DD/YYYY') },
                { headerName: 'Trans Type Begin Date', field: `TT_BEGN_DT`, sort: true, cellRenderer: row => row.TT_BEGN_DT == null ? '00/00/0000' : moment(row.TT_BEGN_DT).format('MM/DD/YYYY') },
                { headerName: 'Old Value Descr', width: 150, field: 'OLD_VALUE_DESCR', sort: true },
                { headerName: 'New Value Descr', field: 'NEW_VALUE_DESCR', sort:true },
                { headerName: 'Change Date', field: `CHNG_DT`, sort: true, cellRenderer: row => row.CHNG_DT == null ? '00/00/0000' : moment(row.CHNG_DT).format('MM/DD/YYYY') },
                { headerName: 'Comment', field: 'CMT_TXT', sort: true, exp: `<input type="text" style="color:#000000" (keyup)="config.clickCommentBox(row,$event)" (blur)="config.updateComment(row,$event)" [(ngModel)]="row.CMT_TXT" [disabled]="!config.isApprovedAll" />` },
                { headerName: 'Change By', field: 'CHNG_BY', sort: true },
                { headerName: 'Approved Date', field: `APPRVD_DT`, sort: true, cellRenderer: row => row.APPRVD_DT == null ? '00/00/0000' : moment(row.APPRVD_DT).format('MM/DD/YYYY') },
                { headerName: 'Approved By', field: 'APPRVD_BY', sort: true },
                { headerName: 'Prfl Id', field: 'PRFL_ID', sort: true },
                { headerName: 'Co Id', field: 'CO_ID', sort: true },
                { headerName: 'Prcssd Ind', field: 'PRCSSD_IND', sort: true },
                { headerName: 'Company Name', field: 'CO_NM', sort: true },
                { headerName: 'Calculation Type', field: 'CALC_TYP_CD', sort: true ,width:160 },

            ],
            rowClick: row => {
                this.selectedRow.selected = false;
                row.selected = true;
                this.selectedRow = row;
            },
            checkApprovalStatus: (row: any, e: any) => { 
                //console.log(e.target.checked);
                row.APPRVD_DT = Date.now();
                row.APPRVD_BY = this.service.currentUserName;
                this.service.ofSetSave(true);
                this.saveCOT_TTGridData(row.ROW_ID, e.target.checked ? 'Y' : 'N', moment(Date.now()).format('MM/DD/YYYY'), row.CMT_TXT);
            },
            clickCommentBox: (row: any, e: any) => {
                row.APPRVD_DT = Date.now();
                row.APPRVD_BY = this.service.currentUserName;
                row.CMT_TXT = e.target.value.toUpperCase();
                this.isCommentChanged = true;
                this.service.ofSetSave(true);
            },
            updateComment: (row: any, e: any) => {
                if (row.CMT_TXT !== null && row.CMT_TXT !== '' && this.isCommentChanged) {
                    this.saveCOT_TTGridData(row.ROW_ID, e.target.checked ? 'Y' : 'N', moment(Date.now()).format('MM/DD/YYYY'), row.CMT_TXT);
                }
            }
        };
    }
}