import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {juForm, FormElement, FormOptions} from '../../shared/juForm/juForm';
import {SelectOptions} from '../../shared/juForm/juSelect';
import { FV}          from '../../shared/juForm/FV';
import {juGrid, GridOptions } from '../../shared/juGrid/juGrid';


import {AppService} from '../../shared/app.service';
import {ApprovePricesService} from './ApprovePrices.service';


import {Observable} from 'rxjs/Rx';
declare var moment: any;

@Component({
    moduleId: module.id,
    templateUrl: './ApprovePrices.html',
    styleUrls: ['./ApprovePrices.css'],
    encapsulation: ViewEncapsulation.None
})
export class ApprovePricesComponent {
    private approvePricesFormOptions: FormOptions;
    private productFamilyPricesGridOptions: GridOptions;
    private profileListGridOptions: GridOptions;
    private profileId: number = 0;
    private profileName: string = '';
    private requestFromRadioButtonClick: number = 1;
    private unapproveAmpBp: boolean = false;
    private dateFormat: string = 'MM/DD/YYYY';
    private dateTimeFormat: string = 'MM/DD/YYYY HH:mm:ss';

    private productFamilyGridData: any[] = [];

    private isStatusChanged: boolean = false;

    private ib_warn: boolean = false;



    constructor(private appService: AppService, private approvePricesService: ApprovePricesService) {

        this.initApprovePricesForm();
    }

    ////Check access level Start//////////////////////////////
    private title: string = 'Pricing Approval - Medicare';
    private Tag: string = '';
    ngOnInit() {

        this.pfcPreOpen();
    }
    private async pfcPreOpen() {
        this.Tag = this.title.toUpperCase();
        const windowStatus: any = await this.appService.getUserPermission(this.Tag, this.title);

        this.title = windowStatus.windowTitle;
        this.approvePricesFormOptions["isLocked"] = windowStatus.isUpdatable;
    }

    private formatProfileGridData(data: any) {
        return data.map(row => {
            row.BEGN_DT = moment(row.BEGN_DT).isValid() ? moment(row.BEGN_DT).format(this.dateFormat) : "";
            row.END_DT = moment(row.END_DT).isValid() ? moment(row.END_DT).format(this.dateFormat) : "";
            row.MOD_DT = moment(row.MOD_DT).isValid() ? moment(row.MOD_DT).format(this.dateTimeFormat) : "";
            return row;
        });
    }

    private formatProductGridData(data: any) {
        return data.map(row => {
            row.APPRVD_DT = moment(row.APPRVD_DT).isValid() ? moment(row.APPRVD_DT).format(this.dateTimeFormat) : "";
            return row;
        });
    }
    ////Check access level End////////////////////////////////

    public savePendingChanges() {
        if (this.approvePricesService.ModifiedApprovalRows.length > 0) {
            this.appService.confirmDialogPromise('Confirmation', 'Do you want to save changes?').then((res) => {
                if (res === 1) {
                    this.saveProductFamilyGridData(res);
                }
                else {
                    this.approvePricesService.ModifiedApprovalRows = [];
                    this.appService.isSavedPending = false;
                }
            });
        }
    }

    ngOnDestroy() {
        this.savePendingChanges();
    }

