import {Injectable}   from '@angular/core';
import {CONSTANTS} from '../../shared/constant';
import {AppService} from '../../shared/app.service';
import {ClassOfTradeTabComponent} from './ApproveMatrixChangesSubModule/ClassOfTradeTab.component';
import {MatrixExceptionsTabComponent} from './ApproveMatrixChangesSubModule/MatrixExceptionsTab.component';
import {EstimationsTabComponent} from './ApproveMatrixChangesSubModule/EstimationsTab.component';
import {TransactionTypesTabComponent} from './ApproveMatrixChangesSubModule/TransactionTypesTab.component';
import {Subject} from 'rxjs/Rx';


@Injectable()
export class ApproveMatrixChangesService {
    constructor(private service: AppService) { }

    public pkgRootUrl: string = 'sdalhPKG_UI_MEDICAID_MATRIX_CHANGES.';
    public SUCCESS: number = 1;
    public FAILURE: number = -1;
    public navigationName: string = '';
    public histPrflId: number = 0;
    public isLocked: boolean = false;
    public ibCheckSecurity: boolean = true;
    public classOfTradeUpdateable: boolean = false;
    public ibIsUpdateable: boolean;
    public currentUserName: string;
    public isUpdatesPending: boolean = false;
    public title: string = 'Matrix Approval';
    public activeTab: string = 'Matrix Details';
    public previousTab: string = 'Matrix Details';
    public ancestorReturnValue: boolean = true;

    public classOfTradeRef: any = null;
    public transactionTypesRef: any = null;
    public matrixExceptionsRef: any = null;
    public estimationsRef: any = null;
    public selectedTabRef: any = null;

    public findHandler = new Subject();
    public saveBtnHandler = new Subject();
    public getFocusHandler = new Subject();
    public setUpPageHandler = new Subject();
    public resetGridHandler = new Subject();

    public checkLockedUnlocked() {
        return new Promise((re, ri) => {
            this.service.confirmDialogPromise('Confirmation', 'Do you want to lock for edit?').then((res) => {
                this.isLocked = !!res;
                re(true);
            });
        });
    }

    public async getCurrentUserName() {
        this.currentUserName = await this.service.get('api/User/GetDbUserName').toPromise();
    }

    public getSelectedTabRef(tabName: string) {
        //console.log('tab::', tabName);
        switch (tabName) {
            case 'Classes of Trade': return this.classOfTradeRef;
            case 'Transaction Types': return this.transactionTypesRef;
            case 'Matrix Exceptions': return this.matrixExceptionsRef;
            case 'Estimations': return this.estimationsRef;
        }

    }
    public getSelectedTab(tabName: string) {
        //console.log('tab::', tabName);
        switch (tabName) {
            case 'Classes of Trade': return CONSTANTS.COT;
            case 'Transaction Types': return CONSTANTS.TT;
            case 'Matrix Exceptions': return CONSTANTS.COT_TT;
            case 'Estimations': return CONSTANTS.ESTIMATIONS;
        }

    }

