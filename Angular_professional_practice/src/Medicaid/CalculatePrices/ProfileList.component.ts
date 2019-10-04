import {Component, OnInit, ViewEncapsulation, Input} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {juForm, FormElement, FormOptions} from '../../shared/juForm/juForm';
import {juGrid, GridOptions } from '../../shared/juGrid/juGrid';
import {SelectOptions} from '../../shared/juForm/juSelect';
import { FV}          from '../../shared/juForm/FV';
import {CONSTANTS} from '../../shared/constant';
import {CalculatePricesService} from './CalculatePrices.service';
import { AppService } from '../../shared/app.service';

declare var jQuery: any;
declare var moment: any;


@Component({
    moduleId: module.id,
    selector: 'calculate-price-profile-list-form',
    template: `<div class="juForm" (onLoad)="loadProcessingTypeDropdownData()" [options]="profileListFormOptions"></div>`,
    encapsulation: ViewEncapsulation.None
})

export class ProfileListComponent {
    private profileListFormOptions: FormOptions = {};
    private pricingFormOptions: FormOptions;
    private profileListGridOptions: GridOptions = {};

    private ibFilter: boolean = false;
    private ibAMPRefile: boolean = false;
    private dropdpwnValues: any[] = [];
    private dynFilterSql: string = '';
    private filterBtnClicked: boolean = false;
    private refreshBtnClicked: boolean = false;
    private transmittedRadioBtnClicked: boolean = false;
    private dateFormat: string = 'MM/DD/YYYY';
    private datetimeFormat: string = 'MM/DD/YYYY HH:mm:ss';

    constructor(private appService: AppService, private route: ActivatedRoute, private service: CalculatePricesService) {
        this.service.profileListGridOptionsRef = this;
        this.initProfileListForm();
    }
    ngOnInit() {
        this.service.navigationName = this.route.snapshot.data['agencyType'];
    }

    private ListResultGridRefresh() {
        this.refreshBtnClicked = true;
        this.service.selectedListRowBeforeRefresh = true;
        this.service.selectedResultRowBeforeRefresh = true;
        this.service.listPageNumber = this.profileListGridOptions.api.pager.activePage;
        this.service.resultPageNumber = this.service.profileResultsGridOptionsRef.profileResultsGridOptions.api.pager.activePage;
        const lists: any[] = this.profileListGridOptions.api.grid.getData();
        let list: any[] = lists.filter(x => x.selected === true);
        //this.lastClickedList = (list[0].R__ % this.profileListGridOptions.api.pager.pageSize) - 1;
        this.service.lastClickedList = lists.indexOf(list[0]);
        const data: any[] = this.service.profileResultsGridOptionsRef.profileResultsGridOptions.api.grid.getData();
        let results: any[] = data.filter(x => x.selected === true);
        //this.lastClickedResult = (results[results.length - 1].R__) % this.profileResultsGridOptions.api.pager.pageSize;
        this.service.lastClickedResult = data.indexOf(results[results.length - 1]) + 1;
        if (this.service.lastClickedResult >= data.length) {
            this.service.lastClickedResult = data.length - 1;
        }
        this.profileListGridOptions.api.pager.firePageChange();
    }
    private loadProfileListGridData(params: any) {
        let colName = 'PRFL_ID';        // should be sort using PRFL_ID in DESC
        let sortOrder = 'DESC';
        let ls_err: any[] = [];
        params['i_agency_typ_cd'] = this.service.navigationName;
        params['i_profile_status'] = this.profileListFormOptions['pricing'];
        params['i_colName'] = params.sort == '' ? colName : params.sort.split('|')[0];
        params['i_orderType'] = params.sort == '' ? sortOrder : params.sort.split('|')[1];


        let url = this.service.pkgRootUrl + 'P_CALCPRICES_LISTGRID_S/json?i_agency_typ_cd=' + params.i_agency_typ_cd + '&i_profile_status=' + params.i_profile_status + '&i_pageNumber=' + params.pageNo +
            '&i_pageSize=' + params.pageSize + '&i_colName=' + params.i_colName + '&i_orderType=' + params.i_orderType + '&i_filterSql=' + this.dynFilterSql;


        return this.appService.get(url)
            .map(res => {
                return {
                    data: res.ResultSets[0].map(row => {
                        row.BEGN_DT = moment(row.BEGN_DT).format(this.dateFormat);
                        row.END_DT = moment(row.END_DT).format(this.dateFormat);
                        row.MOD_DT = moment(row.MOD_DT).format(this.datetimeFormat);
                        return row;
                    }),
                    totalRecords: res.OutputParameters.O_TOTALRECORDS
                };
            })
            .do(res => {
                if (res.data.length > 0) {
                    this.service.selectedListRow = this.service.selectedListRowBeforeRefresh ? res.data[this.service.lastClickedList] : res.data[0];
                    this.service.selectedListRowBeforeRefresh = false;
                    this.service.selectedListRow.selected = true;
                    this.ofSetupWindow();
                    this.service.profileListHandler.next(this.service.selectedListRow);
                    this.checkProfileStatus(this.service.selectedListRow);
                }
                if (this.filterBtnClicked && res.data.length == 0) {
                    this.filterBtnClicked = false;
                    this.appService.messageDialog('Attention', 'No matching profiles were found.');
                    //this.profileListFormOptions.api.setSelectValue('PROCESSING_TYPE', this.dropdpwnValues[0].value);
                    //this.dynFilterSql = '';
                    this.dynFilterSql = `AND v.PRFL_STAT_CD%3C%3E'${CONSTANTS.DELETE_STATUS}' `; // url encoding for "!=" = "%3C%3E"
                    this.profileListGridOptions.api.pager.refresh();
                }
                if (this.refreshBtnClicked && res.data.length == 0) {
                    this.refreshBtnClicked = false;
                    ls_err.push(`No profiles have been found for this agency (${this.service.navigationName})`);
                    this.appService.messageDialogByMessageId('pfc_systemerror', ls_err);
                    this.profileListGridOptions.api.pager.refresh();
                }
            });
    }