    private initApprovePricesForm() {
        this.approvePricesFormOptions = {
            viewMode: 'form',
            category: 1,
            clickRadio: () => {
                this.requestFromRadioButtonClick = 1;
                this.profileListGridOptions.api.pager.refresh();

            },
            profileListGridOptions: this.getProfileListGridOptions(),
            productFamilyPricesGridOptions: this.getProductFamilyPricesGridOptions(),
            RefreshGrid: () => {
                this.profileListGridOptions.api.pager.refresh();
            },
            disableApproveASP: false,
            disableUnapproveASP: false,
            disableSave: false,
            isLocked: false,
            of_ApprovePrices: this.of_ApprovePrices.bind(this),
            saveProductFamilyGridData: this.saveProductFamilyGridData.bind(this),
            stat_descr: '',

            inputs: [
                {
                    type: 'groupLayout',
                    items: [
                        {

                            groupName: '',
                            isContainer: true,
                            //labelSize: 4,
                            size: 12,
                            inputs: [
                                {
                                    type: 'html', content: `<label><input checked style="vertical-align: text-bottom; margin-right: 3px;"  type="radio" (click)="config.category=1;config.clickRadio()" name="pricing">Ready and Approved</label>
                                                            <span style="width:20px;">&nbsp;</span>
                                                            <label><input style="vertical-align: text-bottom; margin-right: 3px;"  type="radio" (click)="config.category=2;config.clickRadio()" name="pricing">Transmitted</label>
                                                            <button type="button" style="float: right; margin-top: -15px;" class="btn btn-primary" (click) = "config.RefreshGrid()">Refresh</button>
                                                            `
                                },
                                { type: 'html', content: `<div class="juGrid"  [options]="config.profileListGridOptions"></div>` }
                            ]
                        },
                        {

                            groupName: '',
                            isContainer: true,
                            //labelSize: 4,
                            size: 12,
                            inputs: [

                                { type: 'html', content: `<div class="juGrid"  [options]="config.productFamilyPricesGridOptions"></div>` }
                            ]
                        },

                    ],

                },
                {
                    type: 'html',
                    content: `<div style="text-align: right;">
                                <span style="color:red; padding-right: 100px;"><b>{{config.stat_descr}}</b></span>
                                <button type="button"  class="btn btn-primary" [disabled]="!config.isLocked || config.disableApproveASP" (click) = "config.of_ApprovePrices('ASP','Y')">Approve ASP</button>
                                <button type="button"  class="btn btn-primary" [disabled]="!config.isLocked || config.disableUnapproveASP" (click) = "config.of_ApprovePrices('ASP','N')">Unapprove ASP</button>                                
                                <button type="button"  class="btn btn-primary" [disabled]="!config.isLocked || config.disableSave" (click) = "config.saveProductFamilyGridData()">Save</button>
                                
                              </div>
                              `



                },

            ],
        }
    }


    private async of_ApprovePrices(btnClickValue, status) {

        if (status === 'Y' && this.ib_warn === true) {
            //prompt user 
            const li_rtn = await this.appService.confirmDialogPromise("Confirmation", this.approvePricesFormOptions["stat_descr"] + "- proceed with approval?");

            if (li_rtn === 0) {
                //Kick-off the Approve Prices function
                return;
            }
        }

        //this.approvePricesService.medicaidPriceApprovalSelectedRow = 
        var sls_excl_exists: boolean = false;
        for (var row of this.approvePricesService.medicaidPriceApprovalRows) {
            let isModified: boolean = false;
            let prflId = this.approvePricesService.profileListGridSelectedResultRow.PRFL_ID;
            let processTypeCd = this.approvePricesService.profileListGridSelectedResultRow.PRCSS_TYP_CD;
            let agencyTypeCd = 'MEDICARE';
            if (status === 'Y') {
                let ndcLbl = row.NDC_LBL === null ? "" : row.NDC_LBL;
                let ndcProd = row.NDC_PROD === null ? "" : row.NDC_PROD;
                let ndcPckg = row.NDC_PCKG === null ? "" : row.NDC_PCKG;
                let url = "sdalhPKG_UI_MEDICAID_APPROVE_PRICES.P_CHECK_UNEVAL_S/json?i_profile_id=" + prflId + "&i_ndc_lbl=" + ndcLbl + "&i_ndc_prod=" + ndcProd + "&i_ndc_pckg=" + ndcPckg + "&i_eval_type=SALES EXCLUSIONS";
                let unevalStatus = await this.checkUneval(url);
                if (unevalStatus === 'Y') {
                    sls_excl_exists = true;
                    continue;

                }

            }



            if (row.PRICE_STATUS !== 'TRX') {

                row.APPRVD_IND = status;
                isModified = true;

            }

            if (isModified === true) {
                this.approvePricesService.ModifiedApprovalRows.push(row);
                this.appService.isSavedPending = true;
            }

            if (this.approvePricesService.ModifiedApprovalRows.length > 0) {
                this.approvePricesFormOptions["disableSave"] = false;

            }
            else {
                this.approvePricesFormOptions["disableSave"] = true;

            }

            this.approvePricesFormOptions["disableApproveASP"] = true;
            this.approvePricesFormOptions["disableUnapproveASP"] = true;

            if (row.APPRVD_IND === 'Y') {
                this.approvePricesFormOptions["disableUnapproveASP"] = false;
            }
            else {
                if (row.ALLOW_APPR_IND === 'Y') {
                    this.approvePricesFormOptions["disableApproveASP"] = false;
                }
                else if (row.ALLOW_APPR_IND === 'W') {
                    this.approvePricesFormOptions["disableApproveASP"] = false;
                }
                else {
                    this.approvePricesFormOptions["disableApproveASP"] = true;
                }
            }
        }

        if (sls_excl_exists) {
            this.appService.messageDialog("Health Care Regulatory System", "At least one unapproved sales exclusion exists for this profile. Please approve all sales exclusions prior to proceeding.");
        }
        this.determineProfileStatus();
    }