    //pfc_save
    public async pfcSave() {
        let lsMode = 'BROADCAST';
        if (this.ancestorReturnValue) {
            let checkApprovalStatus = await this.ofCheckApprovalStatus();
            const status: number = await this.ofSetLocked(+this.selectedTabRef.iiCoId, +this.selectedTabRef.ilBaseProfileId, true);
            if (status > 0) {
                this.isUpdatesPending = false;
                this.service.isSavedPending = this.isUpdatesPending;
                this.ofSetSave(false);
                this.service.get(`sdalhPKG_UI_COMMON.P_COMMIT/json?`).toPromise();
            } 
            else {
                this.service.get(`sdalhPKG_UI_COMMON.P_ROLLBACK/json?`).toPromise();
                this.isUpdatesPending = false;
                this.service.isSavedPending = this.isUpdatesPending;
            }         
            if (checkApprovalStatus < 0) {
                return;
            }
            //call broadcast job
            //let liRc = this.ofRunBroadcast([], lsMode);
            //if (liRc === this.FAILURE) {
            //    this.service.messageDialog('', 'Error when broadcasting changes.');
            //    await this.service.get(`sdalhPKG_UI_COMMON.P_ROLLBACK/json?`).toPromise();
            //    return -10;
            //}
            //await this.service.get(`sdalhPKG_UI_COMMON.P_COMMIT/json?`).toPromise();
            //this.ofSetSave(false);
        }
        else {
            this.service.messageDialog('', 'Error in pfc_save event of w_appr_matrix_chg');
            await this.service.get(`sdalhPKG_UI_COMMON.P_ROLLBACK/json?`).toPromise();
        }

    }
    //of_RunBroadcast
    public async ofRunBroadcast(isTrLocked: any[] = [], mode: string) {
        let asMode = '';
        let aiCoId: any[] = [];
        let result: any = null;
        let error: any = null;
        for (let i = 0; i < isTrLocked.length; i++) {
            try {
                result = await this.service.getWithErrorMessage(`sdalhPKG_FE_PROFILE.P_BROADCAST_CHANGES_JOB/json?i_agency_typ_cd=${this.navigationName}&i_co_id=${isTrLocked[i].CO_ID}&i_copy_hist_prfl_id=${this.histPrflId}&i_mode=${asMode}`).toPromise();
            }
            catch (ex) {
                error = ex;
            }
        }
        if (error) {
            this.service.messageDialogByMessageId(CONSTANTS.TEMPLATE_BROADCAST_CHANGES_ERROR, [error.errorDbCode, error.errorDbText]);
            return this.FAILURE;
        }
        for (let i = 0; i < isTrLocked.length; i++) {
            aiCoId[i].CO_ID = isTrLocked[i].CO_ID;
        }
        return aiCoId.length;
    }

    //of_setLocked 
    public async ofSetLocked(coId: number, baseProfileId: number, abLock: boolean) {
        if (!coId || !baseProfileId || !abLock) return this.FAILURE;
        if (coId < 1) return;
        let histPrflId = this.histPrflId;
        let result: any = null;
        let error: any = null;
        let url: string = '';
        if (abLock) {
            url = `sdalhpkg_fe_profile.f_get_overall_prfl_lck_status/json?i_agency_typ_cd=${this.navigationName}&i_co_id= ${coId}&i_copy_hist_prfl_id=${histPrflId}`;
            try {
                result = await this.service.getWithErrorMessage(url).toPromise();
            }
            catch (ex) {
                error = ex;
            }
            if (error) {
                this.service.messageDialogByMessageId(CONSTANTS.CHECK_PROFILES_READY_ERROR, [error.errorDbCode, error.errorDbText]);
                return this.FAILURE;
            }
            if (result.ReturnValue != 0) {  // when profile is unlocked it returns 0, if locked then returns -1
                this.service.messageDialogByMessageId(CONSTANTS.PROFILES_NOT_READY);
                return -2;
            }
        }
        result = null;
        error = null;
        if (abLock) {
            url = `sdalhpkg_fe_profile.f_lock_profiles/json?i_agency_typ_cd=${this.navigationName}&i_co_id= ${coId}&i_copy_hist_prfl_id=${histPrflId}`;
            try {
                result = await this.service.getWithErrorMessage(url).toPromise();
            }
            catch (ex) {
                error = ex;
            }
            if (error) {
                this.service.messageDialogByMessageId(CONSTANTS.CHECK_PROFILES_READY_ERROR, [error.errorDbCode, error.errorDbText]);
                return this.FAILURE;
            }
            else {
                return this.SUCCESS;  // lock done, then return 1;
            }
        }
        //if ab_lock then
        //istr_locked[Upperbound(istr_locked[]) + 1].co_id = ai_co_id
        //istr_locked[Upperbound(istr_locked[])].base_prfl_id = al_base_prfl_id
        //end if 
        return this.SUCCESS;
    }

