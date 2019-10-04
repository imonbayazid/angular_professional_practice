import {Pipe, PipeTransform} from '@angular/core';
@Pipe({
    name: 'sa_currency'
})

export class CurrencyPipe implements PipeTransform{

    transform(value, args) {
        let n = value;
        let currency: any = '$'
        if (!value) {
            return;
        }
        let negetive = false;
        if (n < 0) {
            n = n * (-1);
            negetive = true;
        }
        return (negetive ? '(' : '') + currency + " " + parseFloat(n).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1,") + (negetive ? ')' : '');
        //if (value < 0) {
        //    value = value * (-1);
        //    return `($${value.toFixed(2).toLocaleString('en-IN')})`;
        //}
        //return `$${value.toFixed(2).toLocaleString('en-IN' , {
        //    maximumFractionDigits: 2,
        //    style: 'currency',
        //    currency: 'INR'
        //})}`;
    }
}