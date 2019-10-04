
import {Injectable}   from '@angular/core';
import {AppService}   from '../../shared/app.service';
import {Http}         from '@angular/http';
import {Subject} from 'rxjs/Rx';
@Injectable()
export class ApprovePricesService extends AppService {
    //public pricingFormOptionsRef: any;
    public profileListGridSelectedResultRow: any = null;
    public profileListGridSelectedResultRowBeforeRefresh: boolean = false;
    public profileListGridLastClickedResult: number = 0;
    public profileListGridSelectedResultRows: any[] = []; 

    public productFamilyPricesGridSelectedResultRow: any = null;
    public productFamilyPricesGridSelectedResultRowBeforeRefresh: boolean = false;
    public productFamilyPricesGridLastClickedResult: number = 0;
    public productFamilyPricesGridSelectedResultRows: any[] = []; 

    public medicaidPriceApprovalSelectedRow: any = null; 
    public medicaidPriceApprovalRows: any[] = [];

    public ModifiedApprovalRows: any[] = [];

    constructor(http: Http, private appService: AppService) {
        super(http);
    }
    
}