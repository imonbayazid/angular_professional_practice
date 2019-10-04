import {Component, OnInit, ViewEncapsulation, Output, EventEmitter,Input } from '@angular/core';
import {juForm, FormElement, FormOptions} from '../../shared/juForm/juForm';
import {SelectOptions} from '../../shared/juForm/juSelect';
import { FV}          from '../../shared/juForm/FV';
import {juGrid, GridOptions } from '../../shared/juGrid/juGrid';
import {AppService} from '../../shared/app.service';
import {ManualAdjustmentService} from './ManualAdjustment.service';
import {Observable, Subscription} from 'rxjs/Rx';
declare var moment: any;

@Component({
    moduleId: module.id,
    selector: 'manual-adjustment-main-grid',
    template: '<div class="juGrid"  panelMode="primary" title="Adjustments" [options]="adjustmentGridOptions"></div>',
    styles: [`


            `],
    encapsulation: ViewEncapsulation.None
})



export class MainGridComponent {

    private adjustmentGridOptions: GridOptions;

    private criteriaFromModel: any;
    protected subscriptionList: Subscription[] = [];
    //@Input() ref: any = {};
    //@Output() onload = new EventEmitter();
    constructor(private appService: AppService,private service: ManualAdjustmentService) {
        this.initAdjustmentGrid();
        this.service.mainGridComponentRef = this;
    }

    ngOnInit() {
        
        this.subscriptionList.push(this.service.searchHandler.subscribe(res => {
            this.criteriaFromModel = res;
            if (this.criteriaFromModel.product === "0")
                this.adjustmentGridOptions.api.pager.refresh();
            else if (this.criteriaFromModel.product.length > 3)
                this.adjustmentGridOptions.api.pager.refresh();
            else {
                this.emptyTheGrid();
                this.service.manualAdjustmentComponentRef.disableAddReverseBtn(true);
            }

        }));
        
       // this.ref.mainGrid = this;
       // this.onload.emit(this);
    }
    emptyTheGrid()
    {
        this.adjustmentGridOptions.api.pager.empty();
    }

    ngOnDestroy() {        
        this.subscriptionList.forEach(_ => _.unsubscribe());
    }
    public mainGridRefresh()
    {
        this.adjustmentGridOptions.api.pager.refresh();
    }

