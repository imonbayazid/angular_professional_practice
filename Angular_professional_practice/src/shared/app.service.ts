import {Injectable}   from '@angular/core';
import {Http, Headers}         from '@angular/http';
import {CONSTANTS} from './constant';
import {Observable, Subject}   from 'rxjs/Rx';
import {MenuItem} from './menu';
import {ConfirmOkDialog} from "./app-ui/confirm.okdialog";

declare var window: any;
declare var jQuery: any;
declare var moment: any;

@Injectable()
export class AppService {
    private ids_batch_id: any = [];
    private ids_queue_id: any = [];
    private ids_params: any = [];


    private insertQueueId: any = 0;


    overLayElement: any;
    private baseUrl: string = '';
    public notifier$: Subject<any>;
    confirmDialogInstance: any;
    public isSavedPending: boolean = false;
    public fromFile: boolean = false;
    public deployedEnvironment: string = '';
    confirmDialogOkInstance: ConfirmOkDialog;
    private headers: Headers;
    constructor(private http: Http) {
        this.notifier$ = new Subject();
        this.headers = new Headers();
        this.headers.append('Content-Type', 'application/json');
        this.headers.append('Accept', 'application/json');

        this.LoadAllAppConfigs();
    }

    public LoadAllAppConfigs() {
        if (!this.IsLoadServerConfig) {
            this.get('api/User/GetConfigurationAll').subscribe(res => {
                this.IsLoadServerConfig = true;

                for (var i = 0; i < res.length; i++) {
                    switch (res[i].Key) {
                        // + Form loader factors
                        case "IsLoadPasswordChangeForm": { this.IsLoadPasswordChangeForm = (res[i].Value == "1"); break; }
                        case "PasswordChangeFormMessage": { this.PasswordChangeFormMessage = res[i].Value; break; }
                        case "IsLoadWarningForm": { this.IsLoadWarningForm = (res[i].Value == "1"); break; }
                        // + From Database
                        case "SalesExclusionsWarn_MEDICAID": { this.SalesExclusionsWarn_MEDICAID = ((res[i].Value == "") ? "" : res[i].Value); break; }
                        case "SalesExclusionsWarn_VA": { this.SalesExclusionsWarn_VA = ((res[i].Value == "") ? "" : res[i].Value); break; }
                        case "SalesExclusionsWarn_MEDICARE": { this.SalesExclusionsWarn_MEDICARE = ((res[i].Value == "") ? "" : res[i].Value); break; }
                        case "idt_curr_first_day_period": { this.idt_curr_first_day_period = res[i].Value; break; }
                        case "li_idle_limit": { this.li_idle_limit = ((res[i].Value == "") ? 0 : parseInt(res[i].Value)); break; }
                        // + Local INI 
                        case "StartofTime": { this.StartofTime = res[i].Value; break; }
                        case "EndofTime": { this.EndofTime = res[i].Value; break; }
                        // + Global INI 
                        case "LogRptUsage": { this.LogRptUsage = res[i].Value; break; }
                        case "LoginTimeout": { this.LoginTimeout = res[i].Value; break; }
                        case "DefaultCompany": { this.DefaultCompany = res[i].Value; break; }
                        case "ProcessingDays": { this.ProcessingDays = res[i].Value; break; }
                        case "DBMS": { this.DBMS = res[i].Value; break; }
                        case "ServerName": { this.ServerName = res[i].Value; break; }
                        case "TransmitWaitTime": { this.TransmitWaitTime = res[i].Value; break; }
                        case "BatchProgram": { this.BatchProgram = res[i].Value; break; }
                        case "AllowIncompleteSubm": { this.AllowIncompleteSubm = res[i].Value; break; }
                        case "batchpollfreq": { this.batchpollfreq = res[i].Value; break; }
                        // + Others
                        case "LogId": { this.LogId = res[i].Value; break; }
                        case "UserIdForQueryParameter": { this.UserIdForQueryParameter = res[i].Value; break; }
                        case "DataSource": { this.DataSource = res[i].Value; break; }
                        case "DeployedEnvironmentName": { this.DeployedEnvironmentName = res[i].Value; break; }
                    }

                    // Testing 
                    //console.log("Key : " + res[i].Key + "; Value : " + res[i].Value);
                }

            });
        }
    }

    // + Public shared variables place 
    public IsLoadServerConfig: boolean = false;
    public IsLoadHomePagePopupForms: boolean = true;

    // + Form loader factors 
    public IsLoadPasswordChangeForm: boolean = false;
    public PasswordChangeFormMessage: string = '';
    public IsLoadWarningForm: boolean = false;

    // + From Database 
    public SalesExclusionsWarn_MEDICAID: string = '';
    public SalesExclusionsWarn_VA: string = '';
    public SalesExclusionsWarn_MEDICARE: string = '';
    public idt_curr_first_day_period: string = '';  // 1/1/2002 00:00:00    - n_hcrsappmgr.of_set_curr_period ()
    public li_idle_limit: number = 0;

    // + Local INI
    public StartofTime: string = '';        // "01-01-1900" - "General"
    public EndofTime: string = '';          // "01-01-2100" - "General"

    // + Global INI 
    public LogRptUsage: string = '';        // "yes" - "Application"
    public LoginTimeout: string = '';       // "300" - "LoginTimeout"
    public DefaultCompany: string = '';     // "121"    - "Claims"
    public ProcessingDays: string = '';     // "38"     - "Claims"
    public DBMS: string = '';               // "O90"
    public ServerName: string = '';         // "hcrsp" - "Database"
    public TransmitWaitTime: string = '';   // "180"      - "Settings"
    public BatchProgram: string = '';       // "SSCC Z"      - "Settings"
    public AllowIncompleteSubm: string = '';    // "yes"      - "Settings"
    public batchpollfreq: string = '';      // "0"      - "Settings"

    // + Others
    public LogId: string = '';              // "" - "Database"   - n_hcrsappmgr.pfc_prelogondlg ()
    public UserIdForQueryParameter: string = '';              // UserIdForQueryParameter
    public DataSource: string = '';
    public DeployedEnvironmentName: string = '';    // "HCRS Dev", "HCRS Test", "HCRS Prod"

    private getBaseUrl() {
        if (this.baseUrl) {
            return this.baseUrl;
        }
        this.baseUrl = jQuery('base ').attr('href') || '/';
        //this.baseUrl += 'api/';
        return this.baseUrl;
    }

    setCancelButton(isHide: boolean = true) {
        this.confirmDialogInstance.setCancelButton(isHide);
    }

    setCancelButtonOKPromise(isHide: boolean = true) {
        this.confirmDialogOkInstance.setCancelButton(isHide);
    }

