import {Injectable  } from '@angular/core';
import {CONSTANTS} from '../../shared/constant';
import {juForm, FormElement, FormOptions} from '../../shared/juForm/juForm';
import {juGrid, GridOptions } from '../../shared/juGrid/juGrid';
import {SelectOptions} from '../../shared/juForm/juSelect';
import { FV }          from '../../shared/juForm/FV';
import {CalculatePricesService} from './CalculatePrices.service';
import { AppService } from '../../shared/app.service';

import {Observable}   from 'rxjs/Rx';

declare var moment: any;

@Injectable()
export class CalculateService {

    constructor(private appService: AppService, private service: CalculatePricesService) {

    }

    public async initCalculateFunctionalities() {
        if (await this.checkSystem() === this.service.FAILURE) {
            return;
        }
        let ls_msg : any[] = [];
        let profileList = this.service.selectedListRow;
        let profileResults: any[] = this.service.selectedResultRows, subscribe_count = 0;
        if (profileList && profileResults.length > 0) {
            let requestList: any[] = [];
            for (let i = 0; i < profileResults.length; i++) {
                if (await this.isAMPIsRefilevals()) {
                    let ampAmount = profileResults[i].AMP_AMT;
                    if (ampAmount === null) {
                        let ndcLabel = profileResults[i].NDC_LBL;
                        let ndcProduction = profileResults[i].NDC_PROD;
                        let begDate = moment(profileList.BEGN_DT).format('YYYY-MM-DD');
                        let endDate = moment(profileList.END_DT).format('YYYY-MM-DD');
                        let url = 'sdalhPKG_COMMON_FUNCTIONS.F_GET_PROD_COMP/json?i_start_dt=' + begDate + '&i_end_dt=' + endDate
                            + '&i_ndc_lbl=' + ndcLabel + '&i_ndc_prod=' + ndcProduction + '&i_ndc_pckg=null&i_calc_typ_cd=AMP&i_comp_typ_cd=AMP&i_prelim_ind=N&i_prcss_typ_cd=null&i_loose_dates=N&i_trans_flg=Y';

                        const result = await this.appService.get(url).toPromise();
                        const lastAMP = result.ReturnValue;
                        if (lastAMP === null) {
                            this.appService.messageDialog('', `Missing Transmitted AMP, This profile's AMP calculation method relies on existence of an already transmitted AMP. It does not calculate an new AMP.
				                               <br><br>Please move product ${ndcLabel} - ${ndcProduction} to a profile with a different calculation method and then calculate the AMP.`);
                            return;
                        }

                    }  // End of isNull(ampAmount)
                }  // End of isAMPIsRefilevals

                if (profileResults[i].CALC_STAT_CD === 'OVERRIDE') {       //"COMPLETE"       // should be  'OVERRIDE'
                    ls_msg.push(`One or more of the selected prices have been previously overridden.
                                                         <br> PRICING OVERRIDES WILL BE REMOVED!<br><br>`);
                    break;
                }
                else {
                    ls_msg.push('');
                }
            } // End of loop
        }   // End of if

        else {
            this.appService.messageDialog('', `Please Select a profile / Please select at least one row to calculate price(s).`);
        }
        this.doCalculation(ls_msg);
    }

    private async doCalculation(ls_msg: any[]) {
        //let msg: string;
        //let url = `sdalhPKG_UI_COMMON.P_GET_ERR_MSG/json?i_msg_id=CALCULATE_PRICES`;
        //let response: any = await this.appService.get(url).toPromise(); 
        //let data: any = response.ResultSets[0][0];
        //if (ls_msg.length > 0) {
        //    msg = ls_msg[0] + data.;
        //}

        if (await this.appService.confirmDialogByMessageId('CALCULATE_PRICES', ls_msg)) {
            const batchId = await this.getBatchId(this.service.navigationName, this.service.selectedListRow.PRCSS_TYP_CD);
            const profileId: string = this.service.selectedListRow.PRFL_ID;
            if (batchId > 0) {
                this.callProcessQueue('' + batchId);
            }
        }

    }

    private getBatchId(agency_cd: string, process_type: string) {
        let row: any[] = [];
        let batchId: number = 0;

        const data: any[] = this.service.idsCalcTypes;
        const filterData: any[] = data.filter(x => x.PRCSS_TYP_CD === process_type)

        if ((<any>this.service.pricingFormOptionsRef.pricingFormOptions).rb1Checked)
            batchId = +filterData[0].BATCH_ID;
        else if ((<any>this.service.pricingFormOptionsRef.pricingFormOptions).rb2Checked)
            batchId = +filterData[1].BATCH_ID;
        else if ((<any>this.service.pricingFormOptionsRef.pricingFormOptions).rb3Checked)
            batchId = +filterData[2].BATCH_ID;

        return batchId;
    }