    private checkUneval(url) {
        return this.appService.get(url).map(result => result.ResultSets[0][0].PROFILEID).toPromise();

    }

    private getProfileListGridOptions() {

        return this.profileListGridOptions = {
            pageSize: 10, linkPages: 10, quickSearch: false, pagerPos: 'header',
            enablePageSearch: false, enablePowerPage: true,
            rowEvents: '(click)="config.rowClick(row,i)"', title: 'Profile List',
            sspFn: this.loadProfileListGridData.bind(this),
            colResize: true, scroll: true,
            classNames: 'table table-bordered', headerHeight: 45, rowHeight: 26,
            trClass: row => ({ rowSelected: row.isSelected }),
            columnDefs: [
                { headerName: 'Name', width: 200, field: 'PRFL_NM', sort: true },
                { headerName: 'Status', field: 'PRFL_STAT_CD', sort: true },
                { headerName: 'Time Period', field: 'TIM_PER_CD', sort: true },
                { headerName: 'Start Date', field: 'BEGN_DT', sort: true },
                { headerName: 'End Date', field: 'END_DT', sort: true },
                { headerName: 'Processing Type', width: 150, field: 'PRCSS_TYP_DESCR', sort: true },
                { headerName: 'Prelim?', field: 'PRELIM_IND', sort: true, exp: `<input style="text-align: center;width: 100%;" type="checkbox" [checked]="row.PRELIM_IND==='Y'" disabled name="prelim">` },
                { headerName: 'Modified Date', field: 'MOD_DT', sort: true },
                { headerName: 'Last Modified By', width: 150, field: 'MOD_BY', sort: true },
                { headerName: 'Profile Id', field: 'PRFL_ID', sort: true },
                { headerName: 'Attachments', field: 'ATTACHMENT_REF_ID', sort: true, exp: `<input style="text-align: center;width: 100%;" type="checkbox" [checked]="row.ATTACHMENT_REF_ID===1" disabled name="attachments">` },
            ],
            rowClick: async (row, i) => {
                if (this.approvePricesService.ModifiedApprovalRows.length > 0) {
                    this.appService.setCancelButton(true);
                    let res = await this.appService.confirmDialogPromise('Confirmation', 'Do you want to save changes?');
                    if (res === 1) {
                        await this.saveProductFamilyGridData(res);

                        // this.approvePricesService.ModifiedApprovalRows = [];

                        this.profileId = row.PRFL_ID;
                        this.profileName = row.PRFL_NM;
                        this.requestFromRadioButtonClick = 0;
                        this.approvePricesService.profileListGridSelectedResultRow = row;

                        if (row.ALLOW_APPR_IND === 'W') {
                            this.ib_warn = true;
                        }
                        else {
                            this.ib_warn = false;
                        }

                        if (row.ALLOW_APPR_IND !== 'Y') {
                            this.approvePricesFormOptions["stat_descr"] = row.STAT_DESCR;
                        }
                        else {
                            this.approvePricesFormOptions["stat_descr"] = "";
                        }

                        this.productFamilyPricesGridOptions.api.pager.refresh();

                        this.approvePricesService.profileListGridSelectedResultRows.forEach(_ => _.isSelected = false);
                        this.approvePricesService.profileListGridSelectedResultRows = [];
                        row.isSelected = true;
                        if (row.isSelected) this.approvePricesService.profileListGridSelectedResultRows.push(row);
                        else this.approvePricesService.profileListGridSelectedResultRows.splice(this.approvePricesService.profileListGridSelectedResultRows.indexOf(row), 1);
                    }
                    else if (res === 0) {
                        this.approvePricesService.ModifiedApprovalRows = [];
                        this.appService.isSavedPending = false;
                        this.profileId = row.PRFL_ID;
                        this.profileName = row.PRFL_NM;
                        this.requestFromRadioButtonClick = 0;
                        this.approvePricesService.profileListGridSelectedResultRow = row;

                        if (row.ALLOW_APPR_IND === 'W') {
                            this.ib_warn = true;
                        }
                        else {
                            this.ib_warn = false;
                        }

                        if (row.ALLOW_APPR_IND !== 'Y') {
                            this.approvePricesFormOptions["stat_descr"] = row.STAT_DESCR;
                        }
                        else {
                            this.approvePricesFormOptions["stat_descr"] = "";
                        }

                        this.productFamilyPricesGridOptions.api.pager.refresh();

                        this.approvePricesService.profileListGridSelectedResultRows.forEach(_ => _.isSelected = false);
                        this.approvePricesService.profileListGridSelectedResultRows = [];
                        row.isSelected = true;
                        if (row.isSelected) this.approvePricesService.profileListGridSelectedResultRows.push(row);
                        else this.approvePricesService.profileListGridSelectedResultRows.splice(this.approvePricesService.profileListGridSelectedResultRows.indexOf(row), 1);
                    }

                    else {
                        return;
                    }
                    this.appService.setCancelButton(false);
                }

                else {

                    this.profileId = row.PRFL_ID;
                    this.profileName = row.PRFL_NM;
                    this.requestFromRadioButtonClick = 0;
                    this.approvePricesService.profileListGridSelectedResultRow = row;
                    if (row.ALLOW_APPR_IND === 'W') {
                        this.ib_warn = true;
                    }
                    else {
                        this.ib_warn = false;
                    }
                    if (row.ALLOW_APPR_IND !== 'Y') {
                        this.approvePricesFormOptions["stat_descr"] = row.STAT_DESCR;
                    }
                    else {
                        this.approvePricesFormOptions["stat_descr"] = "";
                    }

                    this.productFamilyPricesGridOptions.api.pager.refresh();

                    this.approvePricesService.profileListGridSelectedResultRows.forEach(_ => _.isSelected = false);
                    this.approvePricesService.profileListGridSelectedResultRows = [];
                    row.isSelected = true;
                    if (row.isSelected) this.approvePricesService.profileListGridSelectedResultRows.push(row);
                    else this.approvePricesService.profileListGridSelectedResultRows.splice(this.approvePricesService.profileListGridSelectedResultRows.indexOf(row), 1);
                }

            },
        };
    }