    private checkTransmitted() {
        (<any>this.service.pricingFormOptionsRef.pricingFormOptions).isTransmitted = this.profileListFormOptions['pricing'] === 'T';
    }

    private checkProfileStatus(row: any) {
        (<any>this.service.pricingFormOptionsRef.pricingFormOptions).profileStatus = row.PRFL_STAT_CD === 'Ready for Transmission';
    }

    private initProfileListForm() {
        this.profileListFormOptions = {
            viewMode: 'form',
            clickRadio: (value: any) => {
                this.transmittedRadioBtnClicked = true;
                this.profileListFormOptions['pricing'] = value;
                this.checkTransmitted();
                this.clearBtnFunc();
            },
            profileListGridOptions: this.getProfileListGridOptions(),
            clickFilterBtn: () => {
                this.ibFilter = true;
                this.filterBtnClicked = true;
                this.filterListGrid();
            },
            clickClearBtn: () => {
                this.ibFilter = false;
                this.clearBtnFunc();
            },
            pricing: 'NT',
            labelPos: 'left',
            inputs: [
                {
                    type: 'groupLayout',
                    items: [
                        {
                            //isContainer: true,
                            groupName: 'Profile List',
                            labelSize: 4,
                            size: 12,
                            inputs: [
                                [{
                                    type: 'html', content: `<label><input checked style="vertical-align: text-bottom; margin-right: 3px;" (click)="config.clickRadio('NT')" type="radio" name="pricing">Non-Transmitted</label>
                                                            <span style="width:20px;">&nbsp;</span>
                                                            <label><input style="vertical-align: text-bottom; margin-right: 3px;" (click)="config.clickRadio('T')" type="radio" name="pricing">Transmitted</label>`
                                }],
                                [
                                    { field: 'NAME', size: 2, label: 'Name', type: 'text' },
                                    { field: 'PERIOD', size: 2, label: 'Period', type: 'text' },
                                    { field: 'PROCESSING_TYPE', labelSize: 5, size: 3, label: 'Processing Type', type: 'juSelect', options: <SelectOptions>{ height: 350, width: '100%' }, },
                                    { field: 'PROFILE_ID', labelSize: 5, size: 2, label: 'Profile ID', type: 'text' },
                                    { type: 'html', content: `<button class="btn btn-primary" (click)="config.clickFilterBtn()">Filter</button> &nbsp; &nbsp;<button (click)="config.clickClearBtn()" class="btn btn-primary">Clear</button>` }
                                ],
                                { type: 'html', content: `<div class="juGrid" [options]="config.profileListGridOptions"></div>` }
                            ]
                        }
                    ],
                }
            ],
        }
    }

    private clearBtnFunc() {
        let model: any = this.profileListFormOptions.api.getModel();
        model.NAME = '', model.PERIOD = '', model.PROFILE_ID = '';
        this.profileListFormOptions.api.setSelectValue('PROCESSING_TYPE', this.dropdpwnValues[0].value);
        //this.dynFilterSql = '';
        this.dynFilterSql += `AND v.PRFL_STAT_CD%3C%3E'${CONSTANTS.DELETE_STATUS}' `; // url encoding for "!=" = "%3C%3E"
        this.profileListGridOptions.api.pager.refresh();
    }