    //of_check_approval_status
    public async ofCheckApprovalStatus() {
        let result: any = null;
        this.selectedTabRef = this.getSelectedTabRef(this.activeTab);
        let llBaseProfileId = this.selectedTabRef.ilBaseProfileId;
        let liCount: number;
        result = await this.service.get(`${this.pkgRootUrl}P_CLASS_OF_TRD_LOG_S/json?i_base_prfl_id=${llBaseProfileId}`).toPromise();
        if (result.ResultSets[0].length > 0) {
            liCount = result.ResultSets[0][0].LOG_COUNT;
            if (liCount > 0) {
                this.service.messageDialog(this.title, 'There are unapproved changes to Class of Trade. Please approve all changes to take effect.');
                return this.FAILURE;
            }
        }
        result = await this.service.get(`${this.pkgRootUrl}P_TRANS_TYP_LOG_S/json?i_base_prfl_id=${llBaseProfileId}`).toPromise();
        if (result.ResultSets[0].length > 0) {
            liCount = result.ResultSets[0][0].LOG_COUNT;
            if (liCount > 0) {
                this.service.messageDialog(this.title, 'There are unapproved changes to Class of Trade. Please approve all changes to take effect.');
                this.FAILURE;
            }
        }
        result = await this.service.get(`${this.pkgRootUrl}P_MTRX_LOG_S/json?i_base_prfl_id=${llBaseProfileId}`).toPromise();
        if (result.ResultSets[0].length > 0) {
            liCount = result.ResultSets[0][0].LOG_COUNT;
            if (liCount > 0) {
                this.service.messageDialog(this.title, 'There are unapproved changes to Class of Trade. Please approve all changes to take effect.');
                this.FAILURE;
            }
        }
        result = await this.service.get(`${this.pkgRootUrl}P_SPLT_PCT_LOG_S/json?i_base_prfl_id=${llBaseProfileId}`).toPromise();
        if (result.ResultSets[0].length > 0) {
            liCount = result.ResultSets[0][0].LOG_COUNT;
            if (liCount > 0) {
                this.service.messageDialog(this.title, 'There are unapproved changes to Class of Trade. Please approve all changes to take effect.');
                this.FAILURE;
            }
        }

        return 0;
    }

    //ue_save
    public async ueSave() {
        let liRc: any;
        //this.service.setCancelButton(true);
        const result = await this.service.confirmDialogPromise("Confirmation", "Do you want to save changes?");
        if (result == 1) {
            liRc = this.pfcSave();
        }
        else{
            this.isUpdatesPending = false;
            this.service.isSavedPending = this.isUpdatesPending;
            this.resetGridHandler.next(true);
            this.service.get(`sdalhPKG_UI_COMMON.P_ROLLBACK/json?`).toPromise();
        }
        //else { //Cancel
        //    liRc = -99;
        //}
        //this.service.setCancelButton(false);

    }


    public ofSetSave(abSwitch: boolean) {
        if (abSwitch === null) return this.FAILURE;

        this.saveBtnHandler.next(abSwitch);

        return this.SUCCESS;
    }
    public async ofGetFocus() {
        let llHistPrflId = this.histPrflId;
        let lsCoId: any[] = [];
        if (llHistPrflId > 0) {
            lsCoId = await this.ofGetHistoryCoId();
        }
        this.getFocusHandler.next(lsCoId);
        let tab = this.getSelectedTab(this.activeTab);
        this.setUpPageHandler.next(tab);
    }

    public async ofGetHistoryCoId() {
        //if (this.histPrflId <= 0 || !this.histPrflId) {
        //    return this.FAILURE;
        //}
        let aiCoId: any[] = [];
        let result: any = null;
        let error: any = null;
        try {
            result = await this.service.get(`${this.pkgRootUrl}P_HISTORY_CO_ID_S/json?i_prfl_id=${this.histPrflId}`).toPromise();
        }
        catch (ex) {
            error = ex;
        }
        if (result) {
            const data: any[] = result.ResultSets[0];
            let count: number = 0;
            for (let i = 0; i < data.length; i++) {
                let include = data[i].INCL_IND;
                if (include === CONSTANTS.YES) {
                    aiCoId[count++] = data[i].CO_ID;
                }
            }
        }
        return aiCoId;
    }

    public async getBaseProfileId(agencyType: string, dataSourceId: number) {
        let result: any = null;
        let profileId: number = 0;
        let error: any = null;
        try {
            result = await this.service.getWithErrorMessage(`sdalhPKG_UI_MEDICAID_MATRIX_CHANGES.P_MTRX_PRFL_ID/json?i_agency_type=${agencyType}&i_co_id=${dataSourceId}&i_copy_hist_prfl_id=${this.histPrflId}`).toPromise();
        }
        catch (ex) {
            error = ex;
            //console.log(error);
        }
        if (error) {
            this.service.confirmDialogByMessageId(CONSTANTS.GET_MAX_PROFILE_ERROR, [error.errorDbCode, error.errorDbText]);
            return;
        }
        if (result) {
            profileId = +result.OutputParameters.O_RESULT;
        }

        return profileId;
    }
}