    private loadProfileListGridData(params: any) {

        let colName = 'PRFL_ID';
        let sortOrder = 'DESC';

        params['i_agency_typ_cd'] = 'MEDICARE';
        //params['i_profile_status'] = this.approvePricesFormOptions['category'] == 1 ? 'READY' :'TRANSMITTED';
        params['i_profile_status'] = this.approvePricesFormOptions['category'] == 1 ? "'READY', 'APPROVED'" : "'TRANSMITTED'";
        params['i_colName'] = params.sort == '' ? colName : params.sort.split('|')[0];
        params['i_orderType'] = params.sort == '' ? sortOrder : params.sort.split('|')[1];



        let url = 'sdalhPKG_UI_MEDICAID_APPROVE_PRICES.P_D_HCRS_PROFILES_S/json?i_in_agency_typ_cd=' + params.i_agency_typ_cd + '&i_profile_status=' + params.i_profile_status + '&i_pageNumber=' + params.pageNo +
            '&i_pageSize=' + params.pageSize + '&i_sortingColumn=' + params.i_colName + '&i_orderBy=' + params.i_orderType;

        return this.appService.get(url)
            .map(res => {
                return { data: this.formatProfileGridData(res.ResultSets[0]), totalRecords: res.OutputParameters.O_TOTALRECORDS };
            })
            .do(res => {
                if (res.data.length > 0) {
                    this.approvePricesService.profileListGridSelectedResultRow = res.data[0];
                    if (res.data[0].ALLOW_APPR_IND === 'W') {
                        this.ib_warn = true;
                    }
                    else {
                        this.ib_warn = false;
                    }
                    if (res.data[0].ALLOW_APPR_IND !== 'Y') {
                        this.approvePricesFormOptions["stat_descr"] = res.data[0].STAT_DESCR;
                    }
                    else {
                        this.approvePricesFormOptions["stat_descr"] = "";
                    }
                    this.approvePricesService.profileListGridSelectedResultRow.isSelected = true;
                    this.approvePricesService.profileListGridSelectedResultRow = this.approvePricesService.profileListGridSelectedResultRowBeforeRefresh ? res.data[this.approvePricesService.profileListGridLastClickedResult] : res.data[0];
                    this.approvePricesService.profileListGridSelectedResultRowBeforeRefresh = false;
                    this.approvePricesService.profileListGridSelectedResultRows.push(this.approvePricesService.profileListGridSelectedResultRow);
                    this.productFamilyPricesGridOptions.api.pager.refresh();
                }
                else {
                    this.appService.messageDialog("Pricing Approval (Medicare) - Maintenance", "There are no profiles for MEDICARE agency ready for approval");
                }
            });

    }