    public async getMessage(messageID: any, msgArray = []) {

        let msg: any = {};
        var url = "sdalhPKG_UI_COMMON.P_GET_ERR_MSG/json?i_msg_id=" + messageID;
        let res = await this.get(url).toPromise();

        const data = res.ResultSets[0];
        const replacedMsg = this.replaceCharsInMsg(data[0].MSGTEXT, msgArray);
        msg.title = data[0].MSGTITLE;
        msg.message = replacedMsg.replace(/(\~t)/gi, ' ');
        msg.message = msg.message.replace(new RegExp("\\~n", 'gi'), '<br/>');
        msg.message = msg.message.replace(/(\~r)/gi, '');
        return msg;

    }

    private replaceCharsInMsg(data: string, msgs = []) {
        for (let i = 0; i < msgs.length; i++) {
            data = data.replace(/%s/, msgs[i]);
        }
        return data;
    }

    async_call(fx: Function, time = 0) {
        let tid = setTimeout(() => { fx(); clearTimeout(tid); }, time);
    }
    messageDialog(title: string, message: string, callback?: Function) {
        this.notifyAll({ key: 'messageDialog', value: { title: title, message: message, callback: callback } });
    }

    async messageDialogByMessageId(messageId: any, msgArray = []) {
        let messageData: any = await this.getMessage(messageId, msgArray);
        this.notifyAll({ key: 'messageDialog', value: { title: messageData.title, message: messageData.message } });
    }
    confirmDialog(title: string, message: string, yesCallback?, noCallback?) {
        this.notifyAll({ key: 'confirmDialog', value: { title: title, message: message, yesCallback: yesCallback, noCallback: noCallback } });
    }

    async confirmDialogByMessageId(messageId: any, msgArray = []) {
        let messageData: any = await this.getMessage(messageId, msgArray);
        return this.confirmDialogPromise(messageData.title, messageData.message);
    }
    confirmDialogPromise(title: string, message: string) {
        return this.confirmDialogInstance.showDialogPromise(title, message);
    }
    confirmDialogOkPromise(title: string, message: string) {
        return this.confirmDialogOkInstance.showOkDialogPromise(title, message);
    }

    showMessage(message: string) {
        this.notifyAll({ key: 'message', value: message });
        this.async_call(() => { this.notifyAll({ key: 'message', value: '' }); }, 10000);
    }
    notifyAll(obj: { key: string, value?: any }) {
        this.notifier$.next(obj);
    }
    errorHandler(obj: any) {
        this.overlay(false);
        this.notifyAll({ key: 'error', value: obj.statusText || 'Invalid Url' });
        return Observable.throw(obj);
    }

    hideOverlay(obj) {
        this.overlay(false);
        this.notifyAll({ key: 'error', value: obj.error || '' });
    }
    getUrl(url, params) {
        let paramList = [];
        for (let prop in params) {
            paramList.push(prop + '=' + params[prop]);
        }
        return url + '?' + paramList.join('&');
    }
    get(url): Observable<any> {
        //this.overlay(true);
        jQuery('.overlay').show();
        if (this.fromFile && (url.indexOf('HCRS') !== -1 || url.indexOf('hcrs') !== -1)) {
            /* return this.http.get(this.getBaseUrl() + 'api/User/GetDataFromFile?fileName=' + url.split('/')[0])
                 .map(res => res.json())
                 .map(res => JSON.parse(res))
                 .do(this.hideOverlay.bind(this))
                 .catch(this.errorHandler.bind(this)); */
            return this.getWithErrorMessageOld(this.getBaseUrl() + 'api/User/GetDataFromFile?fileName=' + url.split('/')[0]);
        }
        /* return this.http.get(this.getBaseUrl() + url)
             .map(res => res.json())
             .do(this.hideOverlay.bind(this))
             .catch(this.errorHandler.bind(this)); */
        return this.getWithErrorMessageOld(this.getBaseUrl() + url);
    }

    getWithErrorMessageOld(url): Observable<any> {
        //this.overlay(true);       
        return this.http.get(url)
            .map(res => {
                jQuery('.overlay').hide();
                res = res.json();
                if (res['Oracle.ManagedDataAccess.Client.OracleException']) {
                    let error: any = {};
                    let errorORACode: string = '';
                    let errorCode: string = '';
                    let errorText: string = '';

                    var msg = res['Oracle.ManagedDataAccess.Client.OracleException'];
                    msg = msg[0]['m_message'];
                    msg = msg.substr(msg.indexOf('Message'), msg.length);
                    errorORACode = msg.split(':')[1];
                    errorText = msg.split(':')[2];
                    errorText = errorText.split('\n')[0];
                    errorCode = errorORACode.substr(4);
                    /* errorCode = msg[0]['m_number'];
                     msg = msg[0]['m_message'];
                     if (msg.includes("ORA-20000")) {
                         msg = msg.split(',')[2];
                         errorText = msg.split(':')[2];
                         errorText = errorText.split('\n')[0];
                     }
                     else {
                         errorText = msg.split(':')[1];
                         errorText = errorText.split('\n')[0];
                     }*/

                    var err = { "ExceptionMessage": errorCode + ":::" + errorText };
                    throw JSON.stringify(err);
                }
                else return res;

            }).do(this.hideOverlay.bind(this));

    }



    getModifiedParams(params, orderBy: string) {
        let mp: any = { i_pageSize: params.pageSize, i_pageNumber: params.pageNo };
        const arr = params.sort.split('|');
        mp.i_sortingColumn = arr[0] || orderBy;
        mp.i_orderBy = arr[1] || 'ASC';
        return mp;
    }
    getDummyData1(query: string) {
        this.overlay(true);
        return this.http.get(this.getBaseUrl() + 'api/user/getDummyData1?query=' + query)
            .map(res => res.json())
            //.map(res => JSON.parse(res.data))
            .do(this.hideOverlay.bind(this));
    }
    getDummyData2(query: string) {
        this.overlay(true);
        return this.http.get(this.getBaseUrl() + 'api/user/getDummyData2?query=' + query)
            .map(res => res.json())
            .map(res => ({ data: JSON.parse(res.data), totalRows: res.totalRows }))
            .do(this.hideOverlay.bind(this));
    }

    getMenuItems(url): Observable<MenuItem[]> {
        return this.http.get(this.getBaseUrl() + url)
            .map(res => <MenuItem[]>res.json())
            .catch(this.handleError);
    }

    private handleError(error: any) {
        let errMsg = (error.message) ? error.message :
            error.status ? `${error.status} - ${error.statusText}` : 'Server error';
        console.error(errMsg); // log to console instead
        return Observable.throw(errMsg);
    }

