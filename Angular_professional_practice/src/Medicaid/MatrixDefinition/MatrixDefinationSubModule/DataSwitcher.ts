
import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { juForm, FormElement, FormOptions } from '../../../shared/juForm/juForm';
import { juGrid, GridOptions } from '../../../shared/juGrid/juGrid';
import { Attachment } from '../../../shared/app-ui/attachment';
import { MatrixDefinitionService } from '../MatrixDefinition.service';
import {Subscription} from 'rxjs/Subscription';

@Component({
    moduleId: module.id,
    selector: 'data-switcher',
    template: `
      <table><tr>
        <td valign="top">
          <div [style.width.px]="width" style="display:inline-block">
                <div><b>{{leftTitle}}</b></div>
                <div class="juGrid" (onLoad)="loadLeftGrid($event)" [options]="leftGO" [data]="leftData"></div>
                <div> <b>Selected Rows: {{leftSelected.length}}</b> <b style="padding-left:20px">Total Rows: {{leftData.length}}</b></div>
            </div>
        </td>
        <td style="width:150px" valign="center">
            <div style="padding:0 30px">
                <button (click)="btnMove()" [disabled]="(!dataSwitcherMoveEnable)" type="button" class="btn btn-large btn-block btn-primary">Move <span class="glyphicon glyphicon-chevron-right"></span></button>
                <button (click)="btnRemove()" [disabled]="(!dataSwitcherRemoveEnable)" type="button" class="btn btn-large btn-block btn-primary"><span class="glyphicon glyphicon-chevron-left"></span> Remove</button>
            </div>
        </td>
        <td valign="top">
             <div [style.width.px]="width" style="display:inline-block">
                <div><b>{{rightTitle}}</b></div>
                <div class="juGrid" (onLoad)="loadRightGrid($event)" [options]="rightGO" [data]="rightData"></div>
                 <div> <b>Selected Rows: {{rightSelected.length}}</b> <b style="padding-left:20px">Total Rows: {{rightData.length}}</b></div>
             </div>
        </td>
      </tr></table>
    `
})
export class DataSwitcher implements OnInit, OnDestroy {
    
    leftGO: GridOptions;
    rightGO: GridOptions;
    @Input() width: number = 500;

    @Input() leftColumns: any[];
    @Input() rightColumns: any[];

    @Input() leftTitle: string = 'Left Title';
    @Input() rightTitle: string = 'Right Title';

    @Output() onLoad = new EventEmitter();
    @Output() onMove = new EventEmitter();
    @Output() onRemove = new EventEmitter();

    leftData: any[] = [];
    rightData: any[] = [];

    leftSelected: any[] = [];
    rightSelected: any[] = [];

    leftGrid: juGrid;
    rightGrid: juGrid;
    public dataSwitcherRemoveEnable: boolean=false;
    public dataSwitcherMoveEnable: boolean = false;
    public isProfileLock: boolean = this.service.isProfileLock;

    public readOnly: any = false;

    constructor(private service: MatrixDefinitionService) {
    }
    public ngOnInit() {
        this.leftGO = {
            viewMode: '!panel',
            noPager: true,
            pageSize: 10000,
            height: 200,
            classNames: 'table table-bordered',
            columnDefs: this.leftColumns,
            rowEvents: '(click)="config.rowClick(row,i, $event.ctrlKey)"',
            trClass: row => {
                return { selected: row.selected };
            },
            rowClick: (row: any, index: number, ctrlKey: boolean) => {
                this.leftGridRowClick(row, index, ctrlKey);
            }
        };

        this.rightGO = {
            viewMode: '!panel',
            noPager: true,
            pageSize: 10000,
            height:200,
            classNames: 'table table-bordered',
            columnDefs: this.rightColumns,
            rowEvents: '(click)="config.rowClick(row,i, $event.ctrlKey)"',
            trClass: row => {
                return { selected: row.selected };
            },
            rowClick: (row: any, index: number, ctrlKey: boolean) =>
            {
                this.rightGridRowClick(row, index, ctrlKey);
            }
        };
    }

    public leftGridRowClick(row: any, index: number, ctrlKey: boolean) {
        this.rightSelected.forEach(rec => rec.selected = false);
        this.rightSelected = [];

        if (ctrlKey) {
            row.selected = !row.selected;
        } else {
            this.leftSelected.forEach(_ => _.selected = _ === row);
            row.selected = !row.selected;
            this.leftSelected = [];
        }
        row.selected ? this.leftSelected.push(row) : this.leftSelected.splice(this.leftSelected.indexOf(row), 1)

              if (!this.service.updatable) {
                    this.dataSwitcherRemoveEnable = false;
                    this.dataSwitcherMoveEnable = false;
                }
                else
                {
                  if (this.leftSelected.length > 0) this.dataSwitcherMoveEnable = true;
                  else this.dataSwitcherMoveEnable = false;
                    this.dataSwitcherRemoveEnable = false;
                } 
    }

    public rightGridRowClick(row: any, index: number, ctrlKey: boolean)
    {
        this.leftSelected.forEach(rec => rec.selected = false);
        this.leftSelected = [];

        if (ctrlKey) {
            row.selected = !row.selected;
        } else {
            this.rightSelected.forEach(_ => _.selected = _ === row);
            row.selected = !row.selected;
            this.rightSelected = [];
        }
        row.selected ? this.rightSelected.push(row) : this.rightSelected.splice(this.rightSelected.indexOf(row), 1);

        if (!this.service.updatable) {
            this.dataSwitcherRemoveEnable = false;
            this.dataSwitcherMoveEnable = false;
        }
        else {
            if (this.rightSelected.length > 0) this.dataSwitcherRemoveEnable = true;
            else this.dataSwitcherRemoveEnable = false;
            this.dataSwitcherMoveEnable = false;
        } 
    }

    protected btnMove() {
        const sr = this.leftSelected.map((_,i) => Object.assign({}, _, { selected: i==0 }));
        this.rightData = [...sr, ...this.rightData];
        this.leftData = this.leftData.filter(_ => !_.selected);
        this.onMove.emit(sr);       
        this.rightSelected = sr;
        this.leftSelected = [];
        if (this.rightSelected.length > 0)
        {
            this.dataSwitcherRemoveEnable = true;
            this.dataSwitcherMoveEnable = false;
        }
    }

    protected btnRemove() {
        const sr = this.rightSelected.map( (_,j) => Object.assign({}, _, { selected: j==0 }));
        this.leftData = [...sr, ...this.leftData];
        this.rightData = this.rightData.filter(_ => !_.selected);
        this.onRemove.emit(sr);
        this.leftSelected = sr;
        this.rightSelected = [];
        if (this.leftSelected.length > 0) {
            this.dataSwitcherRemoveEnable = false;
            this.dataSwitcherMoveEnable = true;
        }
    }
    public clearLeftRightSelected() {
        this.leftSelected = [];
        this.rightSelected = [];
    }

    public ngOnDestroy() {
       
    }
    protected loadLeftGrid(grid: juGrid) {
        this.leftGrid = grid;       
    }
    protected loadRightGrid(grid: juGrid) {
        this.rightGrid = grid;        
        this.onLoad.emit(this);
    }

    public insertRows(rows: any[], isLeft: boolean) {
        const sr = rows.map(_ => Object.assign({}, _, { selected: false }));
        if (isLeft)
            this.leftData = [...sr, ...this.leftData];
        else this.rightData = [...sr, ...this.rightData];

    }

}