    private async isAMPIsRefilevals() {
        let profileId = this.service.selectedListRow.PRFL_ID;
        let agency = this.service.navigationName;
        let calcTypeCd = CONSTANTS.AMP;

        let url = this.service.pkgRootUrl + 'P_CALCPRICES_AMPCALC_S/json?i_prfl_id=' + profileId + '&i_agency_typ_cd=' + agency + '&i_calc_typ_cd=' + calcTypeCd;

        const result: any = await this.appService.get(url)
            .map(res => ({ data: res.ResultSets[0] })).toPromise();

        if (result.data.length > 0) {
            if (result.data[0].CALC_MTHD_CD === 'REFILEVALS') {    //Should be  'REFILEVALS'
                return true;
            }
        }
        return false;
    }


    private async callProcessQueue(batch: string) {
        let profileResults: any[] = this.service.selectedResultRows;
        let profile = this.service.selectedListRow;
        let params: string = profile.PRFL_ID;
        let result: any = await this.insertProcessQueue(batch, params);
        if (result) {
            const submitted = 'SUBMITTED';
            const locked = 'LOCKED';
            for (let i = 0; i < profileResults.length; i++) {
                let row = profileResults[i];
                row.CALC_STAT_CD = submitted;
                let updateUrl = this.service.pkgRootUrl + 'P_CALCPRICES_PROFL_PROD_U/json?i_calc_stat_cd=' + submitted + '&i_prfl_id='
                    + profileResults[i].PRFL_ID + '&i_ndc_lbl=' + profileResults[i].NDC_LBL + '&i_ndc_prod=' + profileResults[i].NDC_PROD;
                //console.log('result: ', updateUrl);
                let rslt = await this.appService.get(updateUrl).toPromise();
            }
            profile.PRFL_STAT_CD = locked;
            let updtUrl = this.service.pkgRootUrl + 'P_CALCPRICES_PROFL_U/json?i_prfl_stat_cd=' + locked + '&i_prfl_id=' + profile.PRFL_ID;
            //console.log('profile: ', updtUrl);
            let result = await this.appService.get(updtUrl).toPromise();
            this.appService.messageDialog(this.service.Title, `Calculation Process Started. The Process batch id is ` + batch);
            const isValidate: number = await this.validate();
            let error: any = null;
            if (isValidate === this.service.SUCCESS) {
                await this.appService.get(`sdalhPKG_UI_COMMON.P_COMMIT/json`).toPromise();
            }
            else {
                await this.appService.get(`sdalhPKG_UI_COMMON.P_ROLLBACK/json`).toPromise();
            }
            this.service.profileListGridOptionsRef.ListResultGridRefresh();
        }
    }

    private async getAgencyPriceCalculationTypesInfo(agency_cd: any) {
        let url = this.service.pkgRootUrl + 'P_CALCPRICES_AGENCYCALCINFO_S/json?i_as_agency_cd=' + agency_cd;

        const result = await this.appService.get(url).toPromise();

        return result.ResultSets[0];
    }

    private async insertProcessQueue(batch_id: string, params: string) {
        let success = false;
        let url = 'sdalhPKG_UI_MEDICAID_CALC_PRICES.P_CALCPRICES_BATCH_ID_S/json?i_batch_id=' + batch_id;
        let queueIdUrl = this.service.pkgRootUrl + 'P_CALCPRICES_PRCSS_NXTVAL_S/json';
        let result: any = await this.appService.get(url).toPromise();
        if (result.ResultSets[0].length > 0) {
            result = result.ResultSets[0];
            let dbUser = await this.appService.get('api/User/GetDbUserName').toPromise();
            let queueId = await this.appService.get(queueIdUrl).toPromise();
            queueId = queueId.ResultSets[0];
            if (+queueId[0].NEXTVAL != 0) {
                let id = queueId[0].NEXTVAL;
                let currentDate = new Date().toLocaleDateString();
                let insertQueueUrl = this.service.pkgRootUrl + 'P_CALCPRICES_PRCSS_QUEUE_I/json?i_queue_id=' + id
                    + '&i_user_id=' + dbUser + '&i_exec_nm=' + result[0].EXEC_NM + '&i_dstn_prtr=null&i_exec_tm=' + currentDate
                    + '&i_prcss_stat=NEW&i_prcss_stat_dt=' + currentDate + '&i_load_flag=N&i_restart_cnt=' + result[0].RESTART_LIMIT + '&i_restart_step=1';
                //console.log(insertQueueUrl);
                let insertSts = await this.appService.get(insertQueueUrl).toPromise();
                if (insertSts.OutputParameters.O_RESULT) {
                    let i = 0;
                    if (params !== '') {
                        let iUrl = this.service.pkgRootUrl + 'P_CALCPRICES_PRCSS_PARAM_I/json?i_queue_id=' + id + '&i_seq_no=' + i + '&i_param_val=' + params;
                        let iStatus: any = await this.appService.get(iUrl).toPromise();
                    }
                    //console.log(iUrl);
                    if (insertSts.OutputParameters.O_RESULT) {
                        success = true;
                    }
                }
            }

        }
        return success;
    }

