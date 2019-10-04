import {CalculatePricesService} from './CalculatePrices.service';

declare var moment: any;

export class ColumnDefinition {
    public gridConfigs: { [obj: string]: {} };

    constructor(public service: CalculatePricesService) {
        this.setDefinitions();
    }

    public setDefinitions(): any {
        this.gridConfigs = {
            'd_medicaid_price_results': {
                url: this.service.pkgRootUrl + '',
                columDefs: [
                    { headerName: 'Calculation Status', field: 'CALC_STAT_DESCR', sort: true,width:180 },
                    { headerName: 'Product NDC', field: 'PROD_NDC', sort: true }, 
                    { headerName: 'Product Name', field: 'PROD_FMLY_NM', sort: true,width:220 },
                    { headerName: 'AMP Amount', field: 'AMP_AMT', sort: true, tdClass: row => ({ 'bp-greater-amp': row.isBpGreaterAmp = row.BP_GREATER_AMP_IND === 1 }) },
                    { headerName: 'BP Amount', field: 'BP_AMT', sort: true, tdClass: row => ({ 'bp-greater-amp': row.isBpGreaterAmp = row.BP_GREATER_AMP_IND === 1 }) },
                    { headerName: 'AMP Carry Forward', field: 'AMP_CARRY_FWD_IND', exp: `<input style="text-align: center;width: 100%;" type="checkbox" [checked]="row.AMP_CARRY_FWD_IND==='C'" disabled name="amp-carry-forward">` },
                    { headerName: 'BP Carry Forward', field: 'BP_CARRY_FWD_IND', exp: `<input style="text-align: center;width: 100%;" type="checkbox" [checked]="row.BP_CARRY_FWD_IND==='C'" disabled name="bp-carry-forward">` },
                    { headerName: 'Pricing Status', field: 'PRICE_STATUS_DESCR', sort: true },
                    { headerName: 'BP Equal to AMP', field: 'BP_EQUAL_AMP_IND', exp: `<input style="text-align: center;width: 100%;" type="checkbox" [checked]="row.BP_EQUAL_AMP_IND===1" disabled name="bp-equal-to-amp">` },
                    { headerName: 'Drug Catg', field: 'DRUG_CATG_CD', sort: true },
                    { headerName: 'Final Lot Date', field: `FINAL_LOT_DT`, sort: true, cellRenderer: row => row.FINAL_LOT_DT == null ? '00/00/0000' : moment(row.FINAL_LOT_DT).format('MM/DD/YYYY') },
                    { headerName: 'Termination Date', field: `TERM_DT`, sort: true, cellRenderer: row => row.TERM_DT == null ? '00/00/0000' : moment(row.TERM_DT).format('MM/DD/YYYY') },
                    { headerName: 'Liability Date', field: `LIABILITY_DT`, sort: true, cellRenderer: row => row.LIABILITY_DT == null ? '00/00/0000' :  moment(row.LIABILITY_DT).format('MM/DD/YYYY') },
                    { headerName: 'Divested Date', field: `DIVESTR_DT`, sort: true, cellRenderer: row => row.DIVESTR_DT == null ? '00/00/0000' : moment(row.DIVESTR_DT).format('MM/DD/YYYY') },
                    { headerName: 'System Message', field: 'USER_MSG_TXT', sort: true,width:200 },
                ]
            },
            'd_hcrs_medicare_price_results': {
                url: this.service.pkgRootUrl + 'P_MEDICARE_RESULTSGRID_S/json?',
                columDefs: [
                    { headerName: 'Calculation Status', field: 'CALC_STAT_DESCR', sort: true, width: 180 },
                    { headerName: 'Product NDC', field: 'PROD_NDC', sort: true },
                    { headerName: 'Product Name', field: 'PROD_NM', sort: true },
                    { headerName: 'ASP($)', field: 'CALC_AMT', sort: true },
                    { headerName: 'Medicare Eligible?', width: 140, field: 'MEDICARE_ELIG_STAT_CD', exp: `<input style="text-align: center;width: 100%;" type="checkbox" [checked]="row.MEDICARE_ELIG_STAT_CD==='EL'" disabled>` },
                    { headerName: 'Pricing Status', field: 'PRICE_STATUS_DESCR', sort: true },
                    { headerName: 'System Message', width: 200, field: 'USER_MSG_TXT', sort: true },
                ]
            },
            'd_va_new_product_price_results': {
                url: this.service.pkgRootUrl + 'P_VA_NEW_PROD_RESULTSGRID_S/json?',
                columDefs: [
                    { headerName: 'Calculation Status', field: 'CALC_STAT_DESCR', sort: true, width: 180 },
                    { headerName: 'Product NDC', field: 'PROD_NDC', sort: true },
                    { headerName: 'Product Name', field: 'PROD_NM', sort: true,width:220 },
                    { headerName: 'NonFAMP', field: 'NONFAMP', sort: true },
                    { headerName: 'FCP', field: 'FCP', sort: true },
                    { headerName: 'System Message', width: 200, field: 'USER_MSG_TXT', sort: true }
                ]
            },
            'd_va_annl_price_results': {
                url: this.service.pkgRootUrl + 'P_VA_ANNL_PRICE_RESULTSGRID_S/json?',
                columDefs: [
                    { headerName: 'Calculation Status', field: 'CALC_STAT_DESCR', sort: true, width: 180 },
                    { headerName: 'Product NDC', field: 'PROD_NDC', sort: true },
                    { headerName: 'Product Name', field: 'PROD_NM', sort: true, width: 220 },
                    { headerName: 'Ann. NFAMP', field: 'ANN_NONFAMP', sort: true },
                    { headerName: 'Ann. FCP', field: 'ANN_FCP', sort: true },
                    { headerName: 'Curr. 3Q NFAMP', width: 140, field: 'CURR_3Q_NONFAMP2', sort: true },
                    { headerName: 'Prev. 3Q NFAMP', width: 140, field: 'PREV_3Q_NONFAMP2', sort: true },
                    { headerName: 'System Message', width: 200, field: 'USER_MSG_TXT', sort: true },
                ]
            },
            'd_va_qtrly_price_results': {
                url: this.service.pkgRootUrl + 'P_VA_NEW_PROD_RESULTSGRID_S/json?',
                columDefs: [
                    { headerName: 'Calculation Status', field: 'CALC_STAT_DESCR', sort: true, width: 180 },
                    { headerName: 'Product NDC', field: 'PROD_NDC', sort: true },
                    { headerName: 'Product Name', field: 'PROD_NM', sort: true, width: 220 },
                    { headerName: 'NonFAMP', field: 'NONFAMP', sort: true },
                    { headerName: 'System Message', width: 200, field: 'USER_MSG_TXT', sort: true }
                ]
            },
        };
    }
    public getDefinitions() {
        return this.gridConfigs;
    }

}