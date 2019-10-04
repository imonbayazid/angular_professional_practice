

import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { juForm, FormElement, FormOptions } from '../../../shared/juForm/juForm';
import { FV } from '../../../shared/juForm/FV';

@Component({
    moduleId: module.id,
    selector: 'filter',
    template: `<div juForm (onLoad)="loadForm($event)" [options]="options"></div>`
})
export class Filter implements OnInit, OnDestroy {
    protected options: FormOptions;
    public form: juForm;
    protected _trade: boolean = false;
    @Output() findClick = new EventEmitter();
    @Output() onLoad = new EventEmitter();

    @Output() dataSourceOnChange = new EventEmitter();
    @Output() calculationTypeOnChange = new EventEmitter();
    @Output() matrixOnChange = new EventEmitter();
    @Output() tradeOnChange = new EventEmitter();
    

    @Input() set trade(val) {
        this._trade = val;
        this.showClassTrade(val);
    }
    get trade() { return this._trade; }
    constructor() {
        this.initForm();
    }
    public ngOnInit() {

    }
    public ngOnDestroy() {

    }
    protected initForm() {
        this.options = {
            viewMode: 'form', labelPos: 'left',
            trade: this.trade,
            inputs: [
                {
                    type: 'groupLayout', items: [
                        {
                            groupName: 'Criteria', size: 12, labelSize: 4, inputs: [
                                [{ field: 'dataSource', change: this.dataSourceChanged.bind(this), size: 10,  label: 'Data Source', type: 'juSelect', options: { width: '100%' } },
                                { type: 'button', exp: 'class="btn btn-primary"', label: 'Find', size: 2, click: this.find.bind(this) }],
                                [{ field: 'calculationType', change: this.calculationTypeChanged.bind(this), label: 'Calculation Type', type: 'juSelect', size: 10, options: { width: '100%' } }],
                                [{ field: 'matrix', change: this.matrixChanged.bind(this),  label: 'Matrix', type: 'juSelect', size: 10, options: { width: '100%' } }],
                                [{ field: 'trade', change: this.tradeChanged.bind(this), exp: `[style.display]="config.trade?'block':'none'"`, label: 'Class of Trade', type: 'juSelect', size: 10, options: { textProp: 'CLS_OF_TRD_CD', valueProp: 'CLS_OF_TRD_CD', subTextProp: 'CLS_OF_TRD_DESCR', height: 250, width: '100%' } }]
                            ]
                        }
                    ]
                }
            ]
        };
    }

    protected dataSourceChanged(obj)
    {
        this.dataSourceOnChange.emit(obj.value);
    }

    protected calculationTypeChanged(obj) {
        this.calculationTypeOnChange.emit(obj.value);
    }

    protected matrixChanged(obj) {
        this.matrixOnChange.emit(obj.value);
    }
    protected tradeChanged(obj) {
        this.tradeOnChange.emit(obj.sender.selectedItem);
    }
    

    protected loadForm(form: juForm) {
        this.form = form;
        this.onLoad.emit(this);
    }
    protected find() {
        this.findClick.emit(this.form.getModel());
    }
    public showClassTrade(flag: boolean) {
        this.options['trade'] = flag;
    }
    public setData(fieldName: string, data: any[]) {
        this.form.setData(fieldName, data);
        if (data.length > 0)
            this.form.setSelectValue(fieldName, data[0].value);
    }

   /* public setSelectedData(fieldName: string, value: any) {
        if (value!=null)
            this.form.setSelectValue(fieldName,value);
    } */

    public loadDropDownData(fieldName: string, data: any[]) {
        this.form.setData(fieldName, data);
    }

}