    private initAdjustmentGrid() {
        this.adjustmentGridOptions = {
            pageSize: 10, linkPages: 10, crud: false, quickSearch: false, enableCellEditing: true,
            rowEvents: '(dblclick)="config.dblClick(row, i)" (click)="config.rowClickEvent(row,i)"',
            sspFn: this.loadManualAdjustmentsGridData.bind(this),
            colResize: true, scroll: true, pagerPos: 'header',
            classNames: 'table table-bordered', headerHeight: 45, rowHeight: 26,
            enablePageSearch: false,
            enablePowerPage: true,
            title: 'Adjustments:',            
            trClass: row => {
                var isArcv = row.ARCHIVE_IND === "Y";
                if (row == this.service.selectedRowValue) isArcv = false;
                var rowStyle: any = { isSelectedCSSClass: row.isSelected, isArchivedCSSClass: isArcv };
                return rowStyle;
            },
            columnDefs: [
                { headerName: 'Status', field: 'ARCHIVE_IND', sort: true, cellRenderer: row => row.ARCHIVE_IND === "Y" ? '<div class="cell">' + "Archived" + "</div>" : '<div class="cell">' + "Active" + "</div>" },
                { headerName: 'Create Date', cellRenderer: row => row.CREATE_DT && row.CREATE_DT.length > 10 ? '<div class="cell">' + moment(row.CREATE_DT).format('MM/DD/YYYY') + "</div>" : '<div class="cell">' + " " + "</div>", width: 200, field: 'CREATE_DT', sort: true },
                { headerName: 'NDC', field: 'NDC', width: 120, sort: true },// cellRenderer: row => row.NDC_LBL + "-" + row.NDC_PROD + "-" + row.NDC_PCKG,
                { headerName: 'Transaction Class Description', field: 'TRANS_CLS_DESCR', sort: true },
                { headerName: 'Transaction Type Code', field: 'TRANS_TYP_CD', sort: true },
                { headerName: 'Trans Type Description', width: 300, field: 'TRANS_TYP_DESCR', sort: true },
                { headerName: 'Customer Id', field: 'CUST_ID', sort: true },
                { headerName: 'Customer Source Id', field: 'CUST_SOURCE_ID', sort: true },
                { headerName: 'Customer Name', width: 180, field: 'CUST_NM', sort: true },
                { headerName: 'Customer  State', field: 'CUST_STATE_CD', sort: true },
                { headerName: 'Customer Class Of Trade Code', field: 'CUST_CLS_OF_TRD_CD', sort: true },
                { headerName: 'Customer Class Of Trade Description', width: 280, field: 'CUST_CLS_OF_TRD_DESCR', sort: true },
                { headerName: 'Wholesale Id', field: 'WHLS_ID', sort: true },
                { headerName: 'Wholesale Source Id', field: 'WHLS_SOURCE_ID', sort: true },
                { headerName: 'Wholesale Name', width: 150, field: 'WHLS_NM', sort: true },
                { headerName: 'Wholesale State', field: 'WHLS_STATE_CD', sort: true },
                { headerName: 'Wholesale Class Of Trade Code', field: 'WHLS_CLS_OF_TRD_CD', sort: true },
                { headerName: 'Wholesale Class Of Trade Description', width: 200, field: 'WHLS_CLS_OF_TRD_DESCR', sort: true },
                { headerName: 'Invoice Date', width: 200, cellRenderer: row => row.INVC_DT_DISP && row.INVC_DT_DISP.length > 10 ? '<div class="cell">' + moment(row.INVC_DT_DISP).format('MM/DD/YYYY') + "</div>" : '<div class="cell">' + " " + '</div>', field: 'INVC_DT_DISP', sort: true },
                { headerName: 'Claim Begin Date', width: 200, cellRenderer: row => row.CLAIM_BGN_DT_DISP && row.CLAIM_BGN_DT_DISP.length > 10 ? '<div class="cell">' + moment(row.CLAIM_BGN_DT_DISP).format('MM/DD/YYYY') + "</div>" : '<div class="cell">' + " " + "</div>", field: 'CLAIM_BGN_DT_DISP', sort: true },
                { headerName: 'Claim End Date', width: 200, field: 'CLAIM_END_DT_DISP', cellRenderer: row => row.CLAIM_END_DT_DISP && row.CLAIM_END_DT_DISP.length > 10 ? '<div class="cell">' + moment(row.CLAIM_END_DT_DISP).format('MM/DD/YYYY') + "</div>" : '<div class="cell">' + " " + "</div>", sort: true },
                { headerName: 'Paid Date', field: 'PAID_DT_DISP', cellRenderer: row => row.PAID_DT_DISP && row.PAID_DT_DISP.length > 10 ? '<div class="cell">' + moment(row.PAID_DT_DISP).format('MM/DD/YYYY') + "</div>" : '<div class="cell">' + " " + "</div>", width: 200, sort: true },
                { headerName: 'Earn Begin Date', width: 200, field: 'EARN_BGN_DT', cellRenderer: row => row.EARN_BGN_DT && row.EARN_BGN_DT.length > 10 ? '<div class="cell">' + moment(row.EARN_BGN_DT).format('MM/DD/YYYY') + "</div>" : '<div class="cell">' + " " + "</div>", sort: true },
                { headerName: 'Earn End Date', width: 200, field: 'EARN_END_DT', cellRenderer: row => row.EARN_END_DT && row.EARN_END_DT.length > 10 ? '<div class="cell">' + moment(row.EARN_END_DT).format('MM/DD/YYYY') + "</div>" : '<div class="cell">' + " " + "</div>", sort: true },
                { headerName: 'Contract Id', field: 'CONTR_ID', sort: true },
                { headerName: 'Price Group Id', field: 'PRICE_GRP_ID', sort: true },
                { headerName: 'WAC Price', field: 'WAC_PRICE', sort: true },
                { headerName: 'Package Price', field: 'PKG_PRICE', sort: true },
                { headerName: 'Package Quantity', field: 'PKG_QTY', sort: true },
                { headerName: 'Claim Unit Quantity', field: 'CLAIM_UNIT_QTY', sort: true },
                { headerName: 'Total Amt', field: 'TOTAL_AMT', sort: true },
                { headerName: 'Term Discount %', field: 'TERM_DISC_PCT', sort: true },
                { headerName: 'Wholesale Chargeback Amt', field: 'WHLS_CHRGBCK_AMT', sort: true },
                { headerName: 'Gross Sales Amount', field: 'GROSS_SALE_AMT', sort: true },
                { headerName: 'Actual Potency', field: 'ACTUAL_POTENCY', sort: true },
                { headerName: 'Comments', width: 450, field: 'CMT_TXT', sort: true },
                { headerName: 'Modified Date', width: 200, field: 'MOD_DT', cellRenderer: row => row.MOD_DT && row.MOD_DT.length > 10 ? '<div class="cell">' + moment(row.MOD_DT).format('MM/DD/YYYY') + "</div>" : '<div class="cell">' + " " + "</div>", sort: true },
                { headerName: 'Modified By', width: 150, field: 'MOD_BY_USER_NM', sort: true },
                { headerName: 'Trans Id', field: 'TRANS_ID', sort: true }
            ],
            dblClick: (row, i) => {
                this.service.reverseSelectedRowIndex = i;
                this.mainGridRowClick(row); // need to check
                this.service.isGridRowSelected = true;
                this.service.editOrdetailsComponentRef.detailsButtonAction();                
            },
            rowClickEvent: (row, i) => {
                this.service.reverseSelectedRowIndex = i;
                this.service.manualAdjustmentComponentRef.rowNumber = i+1;
                this.mainGridRowClick(row);
            },

        }
    }

