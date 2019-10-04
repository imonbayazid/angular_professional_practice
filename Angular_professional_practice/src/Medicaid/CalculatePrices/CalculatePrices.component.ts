import {Component, OnInit, OnDestroy, ViewEncapsulation} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {juForm, FormOptions, FormElement} from '../../shared/juForm/juForm';
import {juGrid, GridOptions } from '../../shared/juGrid/juGrid';
import {SelectOptions} from '../../shared/juForm/juSelect';
import {FV} from '../../shared/juForm/FV';
import {CONSTANTS} from '../../shared/constant';
import {AppService} from '../../shared/app.service';
import {CalculatePricesService} from './CalculatePrices.service';


@Component({
    moduleId: module.id,
    templateUrl: './CalculatePrices.html',
    styleUrls: ['./CalculatePrices.css'],
    encapsulation: ViewEncapsulation.None
})

export class CalculatePrices implements OnInit, OnDestroy {

    private title: string = '';

    constructor(private service: CalculatePricesService, private route: ActivatedRoute,
        private appService: AppService) {

    } 

    ngOnInit() {
        this.service.navigationName = this.route.snapshot.data['agencyType'];
        this.getUserPermission();
        this.preOpen();
        this.open();
    }

    ngOnDestroy() {

    }

    private async getUserPermission() {
        let titlePrefix = this.service.lsTitlePrefix;
        let isAgencyType = this.service.navigationName;
        this.service.Title = titlePrefix + ' (' + isAgencyType.toUpperCase() + ')';
        this.service.Tag = (titlePrefix + " - " + isAgencyType).toUpperCase();
        const windowStatus: any = await this.appService.getUserPermission(this.service.Tag, this.service.Title);
        this.title = windowStatus.windowTitle;
        this.service.isAccess = windowStatus.isAccess;
        this.service.Title += ' - ' + this.title;
        //this.service.ibIsUpdateable = windowStatus.isUpdatable;
    }

    private refreshListResultGrids() {
        this.service.profileListGridOptionsRef.ListResultGridRefresh();
    }
    private async open() {
        let url = `${this.service.pkgRootUrl}P_CALCPRICES_AGENCYCALCINFO_S/json?i_as_agency_cd=${this.service.navigationName}`;
        let result: any = await this.appService.get(url).toPromise();
        if (result.ResultSets[0].length < 1) {
            this.appService.messageDialog('pfc_systemerror', `Unable to find any price calculation types for ${this.service.navigationName}`);
            return;
        }
        this.service.idsCalcTypes = result.ResultSets[0];
    }

    private preOpen() {
        this.service.title = this.service.lsTitlePrefix + this.service.navigationName;
        this.service.ib_del_discard = true;
        if (this.service.navigationName === CONSTANTS.MED_AGENCY_TYPE) {
            (<any>this.service.pricingFormOptionsRef.pricingFormOptions).exceptOverrideVisibility = true;
        }
        if (this.service.navigationName === CONSTANTS.MEDICARE_AGENCY_TYPE) {
            (<any>this.service.pricingFormOptionsRef.pricingFormOptions).overrideVisibility = false;
        }
    }
}