import { Component, HostListener } from '@angular/core';
import { Router, NavigationStart  } from '@angular/router';
import { PlatformLocation } from '@angular/common'
import {Subscription} from 'rxjs/Rx';
import {AppService} from './shared/app.service';
import { MessageDialog }   from './shared/app-ui/message.dialog';
import { ConfirmDialog }   from './shared/app-ui/confirm.dialog';
import {MenuItem} from './shared/menu';
import {ConfirmOkDialog} from "./shared/app-ui/confirm.okdialog";
import { juForm, FormElement, FormOptions } from './shared/juForm/juForm';


declare var $: any;

@Component({
    moduleId: module.id,
    selector: 'my-app',
    templateUrl: './app.component.html'
})
export class AppComponent {
    menuData: any[];
    subsList: Subscription[] = [];
    msg: string = '';
    userName: string = '';
    items: Array<MenuItem> = [];
    errorMessage: any[];
    disabled: boolean = true;
    messageCallback = null;
    externalReportsURL = '';

    onMessageDialogClose() {
        if (this.messageCallback) { this.messageCallback(); }
    }

    @HostListener('window:beforeunload', ['$event'])
    giveWarning($event) {
        if (this.service.isSavedPending) {
            $event.returnValue = 'Your data will be lost!';
        }
    }

    ngOnInit() {
        //this.router.events.subscribe(event => {
        //    if (event instanceof NavigationStart) {
        //        if (this.service.isSavedPending) {                   
        //            console.log('router changed ...', event);
        //            if (confirm('Your data will be lost!')) {
        //                console.log('YES'); 
        //            }
        //            else {
        //                console.log('No');
        //            }
        //        }
        //    }
        //}); 
        this.setMenu();
        this.service.get('api/User/GetUserName').subscribe(res => {
            this.userName = res;
        });
        this.service.get('api/User/GetDeployedEnvName').subscribe(res => {
            this.service.deployedEnvironment = res;
        });
        this.getLinkForExternalReports();
        this.loadUserMenu();
        this.service.getInterval('api/User/GetSessionTime', 60000).subscribe(res => {
            if (res <= 0) {
                window.location.href = 'Home/Login';
            }
        }, err => window.location.href = 'Home/Login');

        // + Global shared variables set place 
        //var data: any = this.service.get('api/User/GetConfiguration?key=CheckWarning');
        //this.service.CheckWarning = (data == "1");

    }
    loadUserMenu() {
        this.service.getMenuItems('api/User/getMenuList').subscribe(menus => this.items = menus, err => console.error(err), () => {
            //console.log('done')
        }
        );
    }

    // to generate the JSON object as array
    generateArray(obj) {
        return Object.keys(obj).map((key) => { return obj[key] });
    }

    constructor(private service: AppService, location: PlatformLocation, private router: Router) {
        this.service.isSavedPending = false;
        this.rollbackAllChanges();
        this.initForm();
    }

    private rollbackAllChanges() {
        this.service.get(`sdalhPKG_UI_COMMON.P_ROLLBACK/json?`).toPromise();
    }

    private setMenu() {
        this.subsList.push(this.service.notifier$.subscribe(it => {
            switch (it.key) {
                case 'message':
                case 'error':
                    this.msg = it.value;
                    document.body.style.marginTop = this.msg ? '65px' : '50px';
                    break;
                case 'messageDialog':
                    this.messageCallback = it.value.callback;
                    this.messageDialog.showDialog(it.value.title, it.value.message);
                    break;
                case 'confirmDialog':
                    this.confirmDialog.showDialog(it.value.title, it.value.message, it.value.yesCallback, it.value.noCallback);
                    break;
                case 'confirmOkDialog':
                    this.confirmOkDialog.showDialog(it.value.title, it.value.message, it.value.yesCallback, it.value.noCallback);
                    break;
            }
        }));

        $('#main-menu').smartmenus({
            noMouseOver: true,
            subMenusSubOffsetX: 6,
            subMenusSubOffsetY: -8,
            showDuration: 0,
            showFunction: null,
            hideDuration: 0,
            hideFunction: null,
            collapsibleHideFunction: null,
            collapsibleShowFunction: null,
            subMenusMaxWidth:"30em"
        });

    }

    private messageDialog: MessageDialog;
    private confirmDialog: ConfirmDialog;
    private confirmOkDialog: ConfirmOkDialog;
    private messageLoad(message: MessageDialog) {
        this.messageDialog = message;
    }

    private confirmLoad(confirm: ConfirmDialog) {

        this.service.confirmDialogInstance = confirm;
        this.confirmDialog = confirm;
    }

    private confirmOkLoad(confirmOk: ConfirmOkDialog) {
        this.service.confirmDialogOkInstance = confirmOk;
        this.confirmOkDialog = confirmOk;
    }

    IsDisable(menuName: string):any {
        if (!menuName) {
            this.disabled = false;
            return this.disabled;

        }
        this.disabled = true;
        if (this.items != null) {
            this.items.forEach((menu: MenuItem) => {

                if (menu.MENU_NM.toUpperCase() == menuName.toUpperCase()) {
                    this.disabled = false;
                }
            });
        }
        return this.disabled;
    }

    private getLinkForExternalReports() {
        let url = 'sdalhPKG_UI_TOOLS_EXTERN_RPT.P_DB_INFO_S/json';
        let urlOfExternalReports = '';
        this.service.get(url).subscribe(res => {
        
            if (res.ResultSets.length > 0 && res.ResultSets[0][0].RPT_URL && res.ResultSets[0][0].RPT_URL != 'Report URL not found') {

                if (res.ResultSets[0][0].RPT_URL.indexOf('http') !== -1) {
                    urlOfExternalReports = res.ResultSets[0][0].RPT_URL
                }
                else {
                    urlOfExternalReports = 'http://' + res.ResultSets[0][0].RPT_URL
                }
                this.externalReportsURL = urlOfExternalReports;

            }
        });

    }

    private onClickForExternalReports() {
        this.service.messageDialog('External Reports', 'Report URL not found.');
    }

    //**********************************
    private releaseFormOptions: FormOptions;
    private initForm() {
        this.releaseFormOptions = {
            labelPos: 'left', width: 1200, title: 'Release Notes',
            viewMode: 'popup',

            inputs: [
                {
                    type: 'html',
                    content:

                    `  
                        <div>
                                <iframe src="../Content/release_notes/Release_Notes.pdf#zoom=100"  style="width:100%; height:700px;" frameborder="0"></iframe>

                        </div>
                    `
                }
            ]
        };
    }

    private onClickRelease() {
        $('div#releaseNotePopup .modal-dialog').css('width', 900);
        this.releaseFormOptions.api.showModal(true);
    }


}