    getWithErrorMessage(url): Observable<any> {
        //this.overlay(true);
        jQuery('.overlay').show();
        return this.http.get(this.getBaseUrl() + url)
            .map(res => {
                jQuery('.overlay').hide();
                res = res.json();

                let error: any = {};
                let errorCode: string = '';
                let errorORACode: string = '';
                let errorText: string = '';

                if (res['Oracle.ManagedDataAccess.Client.OracleException']) {
                    var msg = res['Oracle.ManagedDataAccess.Client.OracleException'];

                    msg = msg[0]['m_message'];
                    if (msg.includes('Message')) {
                        msg = msg.substr(msg.indexOf('Message'), msg.length);
                        errorORACode = msg.split(':')[1];
                        errorText = msg.split(':')[2];
                        errorText = errorText.split('\n')[0];
                        errorCode = errorORACode.split("-")[1];
                    }
                    else {
                        errorORACode = msg.split(':')[0];
                        errorText = msg.split(':')[1];
                        if (errorText.includes('\n')) errorText = errorText.split('\n')[0];
                        errorCode = errorORACode.split("-")[1];
                    }


                    /* if (msg.includes("ORA-20000")) {
                         msg = msg.split(',')[2];
                         errorORACode = msg.split(':')[1];
                         errorText = msg.split(':')[2];
                         errorText = errorText.split('\n')[0];
                     }
                     else {
                         errorORACode = msg.split(':')[1];
                         errorText = msg.split(':')[1];
                         errorText = errorText.split('\n')[0];
                     }*/

                    //JSON.stringify(err);
                    throw { errorDbCode: errorCode, errorDbText: errorText, errorORACode: errorORACode };
                }
                else if (res['ExceptionMethod']) {
                    errorCode = "Custom-0001";
                    errorText = "Procedure name does not exist";
                    errorORACode = "Custom-0001";

                    //JSON.stringify(err);
                    throw { errorDbCode: errorCode, errorDbText: errorText, errorORACode: errorORACode };
                }
                // Successful run with data from database
                else return res;

            }).do(this.hideOverlay.bind(this));

    }

    getWithErrorMessage_lastrun(url): Observable<any> {
        //this.overlay(true);
        jQuery('.overlay').show();
        return this.http.get(this.getBaseUrl() + url)
            .map(res => {
                jQuery('.overlay').hide();
                res = res.json();
                if (res['Oracle.ManagedDataAccess.Client.OracleException']) {
                    let error: any = {};
                    let errorCode: string = '';
                    let errorORACode: string = '';
                    let errorText: string = '';
                    var msg = res['Oracle.ManagedDataAccess.Client.OracleException'];

                    msg = msg[0]['m_message'];
                    if (msg.includes('Message')) {
                        msg = msg.substr(msg.indexOf('Message'), msg.length);
                        errorORACode = msg.split(':')[1];
                        errorText = msg.split(':')[2];
                        errorText = errorText.split('\n')[0];
                        errorCode = errorORACode.split("-")[1];
                    }
                    else {
                        errorORACode = msg.split(':')[0];
                        errorText = msg.split(':')[1];
                        if (errorText.includes('\n')) errorText = errorText.split('\n')[0];
                        errorCode = errorORACode.split("-")[1];
                    }


                    /* if (msg.includes("ORA-20000")) {
                         msg = msg.split(',')[2];
                         errorORACode = msg.split(':')[1];
                         errorText = msg.split(':')[2];
                         errorText = errorText.split('\n')[0];
                     }
                     else {
                         errorORACode = msg.split(':')[1];
                         errorText = msg.split(':')[1];
                         errorText = errorText.split('\n')[0];
                     }*/

                    var err = { errorDbCode: errorCode, errorDbText: errorText, errorORACode: errorORACode };
                    throw err;//JSON.stringify(err);
                }
                else return res;

            }).do(this.hideOverlay.bind(this));

    }

    getFromController(url: any): Observable<any> {
        this.overlay(true);
        return this.http.get(this.getBaseUrl() + url)
            .map(res => {
                return res;
            }).do(res => {
            });
    }

    /*  errorHandlerMessage(obj: any) {
          this.overlay(false);
          //this.notifyAll({ key: 'error', value: obj.statusText || 'Invalid Url' });
          let error: any = {};
         // let result: any = JSON.parse(obj._body);
          error.errorDbCode =  result.ExceptionMessage.split(':')[0];
          error.errorDbText = result.ExceptionMessage.split(':')[3]; 
          return Observable.throw(error);
      } */

    getInterval(url, interval = 1000) {
        return Observable.interval(interval).switchMap(res => this.http.get(this.getBaseUrl() + url)
            .map(res => res.json()));
    }

    postWithErrorMessage(url, data): Observable<any> {
        // this.overlay(true); 
        return this.http.post(this.getBaseUrl() + url, JSON.stringify(data), { headers: this.headers })
            .map(res => {
                res = res.json();
                if (res['Oracle.ManagedDataAccess.Client.OracleException']) {
                    let error: any = {};
                    let errorCode: string = '';
                    let errorORACode: string = '';
                    let errorText: string = '';
                    var msg = res['Oracle.ManagedDataAccess.Client.OracleException'];

                    msg = msg[0]['m_message'];
                    if (msg.includes('Message')) {
                        msg = msg.substr(msg.indexOf('Message'), msg.length);
                        errorORACode = msg.split(':')[1];
                        errorText = msg.split(':')[2];
                        errorText = errorText.split('\n')[0];
                        errorCode = errorORACode.split("-")[1];
                    }
                    else {
                        errorORACode = msg.split(':')[0];
                        errorText = msg.split(':')[1];
                        if (errorText.includes('\n')) errorText = errorText.split('\n')[0];
                        errorCode = errorORACode.split("-")[1];
                    }

                    var err = { errorDbCode: errorCode, errorDbText: errorText, errorORACode: errorORACode };
                    throw err;
                }
                else return res;
            })
            .do(this.hideOverlay.bind(this));
    }

    post(url, data): Observable<any> {
        this.overlay(true);
        return this.http.post(this.getBaseUrl() + url, JSON.stringify(data), { headers: this.headers })
            .map(res => res.json())
            .do(this.hideOverlay.bind(this))
            .catch(this.errorHandler.bind(this));
    }

