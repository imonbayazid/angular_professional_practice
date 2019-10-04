import {Injectable}   from '@angular/core';
//import {AppService}   from '../../shared/app.service';
import {Http}         from '@angular/http';
import {Subject} from 'rxjs/Rx';
import { ProfileListComponent }  from './ProfileList.component';

@Injectable()
export class SubmissionService {
    public readOnlyMessageFormOptionsRef: any;
    public overrideFormOptionsRef: any;
    public bpReviewFormOptionsRef: any;
    //public pricingFormOptionsRef: any;
    public profileListGridOptionsRef: ProfileListComponent;
    public profileResultsGridOptionsRef: any;
    public bestPricePoolFormOptionsRef: any;

    public navigationName: string;
    public userType: string;
    public pkgRootUrl: string = 'sdalhPKG_UI_MEDICARE_SUBMISSION.';
    public commitUrl: string = `sdalhPKG_UI_COMMON.P_COMMIT/json`;
    public rollbackUrl: string = `sdalhPKG_UI_COMMON.P_ROLLBACK/json`;
    public FAILURE: number = -9999;
    public SUCCESS: number = 1;
    public dbUserName: string;
    public selectedProfileData: any;
    public selectedListRow: any = null;
    public selectedListRowBeforeRefresh: boolean = false;
    public selectedResultRowBeforeRefresh: boolean = false;
    public lastClickedList: number = 0;
    public lastClickedResult: number = 0;
    public listPageNumber: number = 1;
    public resultPageNumber: number = 1;
    public selectedResultRow: any = null;
    public selectedResultRows: any[] = []; 
    public bestPriceSelectedRow: any = null;
    public warningText: string = null;
    public buttonName: string = null;
    public isExportButtonEnabled: boolean = false;
    public selectedRow: any = null;
    public productList: any[] = [];
    public profileListComponent: ProfileListComponent;
    public btnVisible: boolean = false;

    //constructor(http:Http) {
    //    super(http);       
    //}
    public profileListHandler = new Subject();
   
}