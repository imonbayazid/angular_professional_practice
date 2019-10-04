import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {ManualAdjustmentService} from './ManualAdjustment.service';

@Component({
    moduleId: module.id, selector:'manualAdjustment',
    templateUrl: './ManualAdjustments.html',
    styleUrls: ['./ManualAdjustments.css'],
    encapsulation: ViewEncapsulation.None // load all css files if we use native then it will load just the css file of same directory
})
export class ManualAdjustments {
    public isDetailsControlBtnDisable: any = true;
    public isReverseControlBtnDisable: any = true;
    public showImport: any = false;
    public agency_type: any;
    rowNumber: any=0;
    totalData: any=0;

    Tag: any = null;
    menuName: any = "MANUAL ADJUSTMENTS - ";
    windowTitle: any = "Manual Adjustment";
    importBtnVisable: any;
    importBtnDisable: any;
    addBtnVisable: any;
    addBtnDisable: any;
    reverseBtnVisable: any;
    reverseBtnDisable: any=false;
    detailsBtnDisable:any=false;

    constructor(private service: ManualAdjustmentService, private route: ActivatedRoute) {
        this.service.manualAdjustmentComponentRef = this; 
        this.service.is_agency_type = this.route.snapshot.data['agencyType'];
        this.agency_type = this.service.is_agency_type;      
    }

    ngOnInit() {        

        if (this.service.is_agency_type == "MEDICAID")
        {
            this.showImport = true;
        }
        else this.showImport = false;

        this.preOpen();
    }

    public import()
    {
          this.service.importComponentRef.showImportForm();
    }

    public add()
    {
       this.service.editOrdetailsComponentRef.addButtonAction();
    }

    public reverse()
    {
        this.service.reverseComponentRef.reverseFn();
    }

    public details()
    {
          this.service.editOrdetailsComponentRef.detailsButtonAction();
      }
    


    public disableAddReverseBtn(value: any) {
        this.addBtnDisable = value;
        this.reverseBtnDisable = value;
    } 

    private async  preOpen() {
        this.Tag = this.menuName + this.agency_type.toUpperCase(); 
        this.windowTitle = this.windowTitle + ' (' + this.agency_type.toUpperCase() + ')';
        var windowStatus = await this.service.appService.getUserPermission(this.Tag, this.windowTitle);
        this.windowTitle = windowStatus.windowTitle;

        // set updateable true/false 
        this.service.isUpdateable = windowStatus.isUpdatable;     
            //this.importBtnVisable =;
            this.importBtnDisable =!this.service.isUpdateable;
            this.addBtnVisable = this.service.isUpdateable;
            this.addBtnDisable = !this.service.isUpdateable;
            this.reverseBtnVisable = this.service.isUpdateable;
            this.reverseBtnDisable = !this.service.isUpdateable;
          //  this.isDetailsControlBtnDisable =! this.service.isUpdateable;
        
        if (windowStatus.userPermission == true) {

        } else {
            // if user has no permission then show nothing

        }
    }

}