    private filterListGrid() {
        let lsProfileName: string = '', lsTimPerCd: string = '', lsTimPerCd1: string = '', llProfileId: string = '', llPrcssType: string = '';
        this.dynFilterSql = '';
        this.dynFilterSql += `AND v.PRFL_STAT_CD%3C%3E'${CONSTANTS.DELETE_STATUS}' `; // url encoding for "!=" = "%3C%3E"
        if (this.ibFilter) {
            lsProfileName = jQuery.trim(this.profileListFormOptions.api.getModel()['NAME']).toLowerCase();
            lsTimPerCd = jQuery.trim(this.profileListFormOptions.api.getModel()['PERIOD']).toLowerCase();
            llProfileId = jQuery.trim(this.profileListFormOptions.api.getModel()['PROFILE_ID']);
            llPrcssType = this.profileListFormOptions.api.getModel()['PROCESSING_TYPE'];

            if (llProfileId.length > 0 && llProfileId) {
                let model: any = this.profileListFormOptions.api.getModel();
                model.NAME = '', model.PERIOD = '', model.PROCESSING_TYPE = this.dropdpwnValues[0].value;
                this.profileListFormOptions.api.setModel(model);

                this.dynFilterSql += `AND PRFL_ID='${llProfileId}'`;

            }
            else {
                if (llPrcssType !== 'All') this.dynFilterSql += `AND v.PRCSS_TYP_CD='${llPrcssType}'`;

                if (lsTimPerCd !== '' && lsTimPerCd !== null) {
                    if (lsTimPerCd.indexOf('/') > 0) {
                        lsTimPerCd1 = lsTimPerCd.split('/')[1] + lsTimPerCd.split('/')[0];
                    }
                    else if (lsTimPerCd === '30-day') {
                        lsTimPerCd1 = '30 day';
                    }
                    else if (lsTimPerCd === 'first full quarter' || lsTimPerCd === 'ffq'
                        || lsTimPerCd === 'first full' || lsTimPerCd === 'first quarter' || lsTimPerCd === 'first') {
                        lsTimPerCd1 = 'full qtr';
                    }
                    else if (lsTimPerCd.indexOf('-') > 0) {
                        let mon: number = +lsTimPerCd.split('-')[1];
                        if (mon <= 3)
                            lsTimPerCd1 = lsTimPerCd.split('-')[0] + 'q1m' + (mon > 9 ? '' + mon : '0' + mon);
                        else if (mon >= 4 && mon <= 6)
                            lsTimPerCd1 = lsTimPerCd.split('-')[0] + 'q2m' + (mon > 9 ? '' + mon : '0' + mon);
                        else if (mon >= 7 && mon <= 9)
                            lsTimPerCd1 = lsTimPerCd.split('-')[0] + 'q3m' + (mon > 9 ? '' + mon : '0' + mon);
                        else if (mon >= 10 && mon <= 12)
                            lsTimPerCd1 = lsTimPerCd.split('-')[0] + 'q4m' + (mon > 9 ? '' + mon : '0' + mon);
                    }
                    else {
                        lsTimPerCd1 = jQuery.trim(lsTimPerCd);
                    }
                    //this.dynFilterSql += `AND LOWER(v.TIM_PER_CD) LIKE ('${lsTimPerCd1}' || '%')`;
                    this.dynFilterSql += `AND LOWER(v.TIM_PER_CD) LIKE '%25${lsTimPerCd1}%25'`;
                }

                if (lsProfileName !== null && lsProfileName !== '') this.dynFilterSql += ` AND LOWER(PRFL_NM) LIKE '%25${lsProfileName}%25'`;

            }
            this.profileListGridOptions.api.pager.refresh();
        }
    }
    //of_setupWindow()
    private async ofSetupWindow() {
        this.service.mleNote = '';
        if (this.service.idsCalcTypes.length == 0) {
            return this.service.FAILURE;
        }
        if (this.service.selectedListRow === null) {
            return 0;
        }
        let lsPrcssCd: string = this.service.selectedListRow.PRCSS_TYP_CD;
        let lsPrflStat: string = this.service.selectedListRow.PRFL_STAT_CD;
        let filterData: any[] = this.service.idsCalcTypes.filter(x => x.PRCSS_TYP_CD === lsPrcssCd);

        if (filterData.length < 0) {
            this.appService.messageDialog(this.service.title, `Filter on ds failed. ls_filter = ${lsPrcssCd}`);
            return this.service.FAILURE;
        }
        if (filterData.length < 1) {
            this.appService.messageDialog(this.service.title, `No calculation types available for this agency ${this.service.navigationName} and processing type = ${lsPrcssCd}`);
            return this.service.FAILURE;
        }
        let llPrflId: number = +this.service.selectedListRow.PRFL_ID;
        let lsTem: string = filterData[0].DATA_WND;
        this.service.profileResultDataObj = lsTem; 
        this.service.annualResultVA = lsTem === 'd_va_annl_price_results';
        if (this.service.ib_del_discard) {
            this.dynFilterSql = `AND v.PRFL_STAT_CD%3C%3E'${CONSTANTS.DELETE_STATUS}' `; // url encoding for "!=" = "%3C%3E"
            this.profileListGridOptions.api.pager.refresh();
            this.service.ib_del_discard = false;
        }
        const month = this.service.navigationName === CONSTANTS.MED_AGENCY_TYPE && lsPrcssCd !== CONSTANTS.MED_MTHLY;
        (<any>this.service.pricingFormOptionsRef.pricingFormOptions).exceptOverrideVisibility = month;

        (<any>this.service.pricingFormOptionsRef.pricingFormOptions).rb1Text = filterData[0].BTN_TXT;
        (<any>this.service.pricingFormOptionsRef.pricingFormOptions).rb1Visibility = true;

        if (filterData.length > 1) {
            (<any>this.service.pricingFormOptionsRef.pricingFormOptions).rb2Text = filterData[1].BTN_TXT;
            (<any>this.service.pricingFormOptionsRef.pricingFormOptions).rb2Visibility = true;
            //(<any>this.service.pricingFormOptionsRef.pricingFormOptions).rb2Checked = true;

            if (filterData.length > 2) {
                (<any>this.service.pricingFormOptionsRef.pricingFormOptions).rb3Text = filterData[2].BTN_TXT;
                (<any>this.service.pricingFormOptionsRef.pricingFormOptions).rb3Visibility = true;
            }
            else {
                (<any>this.service.pricingFormOptionsRef.pricingFormOptions).rb3Visibility = false;
            }
        }
        else {
            (<any>this.service.pricingFormOptionsRef.pricingFormOptions).rb2Visibility = false;
            (<any>this.service.pricingFormOptionsRef.pricingFormOptions).rb3Visibility = false;
        }
        let lsNote: string = '';
        lsNote = await this.ofGetSalesExclusionNote();
        this.service.mleNote = lsNote;
        lsNote = await this.ofGetAmpRefileNote();
        this.service.mleNote += ' ' + lsNote;

        return this.service.SUCCESS;
    }

