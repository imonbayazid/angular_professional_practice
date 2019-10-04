import {Injectable  } from '@angular/core';
import {juForm, FormElement, FormOptions} from '../../shared/juForm/juForm';
import {juGrid, GridOptions } from '../../shared/juGrid/juGrid';
import {SelectOptions} from '../../shared/juForm/juSelect';
import { FV }          from '../../shared/juForm/FV';
import {CONSTANTS} from '../../shared/constant';
import {CalculatePricesService} from './CalculatePrices.service';
import { AppService } from '../../shared/app.service';

import {Observable}   from 'rxjs/Rx';

declare var moment: any;


@Injectable()
export class CalculateURAService {

    constructor(private appService: AppService, private service: CalculatePricesService) {

    }

    public initCalculateURAFunctionalities() {
        if (this.service.selectedListRow === null) {
            this.appService.showMessage('Internal Error! Unable to get profile row.');
            return;
        } 
        this.calculateURA(); 
    }

    private async calculateURA() {
        const profileStatus = this.service.selectedListRow.PRFL_STAT_CD;
        let active = profileStatus === 'TRANSMITTED' ? 'Y' : 'N';
        let beginDate = moment(this.service.selectedListRow.BEGN_DT).format('YYYY-MM-DD');
        let endDate = moment(this.service.selectedListRow.END_DT).format('YYYY-MM-DD');
        let url = `${this.service.pkgRootUrl}P_CALCPRICES_CALCURA_PERIOD_S/json?i_beg_date=${beginDate}&i_end_date=${endDate}`;
        const data: any = await this.appService.get(url).toPromise();
        if (!data.ResultSets.length) {
            let msg = `Unable to get period id for profile begin (${beginDate}) and end (${endDate})`;
            this.appService.messageDialog('', msg);
            return;
        }
        let periodId = data.ResultSets[0][0].PERIOD_ID;
        let priceList: any[] = [];
        let profileResults = this.service.selectedResultRows;
        for (let i = 0; i < profileResults.length; i++) {
            let obj: any = {};
            obj.NDC_LBL = profileResults[i].NDC_LBL;
            obj.NDC_PROD = profileResults[i].NDC_PROD;
            obj.periodId = periodId;
            obj.active = active;
            priceList.push(obj);
        }
        let approvedFormula = null;
        if (await this.appService.confirmDialogPromise('Confirmation', `Do you want to submit this PUR Calculation request?`)) {
            this.calculateSubmitPur(priceList, approvedFormula);
        }
    }
    private async calculateSubmitPur(prices: any[], formula: string) {
        let status = await this.submitPurCalculation(prices, formula);
        if (+status === this.service.FAILURE) {
            this.appService.messageDialog('', `Unable to create a PUR calculation request.`);
        }
    }
    private async submitPurCalculation(prices: any[], formula: string) {
        const approved = 'APPROVED';
        const unapproved = 'UNAPPROVED';
        let approvedStatus = formula === null ? approved : unapproved;
        const batchId = '1006';
        let queueId = await this.insertProcessQueueURA(batchId);
        if (queueId < 1) {
            this.appService.messageDialogByMessageId('HCRS0045');
            let rollbackUrl = `sdalhPKG_UI_COMMON.P_ROLLBACK/json`;
            const status = this.appService.get(rollbackUrl).toPromise();
            return this.service.FAILURE;
        }
        let requestUrl = `${this.service.pkgRootUrl}P_CALCPRICES_CALCURA_REQUEST_S/json`;
        let request = await this.appService.get(requestUrl).toPromise();
        const requestData: any[] = request.ResultSets[0];
        for (let i = 0; i < prices.length; i++) {
            let priceIndex = prices[i].periodId;
            let success = await this.isPriceIndex(priceIndex);
            if (success === this.service.FAILURE) {
                let rollbackUrl = `sdalhPKG_UI_COMMON.P_ROLLBACK/json`;
                const status = this.appService.get(rollbackUrl).toPromise();
                return this.service.FAILURE;
            }
            let findList: any[] = requestData.filter(x => x.NDC_LBL == prices[i].NDC_LBL && x.NDC_PROD == prices[i].NDC_PROD && x.periodId == prices[i].periodId)
            if (findList.length > 0) {
                let qtr = await this.getPeriod(priceIndex, 'quarter');     // Here should be pass as second parameter
                this.appService.messageDialog("Duplicate Selection", `You can only submit one calculation per product/period.<br><br> Product ${prices[i].NDC_LBL}-${prices[i].NDC_PROD} is selected more than once for period ${qtr}. Please select only one row per product/period.`);
                return this.service.FAILURE;
            }
            let requestTypeCd = 'PUR';
            let deleteUrl = `sdalhPKG_FE_PUR2.P_DELETE_CALC_REQ/json?i_ndc_lbl=${prices[i].NDC_LBL}&i_ndc_prod=${prices[i].NDC_PROD}&i_period_id=${prices[i].periodId}&i_req_typ_cd=${requestTypeCd}`;
            let res = await this.appService.get(deleteUrl).toPromise();
            if (res === null) {
                let msg: any = this.appService.messageDialogByMessageId('HCRS0247');
                return this.service.FAILURE;
            }

            let insertUrl = `${this.service.pkgRootUrl}P_CALCPRICES_CALCURA_REQUEST_I/json?i_prcss_queue_id=${+queueId}&i_ndc_lbl=${prices[i].NDC_LBL}&i_ndc_prod=${prices[i].NDC_PROD}&i_period_id=${prices[i].periodId}&i_activ_ready=${prices[i].active}`;
            //console.log('in submitPurCalculation ', insertUrl);
            let result = await this.appService.get(insertUrl).toPromise();
            if (result) {
                let commitUrl = `sdalhPKG_UI_COMMON.P_COMMIT/json`;
                const sts = this.appService.get(commitUrl).toPromise();
            }
            else {
                let rollbackUrl = `sdalhPKG_UI_COMMON.P_ROLLBACK/json`;
                const status = this.appService.get(rollbackUrl).toPromise();
            }

        }    // End of for loop
    }