    private getProductFamilyPricesGridOptions() {

        return this.productFamilyPricesGridOptions = {
            pageSize: 10, linkPages: 10, quickSearch: false, pagerPos: 'header',
            enablePageSearch: false, enablePowerPage: true,
            title: 'Product Prices',
            rowEvents: '(click)="config.rowClick(row,$event)"',
            sspFn: this.loadProductFamilyPricesGridData.bind(this),
            colResize: true, scroll: true,
            classNames: 'table table-bordered', headerHeight: 45, rowHeight: 26,
            trClass: row => ({ selected: row.selected }),
            columnDefs: [
                { headerName: 'Product NDC', width: 200, field: 'PROD_NDC', sort: true },
                { headerName: 'Product Name', field: 'PROD_NM', sort: true },
                { headerName: 'ASP($)', field: 'CALC_AMT', sort: true },
                { headerName: 'Medicare Eligible?', field: 'MEDICARE_ELIG_STAT_CD', sort: true, exp: `<input style="text-align: center;width: 100%;" type="checkbox" [checked]="row.MEDICARE_ELIG_STAT_CD==='EL'" disabled name="ELIG_STAT_CD">` },
                { headerName: 'Approved', width: 150, field: 'APPRVD_IND', sort: true, exp: `<input style="text-align: center;width: 100%;" type="checkbox" [checked]="row.APPRVD_IND==='Y'" disabled name="Approved">` },
                { headerName: 'Approved By', field: 'APPRVD_BY', sort: true },
                { headerName: 'Approval Dt', field: 'APPRVD_DT', sort: true },
                { headerName: 'Pricing Status', field: 'PRICE_STATUS_DESCR', width: 150, sort: true },

            ],
            rowClick: (row, e) => {


                this.approvePricesService.productFamilyPricesGridSelectedResultRow = row;

                if (e.ctrlKey) {
                    row.selected = !row.selected;
                } else {
                    this.approvePricesService.medicaidPriceApprovalRows.forEach(_ => _.selected = _ === row);
                    row.selected = true;
                    this.approvePricesService.medicaidPriceApprovalRows = [];
                }
                row.selected ? this.approvePricesService.medicaidPriceApprovalRows.push(row) : this.approvePricesService.medicaidPriceApprovalRows.splice(this.approvePricesService.medicaidPriceApprovalRows.indexOf(row), 1)
                if (row.selected === false) {
                    this.approvePricesFormOptions["disableApproveASP"] = true;
                    this.approvePricesFormOptions["disableUnapproveASP"] = true;
                    this.approvePricesFormOptions["disableSave"] = true;

                    this.approvePricesService.productFamilyPricesGridSelectedResultRow = null;

                }
                else {
                    if (this.approvePricesFormOptions['category'] === 1) {

                        this.approvePricesFormOptions["disableApproveASP"] = true;
                        this.approvePricesFormOptions["disableUnapproveASP"] = true;
                        if (this.approvePricesService.ModifiedApprovalRows.length === 0) {
                            this.approvePricesFormOptions["disableSave"] = true;
                        }



                        if (row.APPRVD_IND === 'Y') {
                            this.approvePricesFormOptions["disableUnapproveASP"] = false;
                        }
                        else {
                            if (row.ALLOW_APPR_IND === 'Y') {
                                this.approvePricesFormOptions["disableApproveASP"] = false;
                            }
                            else if (row.ALLOW_APPR_IND === 'W') {
                                this.approvePricesFormOptions["disableApproveASP"] = false;
                            }
                            else {
                                this.approvePricesFormOptions["disableApproveASP"] = true;
                            }
                        }
                    }
                    else {
                        this.approvePricesFormOptions["disableApproveASP"] = true;
                        this.approvePricesFormOptions["disableUnapproveASP"] = true;
                        this.approvePricesFormOptions["disableSave"] = true;

                    }
                }
                //this.approvePricesService.productFamilyPricesGridSelectedResultRows.forEach(_ => _.isSelected = false);
                //this.approvePricesService.productFamilyPricesGridSelectedResultRows = [];

                //if (row.isSelected) this.approvePricesService.productFamilyPricesGridSelectedResultRows.push(row);
                //else this.approvePricesService.productFamilyPricesGridSelectedResultRows.splice(this.approvePricesService.productFamilyPricesGridSelectedResultRows.indexOf(row), 1);


            },
        };
    }

