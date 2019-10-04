
import {Injectable}   from '@angular/core';
import {AppService}   from '../../shared/app.service';
import {Http}         from '@angular/http';
import {CONSTANTS} from '../../shared/constant';
import {Subject} from 'rxjs/Rx';

@Injectable()
export class ManualAdjustmentService  {
    
    constructor(public appService: AppService) {
        
    }
    public isUpdateable: any;

    public searchHandler = new Subject();

    public selectedCustomerId: any;
    public selectedContractId: any;
    public selectedWholesaleId: any;

    public isFromAddButton: any;
    public isPermissionYes: any;

    public closeAddForm: any = false;

    
    public isGridRowSelected: any;
    public isFromReverse: any;
    public isFromAddOkBtn: any;
    public reverseSelectedRowIndex: any = 0;
    public productList: any;
   
    public dropdownCompany_dataList: any;    
    public dropdownTRANSACTIONCLS_dataList: any;
    public dropdownNDCLABELER_dataList: any;
    public dropdownNDCPRODUCT_dataList: any;
    public dropdownNDCPACKAGE_dataList: any;
    public dropdownARCHIVE_IND_dataList: any;
    public dropdownTRANSTYPE_dataList: any;
    public selectedDropdownNDCLABELERvalue: any;
   // public companyProductDropdownData: any =[];
    public selectedRowValue: any;
    public selectedGridPageNumber: any;
    public selectedCompany: any=null;
    public selectedNDClbl: any=null;
    public selectedNDCprod: any=null;
    public selectedNDCpckg: any=null;

    public fromImport: any;
    public fileName: string = '';
    public selectedImportGridData: string = '';
    private isSaved: any;

    public manualAdjustmentComponentRef: any;
    public searchComponentRef: any;
    public mainGridComponentRef: any;
    public editOrdetailsComponentRef: any;
    public reverseComponentRef: any;
    public customerIDComponentRef: any;
    public contractIDComponentRef: any;
    public wholesaleIDComponentRef: any;
    public importComponentRef: any;


    public is_agency_type: any = "MEDICAID";

