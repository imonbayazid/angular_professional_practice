import {Injectable}   from '@angular/core';
//import {AppService}   from '../../shared/app.service';
import {Http}         from '@angular/http';
import {Subject} from 'rxjs/Rx';


@Injectable()
export class CalculatePricesService {
    public readOnlyMessageFormOptionsRef: any;
    public overrideFormOptionsRef: any;
    public bpReviewFormOptionsRef: any;
    public pricingFormOptionsRef: any;
    public profileListGridOptionsRef: any;
    public profileResultsGridOptionsRef: any;
    public bestPricePoolFormOptionsRef: any;
    public bpPointsImportComponentRef: any;

    public navigationName: string;
    public Title: string = '';
    public Tag: string = '';
    public lsTitlePrefix: string = 'Calculate Prices';
    public title: string = '';
    public mleNote: string = '';
    public pkgRootUrl: string = 'sdalhPKG_UI_MEDICAID_CALC_PRICES.';
    public FAILURE: number = -9999;
    public SUCCESS: number = 1;
    public dbUserName: string;
    public isAccess: string = '';
    public isBPAccess: boolean = false;
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
    public idsCalcTypes: any[] = []; 
    public profileResultDataObj: string = '';
    public bestPriceSelectedRow: any = null;
    public isUpdatesPending: any = 0;
    public bpPointsData: any[] = [];
    public annualResultVA: boolean = false;
    public ib_del_discard: boolean = false;

    public profileListHandler = new Subject();
   
}