    private async isPriceIndex(periodId: string) {
        if (periodId === null) {
            return this.service.FAILURE;
        }

        let url = `${this.service.pkgRootUrl}P_CALCPRICES_URA_PERIOD_L_S/json?i_period_id=${periodId}`;
        const result: any = await this.appService.get(url).toPromise();
        if (result.ResultSets[0].length < 0) {
            this.appService.messageDialog('', `Internal error! Unable to get qtr and year for period_id (${periodId}).`);
            return this.service.FAILURE;
        }
        const resultData = result.ResultSets[0];
        const liQtr = resultData[0].LI_QTR;
        const liYear = resultData[0].LI_YEAR;
        let liMonth: number;
        switch (liQtr) {
            case 1: liMonth = 1;
                break;
            case 2: liMonth = 4;
                break;
            case 3: liMonth = 7;
                break;
            case 4: liMonth = 10;
                break;
        }
        let msgs: any[] = [liQtr, liYear];
        let ppiUrl = `sdalhpkg_fe_pur.f_check_ppi/json?i_year=${liYear}&i_mth=${liMonth}`;
        let res: any = await this.appService.get(ppiUrl).toPromise();
        if (res.ReturnValue < 0 || !res) {
            this.appService.messageDialogByMessageId(CONSTANTS.PPI_NOT_FOUND); 
            return this.service.FAILURE;
        }
        let cpiUrl = `sdalhpkg_fe_pur.f_check_cpi/json?i_year=${liYear}&i_mth=${liMonth}`;
        let resPromise: any = await this.appService.get(cpiUrl).toPromise();
        //if (!resPromise) {
        //    this.service.notifyAll({ key: 'error', value: '' });
        //}
        if (resPromise.ReturnValue < 0 || !resPromise) {
            this.appService.messageDialogByMessageId(CONSTANTS.CPI_NOT_FOUND); 
            return this.service.FAILURE;
        }

    }
    private async getPeriod(periodId: string, column: String) {
        let rc: any;
        if (periodId === null || column === null) {
            rc = null;
            return rc;
        }
        let url = `${this.service.pkgRootUrl}P_CALCPRICES_CALCURA_CHILD_S/json?i_period_id=${periodId}`;
        let res: any = await this.appService.get(url).toPromise();
        let data: any[] = res.ResultSets[0];
        if (data.length < 1) {
            let url = `${this.service.pkgRootUrl}P_CALCPRICES_URA_PERIOD_P_S/json?i_period_id=${periodId}`;
            let result: any,error:any = null;
            try {
                result = await this.appService.get(url).toPromise();
            }
            catch (ex) {
                error = JSON.parse(ex);
                rc = null;
                return rc;
            }
            let content: any[] = res.ResultSets[0];
            if (content.length < 0) {
                rc = null;
            }
            else {
                rc = data[0].QUARTER;      // here rc should be "data.column (find.column)"
            }
        }
        return rc;
    }

    private async insertProcessQueueURA(batchId: string) {
        let url = this.service.pkgRootUrl + 'P_CALCPRICES_BATCH_ID_S/json?i_batch_id=' + batchId;
        let queueIdUrl = this.service.pkgRootUrl + 'P_CALCPRICES_PRCSS_NXTVAL_S/json';
        let result:any = await this.appService.get(url).toPromise();
        if (!result.ResultSets.length) {
            return -1;
        }
        result = result.ResultSets[0];
        let queue = await this.appService.get(queueIdUrl).toPromise();
        let queueId: any = queue.ResultSets[0].length > 0 ? +queue.ResultSets[0][0].NEXTVAL : 0;
        if (queueId == 0) {
            this.appService.messageDialog('',`Unable to get a sequence number for a new batch request`);
            return -2;
        } 
        let dbUser = await this.appService.get('api/User/GetDbUserName').toPromise();
        let currentDate = new Date().toLocaleDateString();
        let insertQueueUrl = this.service.pkgRootUrl + 'P_CALCPRICES_PRCSS_QUEUE_I/json?i_queue_id=' + queueId
            + '&i_user_id=' + dbUser + '&i_exec_nm=' + result[0].EXEC_NM + '&i_dstn_prtr=null&i_exec_tm=' + currentDate
            + '&i_prcss_stat=NEW&i_prcss_stat_dt=' + currentDate + '&i_load_flag=N&i_restart_cnt=' + result[0].RESTART_LIMIT + '&i_restart_step=1';
        //console.log(insertQueueUrl);
        let insertSts = await this.appService.get(insertQueueUrl).toPromise();
        if (!insertSts.OutputParameters.O_RESULT) {
            this.appService.messageDialog('',`Unable to get a sequence number for a new batch request`);
            return -2;
        }
        return queueId;
    }

    //public async getOverrideErrorMsg(msgId: string) {
    //    const url = this.service.pkgRootUrl + 'P_CALC_OVERRIDE_ERR_MSG_S/json?i_msg_id=' + msgId;
    //    let msg = await this.appService.get(url).toPromise();
    //    return msg;
    //}

}