    upload(url, model: any) {
        url = this.getBaseUrl() + url;
        return Observable.fromPromise(new Promise((resolve, reject) => {

            let formData: FormData = new FormData();
            let xhr: XMLHttpRequest = new XMLHttpRequest();
            let map: Map<string, any> = new Map<string, any>();
            for (var prop in model) {
                if (prop === 'FILES') {
                    for (var fileProp in model[prop]) {
                        map.set(fileProp, '');
                        if (!(model[prop][fileProp] && model[prop][fileProp].length > 0)) {
                            continue;
                        }

                        if (model[prop][fileProp].length == 1) {
                            formData.append(fileProp, model[prop][fileProp][0], model[prop][fileProp][0].name);
                        }
                        else {
                            model[prop][fileProp].forEach((file: File) => {
                                formData.append(fileProp + '[]', file, file.name);
                            });
                        }
                    }
                } else if (!map.has(prop) && model[prop]) {
                    formData.append(prop, model[prop]);
                }
            }

            xhr.onreadystatechange = () => {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        resolve(JSON.parse(xhr.response));
                    } else {
                        reject(xhr.response);
                    }
                }
            };
            xhr.open('POST', url, true);
            //xhr.setRequestHeader('Content-Type', 'application/json');    

            //xhr.setRequestHeader('Authorization', 'Bearer api_token' + this.getToken());
            xhr.send(formData);

        }));
    }
    overlay(show) {
        //if (!this.overLayElement) {
        //    this.overLayElement = jQuery('.overlay');
        //}
        if (show) {
            jQuery('.overlay').show();
        } else {
            jQuery('.overlay').hide();
        }
    }

    //common functions


    async checkSystemEnabled(agency_cd: any) {
        let error: any = null;
        let errorCode: string = '';
        let errorText: string = '';
        let status: any = null;
        try {

            status = await this.get(`sdalhpkg_fe_profile.f_get_system_status/json?i_agency_type=${agency_cd}`).toPromise();
        } catch (ex) {
            errorCode = error.ExceptionMessage.split(':')[0];
            errorText = error.ExceptionMessage.split(':')[3];
        }
        if (error) {
            this.messageDialogByMessageId(CONSTANTS.SYSTEM_STAT_ERROR, [errorCode, errorText]);
            return false;
        }
        if (status.ReturnValue === CONSTANTS.LOCKED_STATUS) {
            this.messageDialogByMessageId(CONSTANTS.SYSTEM_IS_LOCKED);
            return false;

        }
        return true;
    }
    async checkTemplateUpdating(args: any) {
        let error: any = null;
        let errorCode: string = '';
        let errorText: string = '';
        let status: any = null;
        try {
            status = await this.get(`sdalhPKG_UI_MEDICAID_CALC_PRICES.P_CHECK_TEMPLATE_EDIT/json?i_prfl_id=${args.prfl_id}`).toPromise();
        }
        catch (ex) {
            errorCode = error.ExceptionMessage.split(':')[0];
            errorText = error.ExceptionMessage.split(':')[3];
        }
        if (error) {
            this.messageDialogByMessageId(CONSTANTS.TEMPLATE_STATUS_ERROR, [errorCode, errorText]);
            return true;
        }
        if (status.OutputParameters.O_RESULT < 0) {
            this.messageDialogByMessageId(CONSTANTS.TEMPLATE_PROCESSING_PRICES);
            return true;
        }

        return false;
    }

    /**
     * Ref# n_cst_profile : GP\gpc_common.xlsx
     */


    public async getUserAccessData() {
        const currentUserName = await this.get('api/User/GetDbUserName').toPromise();
        var url = "sdalhPKG_UI_COMMON.P_USER_ACCESS_S/json?i_as_userid=" + currentUserName
            + "&i_ai_app_id=" + CONSTANTS.APP_ID;
        // --- nedd to change this package name .this should be under a common pacakge
        return await this.get(url).map(
            res => { return res.ResultSets[0]; }

        ).toPromise();
    }


    //GP\gpc_common.xlsx ->of_GetAccess()
    public async ofGetAccess(as_tag: any) {

        var ls_access, ll_row; // ll_row contains row
        //Find the access item for this user

        ll_row = await this.getUserAccessData();

        ll_row = ll_row.filter(function (item) {
            return item['MENU_NM'] == as_tag;
        });

        ls_access = CONSTANTS.ACCESS_NONE; //by default
        if (ll_row.length > 0) {

            switch ((ll_row[0]).INQ_ONLY_FLG) {

                case CONSTANTS.YES:
                    ls_access = CONSTANTS.ACCESS_INQUIRY; // I                    
                    break;
                case CONSTANTS.NO:
                    ls_access = CONSTANTS.ACCESS_FULL; // F                    
                    break;
                default:
                    ls_access = CONSTANTS.ACCESS_NONE; // N

            }
        }
        return ls_access;
    }

    public async ofGetAccessByTitleId(as_title: any, menuID) {
        var permission = true;
        var of_setUpdateable = true;
        var ls_access, ll_row; // ll_row contains row
        //Find the access item for this user
        var is_wintitle_prefix, is_wintitle_suffix;

        ll_row = await this.getUserAccessData();

        ll_row = ll_row.filter(item => item['MENU_ID'] === menuID);
        // console.log((ll_row[0]).INQ_ONLY_FLG);
        ls_access = CONSTANTS.ACCESS_NONE; //by default
        if (ll_row.length > 0) {

            switch ((ll_row[0]).INQ_ONLY_FLG) {

                case CONSTANTS.YES:
                    ls_access = CONSTANTS.ACCESS_INQUIRY; // I                    
                    is_wintitle_suffix = " - Inquiry";
                    of_setUpdateable = false;
                    break;
                case CONSTANTS.NO:
                    ls_access = CONSTANTS.ACCESS_FULL; // F    
                    is_wintitle_suffix = " - Maintenance";
                    of_setUpdateable = true;
                    break;
                default:
                    ls_access = CONSTANTS.ACCESS_NONE; // N

            }
        }
        return ls_access;
        //return {
        //    windowTitle: is_wintitle_suffix,
        //    userPermission: permission,
        //    isUpdatable: of_setUpdateable,
        //    isAccess: ls_access
        //};
    }



    /**
     * function name:  w_hcrs_sheet
     * Ref# n_cst_profile : Common\misc_common.xlsx
     * @param Tag
     * @param title
     
     */


    public async  getUserPermission(Tag: any, title: any) {
        /* return value will be a object which contains  'title', 'permission','isUpdatable' ,
         where the permission(boolean) value will indicate whether user has permission or not
         if the user has no permission then close the window .
        And isUpdatable represents if the user can modify data or not, means if the data will be readonly or not*/

        var permission = true;
        var of_setUpdateable = true;

        // security variables
        var is_access, is_wintitle_prefix, is_wintitle_suffix;

        // for windows that do not require security check e.g. reporting windows
        // set it false
        is_access = await this.ofGetAccess(Tag);
        /* var ib_checksecurity = true;
 
         if (ib_checksecurity) {
             //check window security
             is_access = await this.ofGetAccess(Tag);
         }
         else {
             is_access = CONSTANTS.ACCESS_INQUIRY;
         } */


        // save the original title
        is_wintitle_prefix = title;
        is_wintitle_suffix = title;


        switch (is_access) {
            case CONSTANTS.ACCESS_INQUIRY:
                is_wintitle_suffix = " - Inquiry";
                of_setUpdateable = false;
                break;
            case CONSTANTS.ACCESS_FULL:
                is_wintitle_suffix = " - Maintenance";
                of_setUpdateable = true;
                break;

            default:
                permission = false;
                var msg = `Your security privileges do not allow you to access this window.
                    Your current access to menu `+ Tag + ` is ` + is_access + `.
                        Please contact the system manager to update your priviliges. !`;
                this.messageDialog(title, msg);

        }

        //title = is_wintitle_prefix + is_wintitle_suffix;
        title = is_wintitle_suffix.substring(3, is_wintitle_suffix.length);;
        return {
            windowTitle: title,
            userPermission: permission,
            isUpdatable: of_setUpdateable,
            isAccess: is_access
        };

    }
    public ofGetAccess$(as_tag: any): Observable<any> {

        var ls_access, ll_row;

        return this.get('api/User/GetDbUserName').flatMap(currentUserName => {
            var url = "sdalhPKG_UI_COMMON.P_USER_ACCESS_S/json?i_as_userid=" + currentUserName + "&i_ai_app_id=" + CONSTANTS.APP_ID;
            return this.get(url).map(res => { return res.ResultSets[0]; })
        }).map(data => {
            ll_row = data.filter(item => item.MENU_ID == as_tag);

            ls_access = CONSTANTS.ACCESS_NONE; //by default
            if (ll_row.length > 0) {

                switch ((ll_row[0]).INQ_ONLY_FLG) {

                    case CONSTANTS.YES:
                        ls_access = CONSTANTS.ACCESS_INQUIRY; // I                    
                        break;
                    case CONSTANTS.NO:
                        ls_access = CONSTANTS.ACCESS_FULL; // F                    
                        break;
                    default:
                        ls_access = CONSTANTS.ACCESS_NONE; // N

                }
            }
            return ls_access;
        });
    }
    public getUserPermission$(Tag: any, title: any): Observable<any> {

        return this.ofGetAccess$(Tag).map(res => {
            let of_setUpdateable = false;
            let is_wintitle_suffix = ' - Inquiry';
            let permission = true;
            switch (res) {
                case CONSTANTS.ACCESS_INQUIRY:
                    is_wintitle_suffix = " - Inquiry";
                    of_setUpdateable = false;
                    break;
                case CONSTANTS.ACCESS_FULL:
                    is_wintitle_suffix = " - Maintenance";
                    of_setUpdateable = true;
                    break;

                default:
                    permission = false;
                    var msg = `Your security privileges do not allow you to access this window.
                    Your current access to menu `+ Tag + ` is ` + res + `.
                        Please contact the system manager to update your priviliges. !`;
                    this.messageDialog(title, msg);

            }
            return {
                windowTitle: title + is_wintitle_suffix,
                userPermission: permission,
                isUpdatable: of_setUpdateable,
                isAccess: res
            };

        });
    }
    get$(url): Observable<any> {
        this.overlay(true);
        return this.http.get(this.getBaseUrl() + url)
            .map((res: any) => {
                res = res.json();
                if (res.ClassName) {
                    if (res['Oracle.ManagedDataAccess.Client.OracleException']) {
                        let error: any = {};
                        let errorORACode: string = '';
                        let errorCode: string = '';
                        let errorText: string = '';

                        var msg = res['Oracle.ManagedDataAccess.Client.OracleException'];
                        errorCode = msg[0]['m_number'];
                        msg = msg[0]['m_message'];
                        if (msg.includes("ORA-20000")) {
                            msg = msg.split(',')[2];
                            errorText = msg.split(':')[2];
                            errorText = errorText.split('\n')[0];
                        }
                        else {
                            errorText = msg.split(':')[1];
                            errorText = errorText.split('\n')[0];
                        }
                        this.hideOverlay({ error: errorText });
                        throw { errorCode, errorText };
                    }
                    this.hideOverlay({ error: res.Message });
                    throw { errorCode: '', errorText: res.Message };
                }
                else return res;

            }).do(this.hideOverlay.bind(this));

    }


    /* of_InsertPrcssQueue
     //Ref #Sanofgpcs\02-System Documentation\03-Design Specificaiton-DS\Common\misc_common.xlsx
    */
    async getInsertProcessData(batch_id: any) {
        let pkgRootUrl = "sdalhPKG_UI_UTILIZATION_RBT_CLM_VLD.";
        var BatchsortBy = "BATCH_ID";
        var orderBy = "ASC";
        let pageNo = 1;
        let pageSize = 20;
        var batchUrl = pkgRootUrl + "p_d_batch_id_select_s/json?i_batch_id=" + batch_id + "&i_pageNumber=" +
            pageNo + "&i_pageSize=" + pageSize +
            "&i_sortingColumn=" + BatchsortBy + "&i_orderBy=" + orderBy;
        var data: any = await this.get(batchUrl).toPromise();
        return data;
    }
    public async insertPrcssQueue(ai_batch_id: any) {
        let Dataobj = await this.getInsertProcessData(ai_batch_id);
        let ids_batch_id;
        let error: any = null;
        let errorCode: string = '';
        let errorText: string = '';
        let status: any = null;
        let queueID = 6807;
        var orderBy = "ASC";
        let params = {};
        let pageNo = 1;
        let pageSize = 20;

        let ls_msg = [];
        let ll_batch_row, ll_queue_row, ll_rc, ll_queue_id;

        if (ai_batch_id == null)
            return -1;
        ids_batch_id = (Dataobj.ResultSets[0]);

        ll_batch_row = ids_batch_id.length;
        if (ll_batch_row != 1)
            return -1;
        // Get the next key for the process queue table
        var nextKey = "sdalhPKG_UI_UTILIZATION_PPAYMENT.p_dual/json";
        try {
            var nextKeyObj = await this.getWithErrorMessage(nextKey).toPromise();

        }
        catch (ex) {
            if (ex.errorDbCode != 0) {
                let msg = "Unable to get a sequence number for a new batch request.SQL Error: " + ex.errorDbText;
                this.messageDialog("pfc_systemerror", "" + msg);
                return - 2;
            }
        }
        ll_queue_id = nextKeyObj.ResultSets[0][0].NEXTVAL;
        // let ids_queue_id;
        let currentUserName: string;
        currentUserName = await this.getDbUserName().toPromise();
        let todayDate = moment(Date.now()).format('MM/DD/YYYY');
        // ids_queue_id = Dataobj[1].ResultSets[0];
        var insertUrl = "sdalhPKG_UI_UTILIZATION_RBT_CLM_VLD.p_d_upd_prcss_queue_i/json?i_prcss_queue_id=" + ll_queue_id +
            "&i_user_id=" + currentUserName + "&i_exec_nm=" + ids_batch_id[ll_batch_row - 1]['EXEC_NM'] +
            "&i_dstn_prtr=" + "" + "&i_exec_tm=" + todayDate + "&i_prcss_stat=" + "NEW" +
            "&i_prcss_stat_dt=" + todayDate + "&i_restart_cnt=" + ids_batch_id[ll_batch_row - 1]['RESTART_LIMIT'] +
            "&i_load_to_db_flg=" + "N" + "&i_restart_step=" + 1;

        let db_row = await this.getLlQueueRow(insertUrl).toPromise();
        if (db_row.OutputParameters.O_RESULT) {
            ll_queue_row = db_row.OutputParameters.O_RESULT; //ids_queue_id.insert()

            if (ll_queue_row == -1)
                return - 2;

            ll_rc = db_row.OutputParameters.O_RESULT;
            if (ll_rc < 0) {
                this.messageDialog(CONSTANTS.HCRS_TITLE, "Queue ID insert failed. RC =  " + ll_rc);
                return - 2;
            }
        }

        return ll_queue_id;
    }
    private getDbUserName() {
        return this.get('api/User/GetDbUserName').map(res => {
            return res;
        });
    }
    private getLlQueueRow(url) {
        return this.get(url).map(res => {
            return res;
        });
    }
    //end of of_InsertPrcssQueue


    /*of_submitpurcalc
     //Ref #Sanofgpcs\02-System Documentation\03-Design Specificaiton-DS\Common\n_cst_pur.xlsx
     */
    async submitPurCalc(anv_pur_attrib: any, ab_apprvd_formula: any) {
        if (await this.confirmDialogPromise("PUR Calculation", "Do you want to submit this PUR Calculation request?")) {
        }
        else return 0;

        const approved = 'APPROVED';
        const unapproved = 'UNAPPROVED';
        let approvedStatus = ab_apprvd_formula === null ? approved : unapproved;
        const batchId = '1006';
        let queueId = await this.insertPrcssQueue(batchId);
        if (queueId < 1) {
            this.messageDialogByMessageId(CONSTANTS.SUBMIT_BATCH_ERROR);
            let rollbackUrl = `sdalhPKG_UI_COMMON.P_ROLLBACK/json`;
            const status = this.get(rollbackUrl).toPromise();
            return 0;
        }
        let requestUrl = `sdalhPKG_UI_MEDICAID_CALC_PRICES.P_CALCPRICES_CALCURA_REQUEST_S/json`;
        let request = await this.get(requestUrl).toPromise();
        const requestData: any[] = request.ResultSets[0];

        let li_rc;
        for (let i = 0; i < anv_pur_attrib.length; i++) {
            let priceIndex = anv_pur_attrib[i].ii_period_id;
            let success = await this.isPriceIndex(priceIndex);
            if (success === 0) {
                let rollbackUrl = `sdalhPKG_UI_COMMON.P_ROLLBACK/json`;
                const status = this.get(rollbackUrl).toPromise();
                return 0;
            }
            // ensure that user does not submit more than 1 pur calc per product/period (just different activation flags)
            let findList: any[] = requestData.filter(x =>
                x.NDC_LBL == anv_pur_attrib[i].is_ndc_lbl
                && x.NDC_PROD == anv_pur_attrib[i].is_ndc_prod
                && x.periodId == anv_pur_attrib[i].ii_period_id);

            if (findList.length > 0) {
                let qtr = await this.getPeriod(priceIndex, 'quarter');
                this.messageDialog("Duplicate Selection", `You can only submit one calculation per product/period.<br><br>
                                Product ${anv_pur_attrib[i].is_ndc_lbl}-${anv_pur_attrib[i].is_ndc_prod} is selected more than once for period ${qtr}. Please select only one row per product/period.`);
                return 0;
            }

            //Delete the row from PUR_CALC_REQUEST_T if it already exists
            let requestTypeCd = CONSTANTS.PUR;
            let deleteUrl = `sdalhPKG_FE_PUR2.P_DELETE_CALC_REQ/json?i_ndc_lbl=${anv_pur_attrib[i].is_ndc_lbl}&i_ndc_prod=${anv_pur_attrib[i].is_ndc_prod}&i_period_id=${anv_pur_attrib[i].ii_period_id}&i_req_typ_cd=${requestTypeCd}`;
            try { let res = await this.getWithErrorMessage(deleteUrl).toPromise(); }
            catch (ex) {
                if (ex.errorDbCode < 0) {
                    let msg: any = this.messageDialogByMessageId(CONSTANTS.SUBMIT_PUR_ERROR, [ex.errorDbCode, ex.errorDbText]);
                    return 0;
                }

            }

            let insertUrl = `sdalhPKG_UI_MEDICAID_CALC_PRICES.P_CALCPRICES_CALCURA_REQUEST_I/json?i_prcss_queue_id=${+queueId}&i_ndc_lbl=${anv_pur_attrib[i].is_ndc_lbl}&i_ndc_prod=${anv_pur_attrib[i].is_ndc_prod}&i_period_id=${anv_pur_attrib[i].ii_period_id}&i_activ_ready=${anv_pur_attrib[i].is_activ_ready}`;
            try { await this.getWithErrorMessage(insertUrl).toPromise(); }
            catch (ex) {
                li_rc = false;
            }

        }    // End of for loop

        if (li_rc === false) {
            let rollbackUrl = `sdalhPKG_UI_COMMON.P_ROLLBACK/json`;
            this.get(rollbackUrl).toPromise();
        }
        else {
            let commitUrl = `sdalhPKG_UI_COMMON.P_COMMIT/json`;
            this.get(commitUrl).toPromise();
        }
        return 1;
    }

    /*of_isPriceIndex(integer ai_period_id)
    //Ref #Sanofgpcs\02-System Documentation\03-Design Specificaiton-DS\Common\n_cst_pur.xlsx
    */
    async isPriceIndex(periodId: string) {
        if (periodId === null) {
            return 0;
        }

        let url = `sdalhPKG_UI_MEDICAID_CALC_PRICES.P_CALCPRICES_URA_PERIOD_L_S/json?i_period_id=${periodId}`;
        let result: any;
        try { result = await this.getWithErrorMessage(url).toPromise(); }
        catch (ex) {
            this.messageDialog(CONSTANTS.HCRS_TITLE, `Internal error! Unable to get qtr and year for period_id (${periodId}).`);
            return 0;
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
        //Check PPI for month/year
        let msgs: any[] = [liQtr, liYear];
        let ppiUrl = `sdalhpkg_fe_pur.f_check_ppi/json?i_year=${liYear}&i_mth=${liMonth}`;
        try { await this.get(ppiUrl).toPromise(); }
        catch (ex) {
            this.messageDialogByMessageId(CONSTANTS.PPI_NOT_FOUND, [ex.errorDbCode, ex.errorDbText]);
            return 0;
        }
        //Check CPI for month/year
        let cpiUrl = `sdalhpkg_fe_pur.f_check_cpi/json?i_year=${liYear}&i_mth=${liMonth}`;
        try { await this.getWithErrorMessage(cpiUrl).toPromise(); }
        catch (ex) {
            this.messageDialogByMessageId(CONSTANTS.CPI_NOT_FOUND, [ex.errorDbCode, ex.errorDbText]);
            return 0;
        }
        return 1;
    }


    /*of_getPeriod(string ai_period_id,string string as_column)
    //Ref #Sanofgpcs\02-System Documentation\03-Design Specificaiton-DS\Common\n_cst_pur.xlsx
    */
    async getPeriod(ai_period_id: string, column: String) {
        let rc: any;
        if (ai_period_id === null || column === null) {
            rc = null;
            return rc;
        }
        let url = `sdalhPKG_UI_MEDICAID_CALC_PRICES.P_CALCPRICES_CALCURA_CHILD_S/json?i_period_id=${ai_period_id}`;
        let res: any = await this.get(url).toPromise();
        let ids_periods: any[] = res.ResultSets[0];
        let ll_find: any[] = ids_periods.filter(x => x.AI_PERIOD_ID == ai_period_id);

        if (ll_find.length < 1) {
            let url = `sdalhPKG_UI_MEDICAID_CALC_PRICES.P_CALCPRICES_URA_PERIOD_P_S/json?i_period_id=${ai_period_id}`;
            try { this.getWithErrorMessage(url).toPromise(); }
            catch (ex) {
                rc = null;
                return rc;
            }
        }
        else {
            rc = ids_periods[ll_find.length].QUARTER;
        }
        return rc;
    }

    //pb file location common/object_common
    public f_validate_dates(adw_datawindow: any, ab_gaps_allowed: boolean, as_keycolname: string, al_error_row: number): number {
        let l_row: number = 0;
        let l_keyrow: number = 0;
        let l_rowcount: number;
        let s_key: string;
        let s_priorkey: string;
        let dt_eff_dt: Date;
        let dt_end_dt: Date;
        let dt_prior_end_dt: Date;
        let ls_key_col: string;
        let ls_key_col2: string;
        let ls_key2: string;
        let ls_prior_key2: string;
        let ls_col: string;
        let ll_pos: number;
        let ll_key2: number;


        l_rowcount = adw_datawindow.length;
        dt_prior_end_dt = new Date(1699, 11, 31);

        if (l_rowcount < 1) return 0;

        ls_key_col = as_keycolname; // pgm_id A, ndc
        ll_pos = this.pos(ls_key_col, ",");
        if (ll_pos > 0) {
            ls_key_col = as_keycolname.substr(ll_pos + 2).trim();
            ls_key_col2 = as_keycolname.substr(0, as_keycolname.indexOf(" A,"));
            ls_col = typeof ls_key_col2;
            if (ls_col === 'string') {
                ls_key2 = adw_datawindow[l_row][ls_key_col2];
                ls_prior_key2 = ls_key2;
            } else if (ls_col === 'number') {
                ll_key2 = adw_datawindow[l_row][ls_key_col2];
                ls_prior_key2 = ll_key2.toString();
            }
        }

        s_key = s_key;
        s_key = adw_datawindow[l_row][ls_key_col];

        if (s_key === null || ll_key2 === null) {
            al_error_row = l_row;
            return 3;
        }

        s_priorkey = s_key;
        if (ll_pos > 0) {
            while (l_row < l_rowcount) {
                if (ls_prior_key2 === ls_key2 && s_key === s_priorkey) {
                    dt_eff_dt = new Date(adw_datawindow[l_row].effectiveDate);
                    dt_end_dt = new Date(adw_datawindow[l_row].endDate);

                    if (dt_eff_dt <= dt_prior_end_dt) {
                        al_error_row = l_row;
                        return 1;
                    }

                    if (!ab_gaps_allowed && l_keyrow > 0) {
                        if (dt_eff_dt !== new Date(dt_prior_end_dt.setDate(dt_prior_end_dt.getDate() + 1))) {
                            al_error_row = l_row;
                            return 2;
                        }
                    }

                    dt_prior_end_dt = dt_end_dt;
                    l_row++;
                    l_keyrow++;
                    if (l_row < l_rowcount) {
                        s_key = adw_datawindow[l_row][ls_key_col];
                        if (ls_col === 'string') {
                            ls_key2 = adw_datawindow[l_row][ls_key_col2];
                        } else {
                            ll_key2 = adw_datawindow[l_row][ls_key_col2];
                            ls_key2 = ll_key2.toString();
                        }

                        if (s_key === null || ls_key2 === null) {
                            al_error_row = l_row;
                            return 3;
                        }
                    }
                    else {
                        s_priorkey = s_key;
                        ls_prior_key2 = ls_key2;
                        dt_prior_end_dt = new Date(1699, 11, 31);
                        l_keyrow = 0;
                    }
                }
            }
        } else {
            // todo next day 17/1//2017
            while (l_row < l_rowcount) {
                if (s_key === s_priorkey) {
                    dt_eff_dt = new Date(adw_datawindow[l_row].effectiveDate);
                    dt_end_dt = new Date(adw_datawindow[l_row].endDate);

                    if (dt_eff_dt <= dt_prior_end_dt) {
                        al_error_row = l_row;
                        return 1;
                    }

                    if (!ab_gaps_allowed && l_keyrow > 0) {
                        if (dt_eff_dt !== new Date(dt_prior_end_dt.setDate(dt_prior_end_dt.getDate() + 1))) {
                            al_error_row = l_row;
                            return 2;
                        }
                    }

                    dt_prior_end_dt = dt_end_dt;
                    l_row++;
                    l_keyrow++;
                    if (l_row < l_rowcount) {
                        s_key = adw_datawindow[l_row][ls_key_col];
                        if (s_key === null) {
                            al_error_row = l_row;
                            return 3;
                        }
                    }
                } else {
                    s_priorkey = s_key;
                    dt_prior_end_dt = new Date(1699, 11, 31);
                    l_keyrow = 1;
                }
            }
        }

        // column sort will be done later
        return 0;
    }

    public pos(str: string, ch: string): number {
        return str.indexOf(ch);
    }

    // common canDeactiveGaurd

    public giveWarningOnChangeNavigation(): Promise<boolean> | boolean {
        if (!this.isSavedPending) return true;
        return new Promise((resolve, reject) => {
            jQuery('.modal').on('shown.bs.modal', (e: any) => {
                jQuery('.modal-header .close').hide();
            });
            this.confirmDialogPromise('Warning', 'You have unsaved data. Your data will be lost.<br>Do you want to leave?').then((res) => {
                jQuery('.modal').off('shown.bs.modal');
                jQuery('.modal-header .close').show();

                let val: boolean = !!res;
                if (val) {
                    this.get(`sdalhPKG_UI_COMMON.P_ROLLBACK/json?`).subscribe();
                    this.isSavedPending = false;
                    resolve(val);
                }
                else {
                    resolve(val);
                }

            });
        });
    }
    //Misc_common  //nvo_submit_batch

    public async constructorSubmitBatch(batch_id, queueID, ls_parms) {
        var BatchsortBy = "BATCH_ID";
        // let queueID = 6807;
        var orderBy = "ASC";
        let params = {};
        let pageNo = 1;
        let pageSize = 20;
        let QueuesortBy = 'EXEC_NM';
        let ParamsortBy = 'PRCSS_QUEUE_ID';


        var batchUrl = "sdalhPKG_UI_UTILIZATION_PPAYMENT.P_D_BATCH_ID_SELECT_S/json?i_batch_id=" + batch_id + "&i_pageNumber=" + pageNo + "&i_pageSize=" + pageSize +
            "&i_sortingColumn=" + BatchsortBy + "&i_orderBy=" + orderBy;

        var queueUrl = "sdalhPKG_UI_UTILIZATION_PPAYMENT.p_d_upd_prcss_queue_s/json?i_queue_id=" + queueID + "&i_pageNumber=" + pageNo + "&i_pageSize=" + pageSize +
            "&i_sortingColumn=" + QueuesortBy + "&i_orderBy=" + orderBy;
        var paramUrl = "sdalhPKG_UI_UTILIZATION_PPAYMENT.p_d_upd_params_s/json?i_pageNumber=" + pageNo + "&i_pageSize=" + pageSize + "&i_sortingColumn=" + ParamsortBy + "&i_orderBy=" + orderBy;

        var data = await this.forkjoinQuery(batchUrl, queueUrl, paramUrl).toPromise();

        var dataFromInsertprcssqueue = await this.insertPrcssQueueOne(data, queueID, 1101, ls_parms);

        this.insertQueueId = dataFromInsertprcssqueue;
        return Promise.resolve(this.insertQueueId);
    }
    private forkjoinQuery(batchUrl, queueUrl, paramUrl) {
        return Observable.forkJoin(this.get(batchUrl), this.get(queueUrl), this.get(paramUrl))
            .map(res => {
                return res;
            });
    }
    ////of_InsertPrcssQueue() of misc_common
    private async insertPrcssQueueOne(Dataobj, ai_batch_id: number, queueID, as_parms) {

        let ll_rc = 0;
        let ll_queue_id;
        // insert the queue header
        ll_queue_id = await this.insertPrcssQueueSecond(Dataobj, ai_batch_id);

        if (ll_queue_id > 0) {
            ll_rc = await this.insertQueueParms(Dataobj, ll_queue_id, as_parms);

            if (ll_rc < 0)
                ll_queue_id = ll_rc;
        }

        ////return ll_queue_id;
        return Promise.resolve(ll_queue_id);

    }

    private async insertPrcssQueueSecond(Dataobj, ai_batch_id: number) {

        // var BatchsortBy = "BATCH_ID";
        //let QueuesortBy = 'EXEC_NM';
        //  let queueID = 6807;

        var orderBy = "ASC";
        let params = {};
        let pageNo = 1;
        let pageSize = 20;

        let ls_msg = [];
        let ll_batch_row, ll_queue_row, ll_rc, ll_queue_id;

        if (ai_batch_id == null)
            return -1;
        this.ids_batch_id = Dataobj[0].ResultSets[0];

        ll_batch_row = this.ids_batch_id.length;
        if (ll_batch_row != 1)
            return -1;

        var nextKey = "sdalhPKG_UI_UTILIZATION_PPAYMENT.p_dual/json";

        try {
            var nextKeyObj = await this.getWithErrorMessage(nextKey).toPromise();
            ll_queue_id = nextKeyObj.ResultSets[0][0].NEXTVAL;

        }
        catch (ex) {

            ls_msg[1] = "Unable to get a sequence number for a new batch request.SQL Error: " + ex.errorDbText;
            this.showMessage("pfc_systemerror" + ls_msg);

            return - 2;
        }
        const currentUserName = await this.get('api/User/GetDbUserName').toPromise();

        let todayDate = moment(Date.now()).format('MM/DD/YYYY')

        this.ids_queue_id = Dataobj[1].ResultSets[0];

        var insertUrl = "sdalhPKG_UI_UTILIZATION_PPAYMENT.p_d_upd_prcss_queue_i/json?i_prcss_queue_id=" + ll_queue_id +
            "&i_user_id=" + currentUserName + "&i_exec_nm=" + this.ids_batch_id[ll_batch_row - 1].EXEC_NM +
            "&i_dstn_prtr=" + "" + "&i_exec_tm=" + todayDate + "&i_prcss_stat=" + "NEW" +
            "&i_prcss_stat_dt=" + todayDate + "&i_restart_cnt=" + this.ids_batch_id[ll_batch_row - 1].RESTART_LIMIT +
            "&i_load_to_db_flg=" + "N" + "&i_restart_step=" + 1;

        try {
            let insertSts = await this.get(insertUrl).toPromise();

            if (insertSts.OutputParameters.O_RESULT) {
                ll_queue_row = insertSts.OutputParameters.O_RESULT; //ids_queue_id.insert()

                if (ll_queue_row == -1)
                    return - 2;

                ll_rc = insertSts.OutputParameters.O_RESULT;
                if (ll_rc < 0) {
                    this.messageDialog("Health Care Regulatory System", "Queue ID insert failed. RC =  " + ll_rc);
                    return - 2;
                }
            }
        }
        catch (ex) {
            this.messageDialogByMessageId("Health Care Regulatory System", ex.errorDbCode);

        }
        return ll_queue_id;
    }

    // of_InsertPrcssQueueParms()
    private async insertQueueParms(Dataobj, al_queue_id: number, as_parms: any) {
        let ll_row, ll_rc, ll_i: any;
        //let ids_params;
        this.ids_params = Dataobj[2].ResultSets[0];;
        //console.log(as_parms);
        if (al_queue_id == null || as_parms.length == 0)
            return -1;
        for (ll_i = 1; ll_i < as_parms.length; ll_i++) {
            var insertParm = "sdalhPKG_UI_UTILIZATION_PPAYMENT.p_d_upd_params_i/json?i_prcss_queue_id=" + al_queue_id +
                "&i_param_seq_no=" + ll_i + "&i_param_val=" + as_parms[ll_i];

            let insertSts = await this.get(insertParm).toPromise();
            //console.log(insertSts);
            if (insertSts.OutputParameters.O_RESULT) {
                ll_row = insertSts.OutputParameters.O_RESULT;

                if (ll_row < 0)
                    return -2;

                ll_rc = insertSts.OutputParameters.O_RESULT;
                if (ll_rc < 0) {
                    this.messageDialog("Health Care Regulatory System", "Queue ID insert failed. RC =  " + ll_rc);
                    return -2;
                }
            }
        }
        return 1;
    }
    private destroyOfInv() {
        if (this.ids_batch_id) {
            this.ids_batch_id.destroy();
        }
        if (this.ids_queue_id) {
            this.ids_queue_id.destroy();
        }

        if (this.ids_params) {
            this.ids_params.destroy();
        }

    }
    public sortDate(first: any, second: any) {
        if (!new Date(first).getTime() && new Date(second).getTime())
            return 1;
        else if (new Date(first).getTime() && !new Date(second).getTime())
            return -1;
        else if (new Date(first).getTime() === new Date(second).getTime())
            return 0;
        else
            return (new Date(first).getTime() - new Date(second).getTime());

    }
    

}
