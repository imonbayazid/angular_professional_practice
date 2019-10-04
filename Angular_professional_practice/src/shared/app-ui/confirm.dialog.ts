import {Component, OnChanges, OnDestroy, OnInit, Input, Output, EventEmitter} from '@angular/core';
import {juForm, FormOptions, FormElement} from '../juForm/juForm';
@Component({
    moduleId: module.id,
    selector: 'confirm, [confirm], .confirm',
    template: '<div juForm (onLoad)="fromLoad($event)" (onModalClose)="dialogClose($event)" [options]="formOptions"></div>'
})
export class ConfirmDialog implements OnInit, OnChanges
{
    private form: juForm;    
    @Output() onLoad = new EventEmitter();
    constructor() { }
    private formOptions: FormOptions;
    public ngOnInit() { this.constructForm(); }
    public ngOnChanges(changes)
    {

    }
    value: number = -1;
    private constructForm()
    {
        this.formOptions = {
            title: 'Health Care Regulatory System', viewMode: 'popup', message: '',
            body: '', showCancelBtn:false,
            inputs: [                 
                { type: 'html', content: '<div [innerHTML]="config.message"></div>' }
            ],
            buttons: {
                'Yes': { type: 'button', cssClass: 'btn btn-primary', click: () => { this.form.showModal(false); this.value = 1; this.yesCallback(); } },
                'No': { type: 'button', cssClass: 'btn btn-primary', click: () => { this.form.showModal(false); this.value = 0; this.noCallback(); } },
                'Cancel': { type: 'button', exp: `*ngIf="config.showCancelBtn"`, cssClass: 'btn btn-primary', click: () => { this.form.showModal(false); this.value = -1; this.noCallback(); } }
            }
        };
    }
    private fromLoad(form: juForm)
    {
        this.form = form;
        this.onLoad.emit(this);
    }
    private dialogClose(){
        if(this.noCallback) this.noCallback();
    }
    public setCancelButton(val) { this.formOptions['showCancelBtn'] = val; }
    private yesCallback = () => { };
    private noCallback = () => { }
    public showDialog(title: string, message: string, yesCallback?, noCallback?)
    {
        if (title)
            this.formOptions['title'] = title;
        this.formOptions['message'] = message;
        if (yesCallback)
            this.yesCallback = yesCallback;
        if (noCallback)
            this.noCallback = noCallback;
        this.form.showModal().setZindex(999999);
    }
     public showDialogPromise(title: string, message: string):Promise<Number>
     {
         this.value = -1;
        if (title)
            this.formOptions['title'] = title;
        this.formOptions['message'] = message;
        this.form.showModal().setZindex(999999);
        return new Promise((resolve, reject)=>{

            this.yesCallback = () => { this.wait(() => { resolve(this.value); }); };

            this.noCallback = () => { this.wait(() => { resolve(this.value); }); };
        });
       
    }
     private wait(fx, millisecond = 500) {
         const tid = setTimeout(() => { fx(); clearTimeout(tid); }, millisecond);
     }
}