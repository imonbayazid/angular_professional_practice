
import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, forwardRef, Inject } from '@angular/core';
import { juGrid, GridOptions } from '../../../shared/juGrid/juGrid';

import {ActivatedRoute} from '@angular/router';
import {MatrixDefinition} from '../MatrixDefinition';
import { MatrixDefinitionService } from '../MatrixDefinition.service';
declare var moment: any;
@Component({
    moduleId: module.id,
    selector: 'matrix-detail',
    template: `
    <div class="row">
        <div class="col-md-4">
            <fieldset>
                <legend>Mode</legend>
                <label><input (click)="setMode(true)" type="radio" name="mac" [(ngModel)]="mode" value="Current"> Current</label> &nbsp;
                <label><input (click)="setMode(false)" type="radio" name="mac" value="Historical" [(ngModel)]="mode"> Historical</label>
            </fieldset>
        </div>        
    </div>
     <div [style.visibility]="mode==='Historical'?'visible':'hidden'" class="juGrid" (onLoad)="gridLoad($event)" [options]="gridOptions"></div>
    `
})
export class MatrixDetail implements OnInit, OnDestroy {

    public gridOptions: GridOptions;
    protected mode: string = 'Current';

    @Output() onLoad = new EventEmitter();
    constructor(
        private service: MatrixDefinitionService,
         private route: ActivatedRoute,
          @Inject(forwardRef(()=>MatrixDefinition)) private matrixDefinition:MatrixDefinition) {
        this.initGrid();
        
    }
    public ngOnInit() {
        this.matrixDefinition.of_setHistProfileId(0);
    }
    public ngOnDestroy() {

    }
    protected selectedRow: any = {};
    protected initGrid() {
        this.gridOptions = {
            viewMode: 'panel', pagerPos: 'header', title: 'Specify Historical Profile', colResize: true, sspFn: this.sspfn.bind(this),
            rowEvents: '(click)="config.rowClick(row)"', noPager: true, enableCellEditing: true,
            pageSize:10000,
            trClass: row => ({ selected: row.selected }),
            columnDefs: [
                { headerName: 'Name', field: 'PRFL_NM', width: 320, sort: true },
                { headerName: 'Status', field: 'PRFL_STAT_CD', width: 120, sort: true },
                { headerName: 'Time Period', field: 'TIM_PER_CD', width: 120, sort: true, cellRenderer:this.getTimePeriod},
                { headerName: 'Start Date', field: 'BEGN_DT', width: 120, exp: `{{row.BEGN_DT | date:'shortDate'}}`, sort: true },
                { headerName: 'End Date', field: 'END_DT', width: 120, exp: `{{row.END_DT | date:'shortDate'}}`, sort: true },
                { headerName: 'Processing Type', field: 'PRCSS_TYP_CD', width: 150, sort: true },
                { headerName: 'Prelim?', field: 'PRELIM_IND', width: 80, sort: true, exp:`<input type="checkbox" disabled [checked]="row.PRELIM_IND==='Y'">` },
                { headerName: 'Modified Date', field: 'MOD_DT', width: 180, cellRenderer: row => row.MOD_DT && row.MOD_DT.length > 10 ? moment(row.MOD_DT).format('MM/DD/YYYY HH:MM:SS') : row.MOD_DT , sort: true },// exp: `{{row.MOD_DT | date:'short'}}`
                { headerName: 'Last Modified By', field: 'USERNAME', width: 120, sort: true },
                { headerName: 'Profile Id', field: 'PRFL_ID', width: 120, sort: true }
            ],

            rowClick: row => {
                if (row !== this.selectedRow) this.matrixDefinition.changeProfile();
                this.selectedRow.selected = false;
                row.selected = true;
                this.selectedRow = row;
                this.setMode(this.mode === 'Current');
            }

        };
    }
    protected getTimePeriod(row:any) {
        const val=row.TIM_PER_CD, index = val.indexOf('Q');
        return `${val.substr(index)}/${val.substr(0, index)}`;
    }
    protected gridLoad() {
        this.onLoad.emit(this);
    }
    private sspfn(params) {
        var sortBy = "PRFL_ID";
        var orderBy = "ASC";

        var sortingText = params.sort;
        if (sortingText) {
            var sortingTextValues = sortingText.split('|');
            sortBy = sortingTextValues[0];
            orderBy = sortingTextValues[1];
        }
        let x = "&i_page_no=1&i_page_size=10000"+
            "&i_sort_col=" + sortBy + "&i_order_typ=" + orderBy;

        const url = 'sdalhPKG_UI_MATRIX_DEFINITION.p_d_hcrs_profiles_hist_s/json?i_agency_typ_cd='+this.service.is_agency+x;
       
        return this.service.appService.get(url)  
            .do(res=>{this.selectedRow=res.ResultSets[0][0]; this.selectedRow.selected=true;})        
            .map(res => ({ data: res.ResultSets[0] }));//, totalRecords: res.OutputParameters.O_TOTALRECORDS
    }
    private setMode(isCurrent){
       this.matrixDefinition.save();
       this.matrixDefinition.of_setsave(false);
       if(isCurrent){
           this.matrixDefinition.of_setHistProfileId(0);
           //ex. a user move to profile id 5842 to current then change profilechange()
           this.matrixDefinition.changeProfile();
       }
    }

    public setMatrixDetail(){
        if(this.mode==='Historical'){
            if(this.gridOptions.api.grid.getData().length<=0){
                this.service.appService.messageDialog('Info','HIST_PROFILE_NULL');
                return;
            }
          this.matrixDefinition.of_setHistProfileId(this.selectedRow.PRFL_ID);
        }
    }


}