    private loadProductFamilyPricesGridData(params?: any) {
        let colName = 'PRFL_ID';
        let sortOrder = 'DESC';

        params['i_colName'] = params.sort == '' ? colName : params.sort.split('|')[0];
        params['i_orderType'] = params.sort == '' ? sortOrder : params.sort.split('|')[1];


        if (this.approvePricesFormOptions['category'] === 1 && this.approvePricesService.profileListGridSelectedResultRow !== null) {
            //this.profileId = this.requestFromRadioButtonClick == 1 ? this.approvePricesService.profileListGridSelectedResultRow.PRFL_ID : this.profileId;
            //this.profileName = this.requestFromRadioButtonClick == 1 ? this.approvePricesService.profileListGridSelectedResultRow.PRFL_NM : this.profileName;
            //this.requestFromRadioButtonClick = 0;

            this.profileId = this.approvePricesService.profileListGridSelectedResultRow.PRFL_ID;
            this.profileName = this.approvePricesService.profileListGridSelectedResultRow.PRFL_NM;
        }

        if (this.approvePricesFormOptions['category'] === 2 && this.approvePricesService.profileListGridSelectedResultRow !== null) {
            //this.profileId = this.requestFromRadioButtonClick == 1 ? this.approvePricesService.profileListGridSelectedResultRow.PRFL_ID : this.profileId;
            //this.profileName = this.requestFromRadioButtonClick == 1 ? this.approvePricesService.profileListGridSelectedResultRow.PRFL_NM : this.profileName;
            //this.requestFromRadioButtonClick = 0;

            this.profileId = this.approvePricesService.profileListGridSelectedResultRow.PRFL_ID;
            this.profileName = this.approvePricesService.profileListGridSelectedResultRow.PRFL_NM;

        }

        if (this.profileId == 0) {
            return Observable.of({ data: [], totalRecords: 0 });
        }

        let url = 'sdalhPKG_UI_MEDICAID_APPROVE_PRICES.P_D_MEDICARE_PRICE_APPROVAL_S/json?i_in_prfl_id=' + this.profileId + '&i_pageNumber=' + params.pageNo +
            '&i_pageSize=' + params.pageSize + '&i_sortingColumn=' + params.i_colName + '&i_orderBy=' + params.i_orderType;

        return this.appService.get(url)
            .map(res => {

                if (res.OutputParameters.O_TOTALRECORDS > 0) {

                    return { data: this.formatProductGridData(res.ResultSets[0]), totalRecords: res.OutputParameters.O_TOTALRECORDS };
                }
                else if (this.profileId !== 0 && res.OutputParameters.O_TOTALRECORDS < 1) {
                    this.appService.messageDialog("Health Care Regulatory System", "The profile " + this.profileName + " does not have any products with prices linked to it. The profile should be in 'Ready' or 'Approved' status and have at least one product with a calculated price linked to it.");
                    return { data: this.formatProductGridData(res.ResultSets[0]), totalRecords: res.OutputParameters.O_TOTALRECORDS };
                }
                else {
                    return { data: [], totalRecords: 0 };
                }
            })
            .do(res => {

                if (res.data.length > 0) {
                    this.productFamilyGridData = res.data;
                    this.approvePricesService.productFamilyPricesGridSelectedResultRow = res.data[0];
                    this.approvePricesService.medicaidPriceApprovalRows = [];
                    this.approvePricesService.medicaidPriceApprovalRows.push(res.data[0]);
                    this.approvePricesService.productFamilyPricesGridSelectedResultRow.selected = true;

                    if (this.approvePricesFormOptions['category'] === 1) {

                        this.approvePricesFormOptions["disableApproveASP"] = true;
                        this.approvePricesFormOptions["disableUnapproveASP"] = true;
                        this.approvePricesFormOptions["disableSave"] = true;


                        if (res.data[0].APPRVD_IND === 'Y') {
                            this.approvePricesFormOptions["disableUnapproveASP"] = false;
                        }
                        else {
                            if (res.data[0].ALLOW_APPR_IND === 'Y') {
                                this.approvePricesFormOptions["disableApproveASP"] = false;
                            }
                            else if (res.data[0].ALLOW_APPR_IND === 'W') {
                                this.approvePricesFormOptions["disableApproveASP"] = false;
                            }
                            else {
                                this.approvePricesFormOptions["disableApproveASP"] = true;
                            }
                        }

                        this.approvePricesService.productFamilyPricesGridSelectedResultRow = this.approvePricesService.productFamilyPricesGridSelectedResultRowBeforeRefresh ? res.data[this.approvePricesService.productFamilyPricesGridLastClickedResult] : res.data[0];
                        this.approvePricesService.productFamilyPricesGridSelectedResultRowBeforeRefresh = false;
                        this.approvePricesService.productFamilyPricesGridSelectedResultRows.push(this.approvePricesService.productFamilyPricesGridSelectedResultRow);
                    }
                    else {
                        this.approvePricesFormOptions["disableApproveASP"] = true;
                        this.approvePricesFormOptions["disableUnapproveASP"] = true;
                        this.approvePricesFormOptions["disableSave"] = true;

                    }
                }
                else {
                    this.approvePricesFormOptions["disableApproveASP"] = true;
                    this.approvePricesFormOptions["disableUnapproveASP"] = true;
                    this.approvePricesFormOptions["disableSave"] = true;

                }
            });

    }