    private async checkSystem() {
        const profileRow = this.service.selectedListRow;
        let li_rc: any;
        let args: any = {};
        args.agency_cd = this.service.navigationName;
        args.prfl_id = profileRow.PRFL_ID;
        if (profileRow === null) {
            this.appService.showMessage('Please select a profile for which to calculate price(s).');
            return this.service.FAILURE;
        }
        const systemStatus: boolean = await this.appService.checkSystemEnabled(args.agency_cd);
        const templateStatus: boolean = await this.appService.checkTemplateUpdating(args);

        if (!systemStatus) {
            li_rc = this.service.FAILURE;
        }
        if (templateStatus) {
            li_rc = this.service.FAILURE;
        }
        else {
            li_rc = this.service.SUCCESS;
        }

        return li_rc;
    }

    private async validate() {
        const listRow = this.service.selectedListRow;
        const profileId: number = listRow.PRFL_ID;
        const prcssType = listRow.PRCSS_TYP_CD;
        const resultRows = this.service.selectedResultRows;
        if (await this.checkUnevaluatedProfile(profileId, CONSTANTS.COT) < 0) {
            return this.service.FAILURE;
        }
        if (await this.checkUnevaluatedProfile(profileId, CONSTANTS.TT) < 0) {
            return this.service.FAILURE;
        }
        if (await this.checkUnevaluatedProfile(profileId, CONSTANTS.COT_TT) < 0) {
            return this.service.FAILURE;
        }
        if (await this.checkUnevaluatedProfile(profileId, CONSTANTS.UNEVAL_VARS) < 0) {
            return this.service.FAILURE;
        }
        for (let i = 0; i < resultRows.length; i++) {
            const ndcLbl = resultRows[i].NDC_LBL;
            const ndcProd = resultRows[i].NDC_PROD;
            let ndcPckg: string;
            if (CONSTANTS.MED_AGENCY_TYPE == this.service.navigationName) {
                ndcPckg = '';
                if (await this.checkUnevaluated(profileId, ndcLbl, ndcProd, ndcPckg, CONSTANTS.PRODUCTS) < 0) {
                    return this.service.FAILURE;
                }
            }
            else if (CONSTANTS.VA_AGENCY_TYPE == this.service.navigationName) {
                ndcPckg = resultRows[i].NDC_PCKG;
                if (await this.checkUnevaluated(profileId, ndcLbl, ndcProd, ndcPckg, CONSTANTS.PRODUCTS) < 0) {
                }
                if (prcssType == CONSTANTS.VA_ANNL_PROC_TYPE) {
                    if (await this.check3Qtr(profileId, ndcLbl, ndcProd, ndcPckg) < 0) {
                        return this.service.FAILURE;
                    }
                }
            }
            else if (CONSTANTS.MEDICARE_AGENCY_TYPE == this.service.navigationName) {
                if (await this.checkUnevaluated(profileId, ndcLbl, ndcProd, ndcPckg, CONSTANTS.PRODUCTS) < 0) {
                    return this.service.FAILURE;
                }
                ndcPckg = resultRows[i].NDC_PCKG;
                if (await this.checkMedicare(profileId, ndcLbl, ndcProd, ndcPckg) < 0) {
                    return this.service.FAILURE;
                }
            }

            if (await this.checkUnevaluated(profileId, ndcLbl, ndcProd, ndcPckg, CONSTANTS.SLS_EXCLUSIONS) < 0) {
                return this.service.FAILURE;
            }
        }
        return this.service.SUCCESS;
    }