    //of_getsalesexclusionsnote
    private async ofGetSalesExclusionNote() {
        if (this.service.selectedListRow === null) return '';
        let lsPrflStatus: string = this.service.selectedListRow.PRFL_STAT_CD;
        let llUnapprvdCount: number, lsNote: string = '';
        if (lsPrflStatus !== CONSTANTS.TRANSMIT_STATUS) {
            let llPrflId: number = +this.service.selectedListRow.PRFL_ID;
            let url: string = `${this.service.pkgRootUrl}P_SALES_EXCLU_COUNT/json?i_prfl_id=${llPrflId}`;
            const result: any = await this.appService.get(url).toPromise();
            if (result.ResultSets[0].length > 0) {
                llUnapprvdCount = +result.ResultSets[0][0].SLS_EXCL_CNT;
                if (llUnapprvdCount > 0) {
                    lsNote = `This profile has ${llUnapprvdCount} unapproved sales exclusion(s).`;
                }
            }          
        }
        return lsNote;
    }

    //of_getAMPRefileNote
    private async ofGetAmpRefileNote() {
        let lsNote: string = '';
        if (this.service.selectedListRow === null) return '';
        let lsPrcssType: string = this.service.selectedListRow.PRCSS_TYP_CD;
        if (lsPrcssType != CONSTANTS.MED_CORRCTV_PROC_TYPE) return '';
        let llPrflId: number = this.service.selectedListRow.PRFL_ID;
        let url: string = `${this.service.pkgRootUrl}P_AGENCY_CALC_MTHD_S/json?i_as_agency_cd=${this.service.navigationName}&i_prfl_id=${llPrflId}`;
        const result: any = await this.appService.get(url).toPromise();
        if (result.ResultSets[0].length > 0) {
            const data: any[] = result.ResultSets[0];
            const filterData: any[] = data.filter(x => x.CALC_TYP_CD === CONSTANTS.AMP);
            if (filterData.length > 0) {
                let lsCalcMthd: string = filterData[0].CALC_MTHD_CD;
                if (lsCalcMthd === CONSTANTS.CALC_MTHD_REFILEVALS) {
                    lsNote = 'AMP is not calculated for this profile. The AMP amount equals the last transmitted AMP.';
                    this.ibAMPRefile = true;
                }
            }
        }
        return lsNote;
    }

