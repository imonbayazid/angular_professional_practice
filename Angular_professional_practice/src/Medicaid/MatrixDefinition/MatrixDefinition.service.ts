import {Injectable}   from '@angular/core';
import {AppService}   from '../../shared/app.service';
import {Http}         from '@angular/http';
import {Subject, Observable} from 'rxjs/Rx';
import {CONSTANTS} from '../../shared/constant';


interface istr_lockedModel {
    co_id: number;
    base_prfl_id: number;
}


@Injectable()
export class MatrixDefinitionService  {

    constructor(public appService: AppService) {
       
    }

    public matrixExceptionModalHandler = new Subject();
    public matrixExceptionModalHandler2 = new Subject();
    public dropDownData = new Subject();

    


    public loadDropdownData() {
        var url = "sdalhPKG_UI_MATRIX_DEFINITION.P_DW_COMPANY_S/json?";
        this.appService.get(url)
            .subscribe(res => {
                this.DW_COMPANY_DROPDOWN_DATA_LIST = res.ResultSets[0].map(_ => ({ value: _.CO_ID, text: _.CO_NM }));
                this.dropDownData.next({ key: 'first', data: this.DW_COMPANY_DROPDOWN_DATA_LIST });
            });

        var url = "sdalhPKG_UI_MATRIX_DEFINITION.P_DW_CALCULATION_TYPE_S/json?i_as_agency_typ_cd=" + this.is_agency;
       this.appService.get(url)
           .subscribe(res => {
               
                this.DW_CALCULATION_TYPE_DROPDOWN_DATA_LIST = res.ResultSets[0].map(_ => ({ value: _.CALC_TYP_CD, text: _.CALC_TYP_DESCR }));
                this.loadMatrix(this.DW_CALCULATION_TYPE_DROPDOWN_DATA_LIST[0].value);
                this.dropDownData.next({ key: 'second', data: this.DW_CALCULATION_TYPE_DROPDOWN_DATA_LIST });
            });

    }


    loadMatrix(value:any)
    {
        var url = "sdalhPKG_UI_MATRIX_DEFINITION.P_DW_METHOD_S/json?i_as_agency_typ_cd=" + this.is_agency;
        this.appService.get(url)
            .subscribe(res => {
                this.matrixDropDownMainDataList = res.ResultSets[0];
                this.DW_METHOD_DROPDOWN_DATA_LIST = res.ResultSets[0].filter(r => r.CALC_TYP_CD === value)
                    .map(_ => ({ value: _.PRI_WHLS_MTHD_CD, text: _.PRI_WHLS_MTHD_DESCR }));
                if (this.is_agency === CONSTANTS.VA_AGENCY_TYPE)
                    this.DW_METHOD_DROPDOWN_DATA_LIST = this.DW_METHOD_DROPDOWN_DATA_LIST.sort(function (a, b) {
                        var nameA = a.value.toUpperCase(); // ignore upper and lowercase
                        var nameB = b.value.toUpperCase(); // ignore upper and lowercase
                        if (nameA > nameB) {
                            return -1;
                        }
                        if (nameA < nameB) {
                            return 1;
                        }
                        return 0;
                    }); 
                this.dropDownData.next({ key: 'third', data: this.DW_METHOD_DROPDOWN_DATA_LIST });         
            });
    }

    sortDWmethod()
    {
        if (this.is_agency === CONSTANTS.VA_AGENCY_TYPE)
            this.DW_METHOD_DROPDOWN_DATA_LIST = this.DW_METHOD_DROPDOWN_DATA_LIST.sort(function (a, b) {
                var nameA = a.value.toUpperCase(); // ignore upper and lowercase
                var nameB = b.value.toUpperCase(); // ignore upper and lowercase
                if (nameA > nameB) {
                    return -1;
                }
                if (nameA < nameB) {
                    return 1;
                }
                return 0;
            });
    }
    firstTimeVisitedForVA: any = 1;

    DW_COMPANY_DROPDOWN_DATA_LIST: any=[];
    DW_CALCULATION_TYPE_DROPDOWN_DATA_LIST: any = [];
    DW_METHOD_DROPDOWN_DATA_LIST: any = [];
    DW_TRADE_DATA_LIST: any = []; 

    matrixDropDownMainDataList: any;


    is_agency: any;

    updatable: boolean = false

    isProfileLock: boolean = false;

    /**
    * Ref# n_cst_profile : GP\gpc_profile_common.xlsx
    */
    ib_lock_count: boolean = false
    il_profile_id: number;
    il_hist_prfl_id: number;