    public async of_DeletePrices(selectedRow: any)
    {

        let error: any = null;
        let errorCode: string = '';
        let errorText: string = '';
        let status: any = null;

        var ll_idx, ll_rowcount;
        var li_return = 0;
        var ls_null, ls_ndc_current, ls_ndc_previous;
        var ldt_datetime;
        var lds_selected;// contain adjustment dataset (rows of adjustments)

        lds_selected = selectedRow;

        if (this.is_agency_type == CONSTANTS.MED_AGENCY_TYPE)
        {
            ls_null = null;

            for (var i = 0; i < 1; i++)
            {
                ls_ndc_current = lds_selected['NDC_LBL'] + lds_selected['NDC_PROD'];

                if (ls_ndc_current != ls_ndc_previous)
                {
                    //check earn_bgn_dt
                    if (lds_selected['EARN_BGN_DT']) {
                        try {
                            var url = `sdalhpkg_fe_pricing.f_delete_prices/json?i_ndc_lbl=${lds_selected['NDC_LBL']}&i_ndc_prod=${lds_selected['NDC_PROD']}&i_ndc_pckg=${ls_null}&i_date=${lds_selected['EARN_BGN_DT']}&i_agency_typ_cd=${this.is_agency_type}`;
                            //console.log(url);
                            li_return = await this.appService.getWithErrorMessage(url).toPromise();
                        } catch (ex) {
                           // error = JSON.parse(ex._body);
                            //errorCode = error.ExceptionMessage.split(':')[0];
                            //errorText = error.ExceptionMessage.split(':')[3];
                            this.appService.messageDialogByMessageId(CONSTANTS.DEL_PRICES_MAN_ADJ_ERROR, [ex.errorDbCode, ex.errorDbText]);
                            return -1;
                        }
                    }

                    //check earn_bgn_dt
                    if (lds_selected['EARN_END_DT']) {
                        try {
                            li_return = await this.appService.getWithErrorMessage(`sdalhpkg_fe_pricing.f_delete_prices/json?` +
                                `i_ndc_lbl=${lds_selected['NDC_LBL']}&i_ndc_prod=${lds_selected['NDC_PROD']}&`+
                            `i_ndc_pckg=${ls_null}&i_date=${lds_selected['EARN_END_DT']}&i_agency_typ_cd=${this.is_agency_type}`).toPromise();
                        } catch (ex) {
                           // error = JSON.parse(ex._body);
                            //errorCode = error.ExceptionMessage.split(':')[0];
                            //errorText = error.ExceptionMessage.split(':')[3];
                            this.appService.messageDialogByMessageId(CONSTANTS.DEL_PRICES_MAN_ADJ_ERROR, [ex.errorDbCode, ex.errorDbText]);
                            return -1;
                        }
                    }

                    //check paid_dt
                    if (lds_selected['PAID_DT']) {
                        try {
                            li_return = await this.appService.getWithErrorMessage(`sdalhpkg_fe_pricing.f_delete_prices/json?` +
                               ` i_ndc_lbl=${lds_selected['NDC_LBL']}&i_ndc_prod=${lds_selected['NDC_PROD']}&`+
                            `i_ndc_pckg=${ls_null}&i_date=${lds_selected['PAID_DT']}&i_agency_typ_cd=${this.is_agency_type}`).toPromise();
                        } catch (ex) {
                            //error = JSON.parse(ex._body);
                            //errorCode = error.ExceptionMessage.split(':')[0];
                            //errorText = error.ExceptionMessage.split(':')[3];
                            this.appService.messageDialogByMessageId(CONSTANTS.DEL_PRICES_MAN_ADJ_ERROR, [ex.errorDbCode, ex.errorDbText]);
                            return -1;
                        }
                    }

                    ls_ndc_previous = ls_ndc_current;
                }
            }            

        } // end of MED_AGENCY_TYPE

        else
        {////Perform for VA/Medicare
            for (var i = 0; i < 1; i++)
            {
                    //check earn_bgn_dt
                if (lds_selected['EARN_BGN_DT']) {
                    try {
                        li_return = await this.appService.getWithErrorMessage(`sdalhpkg_fe_pricing.f_delete_prices/json?` +
                               `i_ndc_lbl=${lds_selected['NDC_LBL']}&i_ndc_prod=${lds_selected['NDC_PROD']}&`+
                            `i_ndc_pckg=${lds_selected['NDC_PCKG']}&i_date=${lds_selected['EARN_BGN_DT']}&i_agency_typ_cd=${this.is_agency_type}`).toPromise();
                        } catch (ex) {
                            //error = JSON.parse(ex._body);
                           // errorCode = error.ExceptionMessage.split(':')[0];
                           // errorText = error.ExceptionMessage.split(':')[3];
                        this.appService.messageDialogByMessageId(CONSTANTS.DEL_PRICES_MAN_ADJ_ERROR, [ex.errorDbCode, ex.errorDbText]);
                            return -1;
                        }
                    }

                    //check earn_bgn_dt
                if (lds_selected['EARN_END_DT']) {
                    try {
                        li_return = await this.appService.getWithErrorMessage(`sdalhpkg_fe_pricing.f_delete_prices/json?` +
                                `i_ndc_lbl=${lds_selected['NDC_LBL']}&i_ndc_prod=${lds_selected['NDC_PROD']}&`+
                            `i_ndc_pckg=${lds_selected['NDC_PCKG']}&i_date=${lds_selected['earn_end_dt']}&i_agency_typ_cd=${this.is_agency_type}`).toPromise();
                        } catch (ex) {
                            //error = JSON.parse(ex._body);
                           // errorCode = error.ExceptionMessage.split(':')[0];
                           // errorText = error.ExceptionMessage.split(':')[3];
                        this.appService.messageDialogByMessageId(CONSTANTS.DEL_PRICES_MAN_ADJ_ERROR, [ex.errorDbCode, ex.errorDbText]);
                            return -1;
                        }
                    }

                    //check paid_dt
                if (lds_selected['PAID_DT']) {
                    try {
                        li_return = await this.appService.getWithErrorMessage(`sdalhpkg_fe_pricing.f_delete_prices/json?` +
                                `i_ndc_lbl=${lds_selected['NDC_LBL']}&i_ndc_prod=${lds_selected['NDC_PROD']}&`+
                            `i_ndc_pckg=${lds_selected['NDC_PCKG']}&i_date=${lds_selected['PAID_DT']}&i_agency_typ_cd=${this.is_agency_type}`).toPromise();
                        } catch (ex) {
                           // error = JSON.parse(ex._body);
                           // errorCode = error.ExceptionMessage.split(':')[0];
                            //errorText = error.ExceptionMessage.split(':')[3];
                        this.appService.messageDialogByMessageId(CONSTANTS.DEL_PRICES_MAN_ADJ_ERROR, [ex.errorDbCode, ex.errorDbText]);
                            return -1;
                        }
                    }
            }

        } // end of VA/Medicare

        //console.log("of delete price li_return:" + li_return);
        return li_return;

    }

}