    private loadProcessingTypeDropdownData() {
 
        this.dropdpwnValues.push({ value: 'All', text: 'All' });
        let url: string = `${this.service.pkgRootUrl}P_PRCSS_TYP_S/json?i_agency_typ_cd=${this.service.navigationName}`;
        this.appService.get(url)
            .subscribe(_ => {
                if (_.ResultSets[0].length > 0) {
                    this.dropdpwnValues.push(..._.ResultSets[0].map(_ => ({ value: _.PRCSS_TYP_CD, text: _.PRCSS_TYP_DESCR })));
                    this.profileListFormOptions.api.setData('PROCESSING_TYPE', this.dropdpwnValues);
                    this.profileListFormOptions.api.setSelectValue('PROCESSING_TYPE', this.dropdpwnValues[0].value);
                }
            });      
    }

    private getMedicaidDropdown(): any[] {
        return [
            { value: 'All', text: 'All' },
            { value: CONSTANTS.MED_CORRCTV_PROC_TYPE, text: 'Corrective' },
            { value: CONSTANTS.MED_QTRLY_PROC_TYPE, text: 'Quarterly' },
            { value: CONSTANTS.MED_MTHLY, text: 'Monthly' },
        ];
    }
    private getVADropdown(): any[] {
        return [
            { value: 'All', text: 'All' },
            { value: CONSTANTS.VA_THIRTY_PROC_TYPE, text: '30-day' },
            { value: CONSTANTS.VA_ANNL_PROC_TYPE, text: 'Annual' },
            { value: CONSTANTS.VA_FULL_PROC_TYPE, text: 'First Full Quarter' },
            { value: CONSTANTS.VA_QTRLY_PROC_TYPE, text: 'Quarterly' },
        ];
    }
    private getMedicareDropdown(): any[] {
        return [
            { value: 'All', text: 'All' },
            { value: CONSTANTS.MEDICARE_QTRLY_PROC_TYPE, text: 'Quarterly' },
        ];
    }


    private getProfileListGridOptions() {

        return this.profileListGridOptions = {
            pageSize: 10, quickSearch: false, viewMode: 'panel', pagerPos:'header',title:'&nbsp;',
            enablePageSearch: false, enablePowerPage: true,
            rowEvents: '(click)="config.rowClick(row,i)"',  
            sspFn: this.loadProfileListGridData.bind(this),
            colResize: true, scroll: true, height: 150,
            classNames: 'table table-bordered', headerHeight: 45, rowHeight: 26,
            trClass: row => ({ selected: row.selected }), 
            columnDefs: [
                { headerName: 'Name', width: 200, field: 'PRFL_NM', sort: true },
                { headerName: 'Status', field: 'PRFL_STAT_DESCR', sort: true },
                { headerName: 'Time Period', field: 'TIM_PER_DESCR', sort: true },
                { headerName: 'Start Date', field: `BEGN_DT`, sort: true, },
                { headerName: 'End Date', field: `END_DT`, sort: true, },
                { headerName: 'Processing Type', width: 150, field: 'PRCSS_TYP_DESCR', sort: true },
                { headerName: 'Prelim?', field: 'PRELIM_IND', exp: `<input style="text-align: center;width: 100%;" type="checkbox" [checked]="row.PRELIM_IND==='Y'" disabled name="prelim">` },
                { headerName: 'Modified Date', field: `MOD_DT`, sort: true, },
                { headerName: 'Last Modified By', width: 150, field: 'MOD_BY', sort: true },
                { headerName: 'Profile Id', field: 'PRFL_ID', sort: true },
                { headerName: 'Attachments', field: 'ATTACHMENT_REF_ID', exp: `<input style="text-align: center;width: 100%;" type="checkbox" [checked]="row.ATTACHMENT_REF_ID==='Y'" disabled name="attachments">` },
            ],
            rowClick: (row, i) => {
                if (this.service.selectedListRow) this.service.selectedListRow.selected = false;
                row.selected = true;
                this.service.selectedListRow = row;
                this.service.lastClickedList = i;
                this.ofSetupWindow();
                this.service.profileListHandler.next(row);
                this.checkProfileStatus(row);
                const month = row.PRCSS_TYP_DESCR === 'Monthly';
                (<any>this.service.pricingFormOptionsRef.pricingFormOptions).isMonthly = month
            },
        };
    }

}