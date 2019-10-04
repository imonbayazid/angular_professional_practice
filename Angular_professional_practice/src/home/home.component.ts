import {Component, OnInit, OnDestroy, ViewEncapsulation} from '@angular/core';
import {AppService} from '../shared/app.service';
import {Router} from '@angular/router';
import {CONSTANTS} from '../shared/constant';
import {Observable} from 'rxjs/Rx';
import { UserSettingsModule2 } from '../Tools/UserSettings/UserSettings.module';
import {juForm, FormElement, FormOptions} from '../shared/juForm/juForm';

@Component({
    moduleId: module.id,
    selector: 'my-home',
    templateUrl: './home.component.html',
    encapsulation: ViewEncapsulation.None
})
export class HomeComponent implements OnInit, OnDestroy {

    private dbUserName = '';
    private htmlString = '';
    private RECALC_GROUPS = 'RECALC GROUPS';
    private divStart = '<div class="alert alert-danger"><span class="glyphicon glyphicon-alert"></span>';
    private divEnd = '</div>';

    private isPasswordChangeFormShow: boolean = false;
    private isShowUpdatedChecksFormShow: boolean = false;

    private changePasswordPopupFormOptions: FormOptions;

    ngOnInit() {

        // Mock 
        //this.service.IsLoadPasswordChangeForm = true;
        //this.service.IsLoadWarningForm = true;
        this.CheckPopupForms()
        
        this.getAlerts();
    }

    // changePasswordPopup
    private initChangePasswordPopupForm() {
        this.changePasswordPopupFormOptions = {
            labelPos: 'left',
            title: 'Change Password',
            viewMode: 'popup',
            width: 600,
            modules: [UserSettingsModule2],
            inputs: [

                { type: 'html', content: `<user-settings-popup-component (okBtnClickEvent)="config.okBtnClick($event)" [isSalesExWarningHidden]="true" [isEmailHidden]="true"  > </user-settings-popup-component>` }

            ],
            okBtnClick: (event) =>
            {
                this.changePasswordOkBtnClick(event);
            }
        };

    }
    private changePasswordPopupFormClose()
    {
        //console.log("changePasswordPopupFormClose modal close event");
        this.ShowUpdatedChecksForm();
    }
    private changePasswordOkBtnClick(validationCode) {
        console.log("changePasswordPopupFormClose OK btn event", validationCode);
        if (validationCode === 0 || validationCode === 1) this.changePasswordPopupFormOptions.api.showModal(false);
    }
    // end of changePasswordPopup


    private CheckPopupForms()
    {
        if (this.service.IsLoadHomePagePopupForms) {
            this.service.IsLoadHomePagePopupForms = false;

            // Mock 
            //this.service.IsLoadPasswordChangeForm = true;
            //this.service.IsLoadWarningForm = true;

            // IsLoadPasswordChangeForm
            if (this.service.IsLoadPasswordChangeForm) {
                this.service.PasswordChangeFormMessage = ((this.service.PasswordChangeFormMessage == '') ? 'Your password will expire. Would you like to change it now?' : this.service.PasswordChangeFormMessage);
                this.service.confirmDialogPromise('Password Reset', this.service.PasswordChangeFormMessage)
                    .then(res => {
                        switch (res) {
                            case 1:
                                this.isPasswordChangeFormShow = true;
                                this.changePasswordPopupFormOptions.api.showModal();
                                break;
                            case 0:
                                this.isPasswordChangeFormShow = false;
                                this.ShowUpdatedChecksForm();
                                break;
                            case -1:
                                break;
                            default:
                                break;
                        }
                    })
            }
            // showUpdatedChecks
            if (!this.service.IsLoadPasswordChangeForm) {
                this.ShowUpdatedChecksForm();
            }
        }
    } 

    private ShowUpdatedChecksForm()
    {
        if (this.service.IsLoadWarningForm) {
            this.isShowUpdatedChecksFormShow = true;
        }
    }

    constructor(private service: AppService, private router: Router) {
        //loadChangePasswordPopup
        this.initChangePasswordPopupForm();

        this.getDbUserName().subscribe(res => {
            this.dbUserName = res;
        });
    }

    ngOnDestroy() { }

    NavigationChange(url: string, originalFactor: boolean, modifiedFactor: boolean) {
        if (originalFactor) {
            this.router.navigate([url]);
        }
        return modifiedFactor;
    }

    private getAlerts() {
        let url = '';

        this.service.get(url).map(res => {
            return {
                data: res.ResultSets[0]
            };
        }).subscribe(alertTableRow => {
            this.checkAccessForAlerts(alertTableRow);
        });
    }

    private checkAccessForAlerts(alertTableRow: any) {
        let enabledAlert = alertTableRow.data.filter(d => d.ALERT_ENABLED == CONSTANTS.YES);
        let enabledAlert$ = Observable.from(enabledAlert);

        enabledAlert$.subscribe((alertInfo: any) => {
            let accessibleAlert$ = Observable.fromPromise(this.service.ofGetAccess(alertInfo.ALERT_ROLE));

            accessibleAlert$.subscribe(
                accessStatus => {
                    if (accessStatus == CONSTANTS.ACCESS_FULL) {
                        this.generateAlertsDiv(alertInfo);
                    }
                });
        });
    }

    private generateAlertsDiv(alertInfo: any) {

        let url = ''
            + 'i_table_name=' + alertInfo.ALERT_VIEW_NAME
            + '&i_user_id=';

        if (alertInfo.ALERT_NAME == this.RECALC_GROUPS) {
            url = url + this.dbUserName;
        }

        let alertDetailsList = this.service.get(url);

        alertDetailsList.subscribe(alert => {
            let alert$ = Observable.from(alert.ResultSets[0])
            let messageText = '';

            alert$.subscribe(
                (element: any) => {
                    messageText = messageText + '<p>' + element.MESSAGE_TEXT + '</p>';
                },
                (err: any) => {
                    //console.log(err);
                },
                () => {
                    if (messageText != '') {
                        let header = '<span class="alert-header">' + alertInfo.MSGTEXT.replace("~n~r~n~r%s", "") + '</span>';
                        this.htmlString = this.htmlString + this.divStart + header + messageText + this.divEnd;
                    }
                });

        });
    }

    private getDbUserName() {
        return this.service.get('api/User/GetDbUserName').map(userName => {
            return userName;
        });
    }
}