    private mainGridRowClick(row: any) {
       this.service.isGridRowSelected = true;
        row.isSelected = true;
        this.adjustmentGridOptions.api.grid.getData().forEach(r => r.isSelected = r === row);
        this.service.editOrdetailsComponentRef.detailsFormOptions['showFieldForDirect'] = row.TRANS_CLS_DESCR == "Directs";
        this.service.editOrdetailsComponentRef.detailsFormOptions['showFieldForInDirect'] = row.TRANS_CLS_DESCR == "Indirects";
        this.service.editOrdetailsComponentRef.detailsFormOptions['showFieldForRebatesOrFees'] = row.TRANS_CLS_DESCR == "Rebates/Fees";
        this.service.selectedRowValue = row; 
    }

    private loadManualAdjustmentsGridData(params: any) {       
       
        let model = this.criteriaFromModel;

        if (!model) {
            //this.service.manualAdjustmentComponentRef.enableDisableReverseAndDetailsButton(true);
            this.service.manualAdjustmentComponentRef.totalData = 0;
            return Observable.of({ totalRecords: 0, data: [] });
        }

        var url = this.getMainGridDataUrl(params, model);

        return this.appService.get(url)
            .map(res => {
                this.service.manualAdjustmentComponentRef.addBtnDisable = false;
                this.service.selectedGridPageNumber = params['pageNo'];
                this.service.manualAdjustmentComponentRef.totalData = params['pageSize'];               
                if ((parseInt(res.OutputParameters.O_TOTALRECORDS)) > 0) {
                    this.service.manualAdjustmentComponentRef.rowNumber = 1;
                    if (this.service.isFromReverse == true) {
                        this.service.isFromReverse = false;
                        this.mainGridRowClick((res.ResultSets[0])[this.service.reverseSelectedRowIndex]);                        
                    }
                    else {
                        this.mainGridRowClick((res.ResultSets[0])[0]);
                    }
                    this.service.manualAdjustmentComponentRef.reverseBtnDisable = false;
                    this.service.manualAdjustmentComponentRef.totalData = res.ResultSets[0].length;

                    return {
                        data: res.ResultSets[0],
                        totalRecords: res.OutputParameters.O_TOTALRECORDS
                    };
                }
                else {
                    this.service.manualAdjustmentComponentRef.rowNumber = 0;
                    this.service.manualAdjustmentComponentRef.totalData = 0;
                    this.service.manualAdjustmentComponentRef.reverseBtnDisable = true;
                    return {
                        data: [],
                        totalRecords: 0
                    };
                }

            });
    }

   

    private getMainGridDataUrl(params, model) {
        let url = "";
            var sortBy = "CREATE_DT";
            var orderBy = "ASC";

            var sortingText = params.sort;
            if (sortingText) {
                var sortingTextValues = sortingText.split('|');
                sortBy = sortingTextValues[0];
                orderBy = sortingTextValues[1];
            }

            if (model.product == "0" && model.labeler==="All") // for all product
            {
                url = "sdalhPKG_UI_MEDICAID_MADJUSTMENT.P_GRID_DATA_BY_COMPANY/json?i_man_adj_agency_cd="+this.service.is_agency_type +
                    "&i_co_id=" + model.company + "&i_ndc_lbl=" + model.labeler+ "&i_pageNumber=" + params.pageNo + "&i_pageSize=" + params.pageSize +
                    "&i_sortingColumn=" + sortBy + "&i_orderBy=" + orderBy;
            }
            else if (model.product == "0" && model.labeler != 'All') // for all product with specific labeler
            {
                url = "sdalhPKG_UI_MEDICAID_MADJUSTMENT.P_GRID_DATA_BY_LABELER/json?i_agency_typ_cd=" + this.service.is_agency_type + "&i_companyID="
                    + model.company + "&i_ndcLbl=" + model.labeler  
                    +"&i_pageNumber=" + params.pageNo + "&i_pageSize=" + params.pageSize + "&i_sortingColumn=" +
                    sortBy + "&i_orderBy=" + orderBy;
            }
            else {// for specific labeler and specific product
                model.i_ndcLbl = model.product.toString().substring(0, 5) || '';
                model.i_ndcProd = model.product.toString().substring(5, 9) || '';
                model.i_ndcPckg = model.product.toString().substring(9, 11) || '';

                url = "sdalhPKG_UI_MEDICAID_MADJUSTMENT.P_GRID_DATA_BY_PRODUCT/json?i_agency_typ_cd="+this.service.is_agency_type +"&i_companyID="
                    + model.company + "&i_ndcLbl=" + model.i_ndcLbl + "&i_ndcProd=" + model.i_ndcProd + "&i_ndcPckg=" +
                    model.i_ndcPckg + "&i_pageNumber=" + params.pageNo + "&i_pageSize=" + params.pageSize + "&i_sortingColumn=" +
                    sortBy + "&i_orderBy=" + orderBy;
            }

        return url;
    }

}