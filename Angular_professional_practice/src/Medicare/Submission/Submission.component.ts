import {Component, OnInit, ViewEncapsulation, Input} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {juForm, FormOptions, FormElement} from '../../shared/juForm/juForm';
import {juGrid, GridOptions } from '../../shared/juGrid/juGrid';
import {SelectOptions} from '../../shared/juForm/juSelect';
import {FV} from '../../shared/juForm/FV';
import {AppService} from '../../shared/app.service';
import {SubmissionService} from './Submission.service';


@Component({
    moduleId: module.id,
    templateUrl: './Submission.html',
    styleUrls: ['./Submission.css'],
    encapsulation: ViewEncapsulation.None 
})

export class Submission {
    public agency_type: any;
    public title: any = "";

    tag: any = "MEDICARE - SUBMISSION";

    constructor(private appService: AppService, private service: SubmissionService, private route: ActivatedRoute) {
        //console.log(this.route)
      //  this.service.navigationName = this.route.snapshot.data['showNext'];
        this.service.navigationName = this.route.snapshot.data['agencyType'];
        //console.log(this.service.navigationName);
        this.agency_type = this.service.navigationName;
    }

    async ngOnInit() {
        //this.service.navigationName = this.route.snapshot.data['agencyType'];
        await this.preOpen();
    }

    private exportButtonOperation() {
        this.service.profileResultsGridOptionsRef.exportToExcel();
    }

    private async preOpen() {
        let windowStatus = await this.appService.getUserPermission(this.tag, this.title);
       // console.log(windowStatus);
        this.service.userType = windowStatus.windowTitle;
        this.service.btnVisible = windowStatus.isUpdatable;
    }
}