    private async check3Qtr(ndcLbl, ndcProd, ndcPckg, prflId) {
        let error: any = null;
        let result: any = null;
        try {
            let url = `sdalhPKG_FE_PRICING.F_CHECK_VA_ANNUAL/json?i_ndc_lbl=${ndcLbl}&i_ndc_prod=${ndcProd}&i_ndc_pckg=${ndcPckg}&i_profile_id=${prflId}`;
            result = await this.appService.get(url).toPromise();
        }
        catch (ex) {
            error = ex;
        }
        if (error) {
            this.appService.showMessage(`Database error occurred.</br>SQLErrText: ${error.ExceptionMessage}`);
            return this.service.FAILURE;
        }
        if (result.ReturnValue == CONSTANTS.NO) {
            let eval_sub: any[] = [`${ndcLbl} - ${ndcProd} - ${ndcPckg}`];
            this.appService.messageDialogByMessageId(CONSTANTS.QTRLY_VA_PRFL_NOT_EXISTS, eval_sub);
            return this.service.FAILURE;
        }

        return this.service.SUCCESS;
    }
    private async checkMedicare(ndcLbl, ndcProd, ndcPckg, prflId) {
        let error: any = null;
        let result: any = null;
        try {
            let url = `sdalhPKG_FE_PRICING.F_CHECK_MEDICARE/json?i_ndc_lbl=${ndcLbl}&i_ndc_prod=${ndcProd}&i_ndc_pckg=${ndcPckg}&i_profile_id=${prflId}`;
            result = await this.appService.get(url).toPromise();
        }
        catch (ex) {
            error = JSON.parse(ex);
        }
        if (error) {
            this.appService.showMessage(`Database error occurred.</br>SQLErrText: ${error.ExceptionMessage}`);
            return this.service.FAILURE;
        }
        if (result.ReturnValue == CONSTANTS.NO) {
            let eval_sub: string = `${ndcLbl} - ${ndcProd} - ${ndcPckg}`;
            this.appService.messageDialog('MEDICARE_VALIDATION', eval_sub);
            return this.service.FAILURE;
        }

        return this.service.SUCCESS;
    }
    private async checkUnevaluated(prflId: number, ndcLbl: string, ndcProd: string, ndcPkg: string, evalType: string) {
        const msgMaxLength: number = 2000;
        let error: any = null;
        let res: any = null;
        let agency: any = null;
        let msg: any = null;
        try {
            let url = `${this.service.pkgRootUrl}P_CHECK_UNEVAl_S/json?i_profile_id=${prflId}&i_ndc_lbl=${ndcLbl}&i_ndc_prod=${ndcProd}&i_ndc_pckg=${ndcPkg}&i_eval_type=${evalType}`;
            res = await this.appService.get(url).toPromise();
        }
        catch (ex) {
            error = JSON.parse(ex);
        }
        if (error) {
            this.appService.messageDialogByMessageId(CONSTANTS.CHECK_UNEVAL_DBERROR, [error.ExceptionMessage.split(':')[0], error.ExceptionType]);
            this.service.FAILURE;
        }
        if (res.OutputParameters.O_RESULT === CONSTANTS.YES) {
            if (evalType == CONSTANTS.PRODUCTS) {
                let result: any = null;
                error = null;
                let url = `${this.service.pkgRootUrl}P_CALC_PRICES_AGENCY_TYPE_S/json?i_prfl_id=${prflId}`;
                try {
                    result = await this.appService.get(url).toPromise();
                }
                catch (ex) {
                    error = JSON.parse(ex);
                }
                if (result && result.ResultSets[0].length > 0) {
                    agency = result.ResultSets[0][0].AGENCY_TYP_CD;
                }
                result = null;
                error = null;
                url = `${this.service.pkgRootUrl}P_CALCPRICES_UNEVAL_PRODS/json?i_prfl_id=${prflId}`;
                try {
                    result = await this.appService.get(url).toPromise();
                }
                catch (ex) {
                    error = JSON.parse(ex);
                }
                if (result && result.ResultSets[0].length > 0) {
                    msg = result.ResultSets[0][0];
                }
                let msgLen = msg.toString().length;
                if (msgLen > msgMaxLength) {
                    msg = msg.substring(0, msgMaxLength - 1) + '~r~n~t more ';
                }

                this.appService.messageDialogByMessageId(CONSTANTS.UNEVAL_SLS_EXCL_ERROR, [msg]);
            }
            else if (evalType == CONSTANTS.SLS_EXCLUSIONS) {
                this.appService.messageDialogByMessageId(CONSTANTS.UNEVAL_SLS_EXCL_ERROR);
            }
            else {
                this.appService.messageDialogByMessageId(CONSTANTS.UNEVALUATED_EXISTS, [evalType.toLowerCase(), evalType.toLowerCase()]);
            }

            return this.service.FAILURE;
        }
        return this.service.SUCCESS;
    }
    private checkUnevaluatedProfile(prflId: number, evalType: string) {
        return this.checkUnevaluated(prflId, '', '', '', evalType);
    }
}