    public of_getProfileId() {
        return this.il_profile_id;
    }

    public of_setHistProfileId(al_hist_prfl_id:any)
    {
        if (al_hist_prfl_id) this.il_hist_prfl_id = al_hist_prfl_id;
        else this.il_hist_prfl_id = 0;
    }

    public of_getHistProfileId() {
        return this.il_hist_prfl_id;
    }

    public async of_getHistCoId() {
        //if (this.histPrflId <= 0 || !this.histPrflId) {
        //    return this.FAILURE;
        //}
        let aiCoId: any[] = [];
        let result: any = null;
        let error: any = null;
        try {
            result = await this.appService.get(`sdalhPKG_UI_MEDICAID_MATRIX_CHANGES.P_HISTORY_CO_ID_S/json?i_prfl_id=${this.il_hist_prfl_id}`).toPromise();
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

    public async of_GetTemplateProfileId(li_co_id, hist_prfl_id) {

        var url = "sdalhPKG_UI_MATRIX_DEFINITION.P_D_GET_TEMPLATE_PROFILE_ID_S/json?i_agency_typ_cd=" +
            this.is_agency + "&i_co_id=" + li_co_id + "&i_copy_hist_prfl_id=" + hist_prfl_id;

        let error: any = null;
        let errorCode: string = '';
        let errorText: string = '';
        let profile_id: any = null;

        try {
            profile_id = await this.appService.get(url).toPromise();
            profile_id = (profile_id.ResultSets[0])[0].PROFILEID;
            
        } catch (ex) {
            error = JSON.parse(ex._body);
            errorCode = error.ExceptionMessage.split(':')[0];
            errorText = error.ExceptionMessage.split(':')[3];

            this.appService.messageDialogByMessageId("HCRS0161", [errorCode, errorText]);
            return errorCode;

        }

        if (profile_id == null) {
            profile_id = 0;
            this.appService.messageDialogByMessageId("HCRS0161", [errorCode]);
        }

        return profile_id;
    }

    public istr_locked: istr_lockedModel[] = []; // declare an array of str_locked structure

    public of_IsLocked(al_base_prfl_id: any) {
        var li_i, lb_locked;

        if (this.isEmpty(al_base_prfl_id) || (al_base_prfl_id < 1))
            return false;

        //initialize
        lb_locked = false

        for (li_i = 0; li_i < this.istr_locked.length; li_i++) {
            if (this.istr_locked[li_i].base_prfl_id == al_base_prfl_id) {
                lb_locked = true
                break;
            }
        }
        return lb_locked;
    }
    public isEmpty(value) {
        return (value === undefined || value === null);
    }


    //of_setLocked 
    public async ofSetLocked(coId: number, baseProfileId: number, abLock: boolean, histPrflId: any) {
        if (!coId || !baseProfileId || !abLock) return 0;
        if (coId < 1) return 0;
        let result: any = null;
        let error: any = null;
        let url: string = '';
        if (abLock) {
            url = `sdalhpkg_fe_profile.f_get_overall_prfl_lck_status/json?i_agency_typ_cd=${this.is_agency}&i_co_id=${coId}&i_copy_hist_prfl_id=${histPrflId}`;
            try {
                result = await this.appService.getWithErrorMessage(url).toPromise();
            }
            catch (ex) {
                error = ex;
            }
            if (error) {
                this.appService.messageDialogByMessageId(CONSTANTS.CHECK_PROFILES_READY_ERROR, [error.errorDbCode, error.errorDbText]);
                return 0;
            }
            if (result.ReturnValue) {
                this.appService.messageDialogByMessageId(CONSTANTS.PROFILES_NOT_READY);
                return -2;
            }
        }
        result = null;
        error = null;
        if (abLock) {
            url = `sdalhpkg_fe_profile.f_lock_profiles/json?i_agency_typ_cd=${this.is_agency}&i_co_id=${coId}&i_copy_hist_prfl_id=${histPrflId}`;
            try {
                result = await this.appService.getWithErrorMessage(url).toPromise();
            }
            catch (ex) {
                error = ex;
            }
            if (error) {
                this.appService.messageDialogByMessageId(CONSTANTS.CHECK_PROFILES_READY_ERROR, [error.errorDbCode, error.errorDbText]);
                return 0;
            }
            if (result.ReturnValue) {
                this.appService.messageDialogByMessageId(CONSTANTS.PROFILES_NOT_READY);
                return -2;
            }
        }

        return 1;
    } 

   
   
}