    private async saveProductFamilyGridData(grid) {
        let error: any = null;
        let errorCode: string = '';
        let errorText: string = '';

        var commitUrl = "sdalhPKG_UI_COMMON.P_COMMIT/json";

        for (let i = 0; i < this.approvePricesService.ModifiedApprovalRows.length; i++) {
            let row = this.approvePricesService.ModifiedApprovalRows[i];
            let url = "sdalhPKG_UI_MEDICAID_APPROVE_PRICES.P_D_MEDICARE_PRICE_APPROVAL_U/json?i_prfl_prod_calc_t_prfl_id=" + row.PRFL_ID + "&i_ndc_lbl=" + row.NDC_LBL + "&i_ndc_prod=" + row.NDC_PROD + "&i_ndc_pckg=" + row.NDC_PCKG + "&i_prfl_prod_calc_t_calc_typ_cd=" + row.CALC_TYP_CD + "&i_prfl_prod_calc_t_comp_typ_cd=" + row.COMP_TYP_CD + "&i_apprvd_ind=" + row.APPRVD_IND;


            try {
                let result = await this.appService.get(url).subscribe();
            } catch (ex) {

                error = JSON.parse(ex);
                errorCode = error.ExceptionMessage.split(':')[0];
                errorText = error.ExceptionMessage.split(':')[3];

                this.appService.messageDialog("pfc_dwdberror", "Error updating product transmission table.~n~r~n~rError: " + errorText);

            }

        }

        if (this.isStatusChanged === true) {
            let profileUpdateUrl = "sdalhPKG_UI_MEDICAID_APPROVE_PRICES.p_d_hcrs_profiles_u/json?i_prfl_id=" + this.approvePricesService.profileListGridSelectedResultRow.PRFL_ID + "&i_prfl_stat_cd=" + this.approvePricesService.profileListGridSelectedResultRow.PRFL_STAT_CD;

            this.isStatusChanged = false;
            try {
                let profileStatus = await this.appService.get(profileUpdateUrl).subscribe();
            } catch (ex) {

                error = JSON.parse(ex);
                errorCode = error.ExceptionMessage.split(':')[0];
                errorText = error.ExceptionMessage.split(':')[3];

                this.appService.messageDialog("pfc_dwdberror", "Error updating product transmission table.~n~r~n~rError: " + errorText);

            }
        }
        //let commitStatus = await this.appService.get(commitUrl).subscribe();

        this.appService.messageDialog("Health Care Regulatory System", "Changes saved.", () => {
            let commitStatus = this.appService.get(commitUrl).subscribe();
            this.productFamilyPricesGridOptions.api.pager.refresh();
        });
        this.approvePricesService.ModifiedApprovalRows = [];
        this.appService.isSavedPending = false;
        //this.approvePricesService.medicaidPriceApprovalRows = [];
        this.approvePricesFormOptions["disableSave"] = true;

        this.approvePricesService.medicaidPriceApprovalRows.forEach(_ => _.selected = false);
        if (this.approvePricesService.medicaidPriceApprovalRows.length > 1) {
            this.approvePricesService.medicaidPriceApprovalRows.splice(1)
        }

        this.approvePricesService.medicaidPriceApprovalRows[0].selected = true;
        //this.profileListGridOptions.api.pager.refresh();

    }

    private determineProfileStatus() {
        if (this.approvePricesService.profileListGridSelectedResultRow !== null) {
            let processTypeCd = this.approvePricesService.profileListGridSelectedResultRow.PRCSS_TYP_CD;
            let origPrflStat = this.approvePricesService.profileListGridSelectedResultRow.PRFL_STAT_CD;
            let newPrflStat: string;
            for (var row of this.productFamilyGridData) {

                if (processTypeCd === 'MED_MTHLY') {
                    if (row.AMP_APPRVD_IND === 'N' || row.AMP_APPRVD_IND === null) {
                        newPrflStat = "READY";
                        break;
                    }

                }
                else if (processTypeCd === 'MED_QTRLY' || processTypeCd === 'MED_CORRCTV') {
                    if (row.AMP_APPRVD_IND === 'N' || row.BP_APPRVD_IND === 'N' || row.AMP_APPRVD_IND === null || row.BP_APPRVD_IND === null) {
                        newPrflStat = "READY";
                        break;
                    }

                }
                else if (processTypeCd === 'VA_QTRLY') {
                    if (row.NFAMP_APPRVD_IND === 'N' || row.NFAMP_APPRVD_IND === null) {
                        newPrflStat = "READY";
                        break;
                    }

                }
                else if (processTypeCd === 'VA_ANNL' || processTypeCd === 'VA_30DAY' || processTypeCd === 'VA_FIRSTFULL') {
                    if (row.NFAMP_APPRVD_IND === 'N' || row.FCP_APPRVD_IND === 'N' || row.NFAMP_APPRVD_IND === null || row.FCP_APPRVD_IND === null) {
                        newPrflStat = "READY";
                        break;
                    }

                }
                else if (processTypeCd === 'MEDICARE_QTRLY') {
                    if (row.APPRVD_IND === 'N' || row.APPRVD_IND === null) {
                        newPrflStat = "READY";
                        break;
                    }

                }


            }

            if (newPrflStat !== "READY") {
                newPrflStat = "APPROVED"
            }
            if (newPrflStat !== null && newPrflStat !== origPrflStat) {
                this.isStatusChanged = true;
                this.approvePricesService.profileListGridSelectedResultRow.PRFL_STAT_CD = newPrflStat;
            }

        }
    }
}
