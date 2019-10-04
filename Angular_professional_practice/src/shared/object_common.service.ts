import {Injectable}   from '@angular/core';
import {Http, Headers}         from '@angular/http';
import {CONSTANTS} from './constant';
import {Observable, Subject}   from 'rxjs/Rx';
import {MenuItem} from './menu';
import {ConfirmOkDialog} from "./app-ui/confirm.okdialog";

declare var window: any;
declare var jQuery: any;
declare var moment: any;

@Injectable()
export class Object_Common_Service {

    public f_validate_dates(adw_datawindow: any, ab_gaps_allowed: boolean, as_keycolname: string, al_error_row: number): number {
        let l_row: number = 0;
        let l_keyrow: number = 0;
        let l_rowcount: number;
        let s_key: string;
        let s_priorkey: string;
        let dt_eff_dt: Date;
        let dt_end_dt: Date;
        let dt_prior_end_dt: Date;
        let ls_key_col: string;
        let ls_key_col2: string;
        let ls_key2: string;
        let ls_prior_key2: string;
        let ls_col: string;
        let ll_pos: number;
        let ll_key2: number;


        l_rowcount = adw_datawindow.length;
        dt_prior_end_dt = new Date(1699, 11, 31);

        if (l_rowcount < 1) return 0;

        ls_key_col = as_keycolname; // pgm_id A, ndc
        ll_pos = this.pos(ls_key_col, ",");
        if (ll_pos > 0) {
            ls_key_col = as_keycolname.substr(ll_pos + 2).trim();
            ls_key_col2 = as_keycolname.substr(0, as_keycolname.indexOf(" A,"));
            ls_col = typeof ls_key_col2;
            if (ls_col === 'string') {
                ls_key2 = adw_datawindow[l_row][ls_key_col2];
                ls_prior_key2 = ls_key2;
            } else if (ls_col === 'number') {
                ll_key2 = adw_datawindow[l_row][ls_key_col2];
                ls_prior_key2 = ll_key2.toString();
            }
        }

        s_key = s_key;
        s_key = adw_datawindow[l_row][ls_key_col];

        if (s_key === null || ll_key2 === null) {
            al_error_row = l_row;
            return 3;
        }

        s_priorkey = s_key;
        if (ll_pos > 0) {
            while (l_row < l_rowcount) {
                if (ls_prior_key2 === ls_key2 && s_key === s_priorkey) {
                    dt_eff_dt = new Date(adw_datawindow[l_row].EFF_DT);
                    dt_end_dt = new Date(adw_datawindow[l_row].END_DT);

                    if (dt_eff_dt <= dt_prior_end_dt) {
                        al_error_row = l_row;
                        return 1;
                    }

                    if (!ab_gaps_allowed && l_keyrow > 0) {
                        if (dt_eff_dt !== new Date(dt_prior_end_dt.setDate(dt_prior_end_dt.getDate() + 1))) {
                            al_error_row = l_row;
                            return 2;
                        }
                    }

                    dt_prior_end_dt = dt_end_dt;
                    l_row++;
                    l_keyrow++;
                    if (l_row < l_rowcount) {
                        s_key = adw_datawindow[l_row][ls_key_col];
                        if (ls_col === 'string') {
                            ls_key2 = adw_datawindow[l_row][ls_key_col2];
                        } else {
                            ll_key2 = adw_datawindow[l_row][ls_key_col2];
                            ls_key2 = ll_key2.toString();
                        }

                        if (s_key === null || ls_key2 === null) {
                            al_error_row = l_row;
                            return 3;
                        }
                    }
                    else {
                        s_priorkey = s_key;
                        ls_prior_key2 = ls_key2;
                        dt_prior_end_dt = new Date(1699, 11, 31);
                        l_keyrow = 0;
                    }
                }
            }
        } else {
            // todo next day 17/1//2017
            while (l_row < l_rowcount) {
                if (s_key === s_priorkey) {
                    dt_eff_dt = new Date(adw_datawindow[l_row].EFF_DT);
                    dt_end_dt = new Date(adw_datawindow[l_row].END_DT);

                    if (dt_eff_dt <= dt_prior_end_dt) {
                        al_error_row = l_row;
                        return 1;
                    }

                    if (!ab_gaps_allowed && l_keyrow > 0) {
                        if (dt_eff_dt !== new Date(dt_prior_end_dt.setDate(dt_prior_end_dt.getDate() + 1))) {
                            al_error_row = l_row;
                            return 2;
                        }
                    }

                    dt_prior_end_dt = dt_end_dt;
                    l_row++;
                    l_keyrow++;
                    if (l_row < l_rowcount) {
                        s_key = adw_datawindow[l_row][ls_key_col];
                        if (s_key === null) {
                            al_error_row = l_row;
                            return 3;
                        }
                    }
                } else {
                    s_priorkey = s_key;
                    dt_prior_end_dt = new Date(1699, 11, 31);
                    l_keyrow = 1;
                }
            }
        }

        // column sort will be done later
        return 0;
    }

    public pos(str: string, ch: string): number {
        return str.indexOf(ch);
    }

    public f_set_quarter_dates(adw_datawindow: any, as_eff_colname: string, as_end_colname: string): number {

        let i_returnCode: number = -1;
        let l_rowCount: number;
        let l_row: number = 0;
        let dwis_status: string;
        let dt_eff_dt: any;
        let dt_end_dt: any;


        l_rowCount = adw_datawindow.length;

        if (l_rowCount < 1) return 0;

        while (l_row < l_rowCount) {
            dwis_status = adw_datawindow[l_row].newItem || adw_datawindow[l_row].updated;
            if (dwis_status) {
                //if (adw_datawindow[l_row].newItem) {
                //    dt_eff_dt = new Date(0, 0, 0);
                //    dt_end_dt = new Date(0, 0, 0);
                //} else {
                dt_eff_dt = new Date(adw_datawindow[l_row][as_eff_colname]);
                dt_end_dt = new Date(adw_datawindow[l_row][as_end_colname]);
                //}

                if (dt_eff_dt !== new Date(1700, 1, 1)) {
                    dt_eff_dt = this.f_begin_quarter_date(dt_eff_dt);
                    adw_datawindow[l_row][as_eff_colname] = moment(dt_eff_dt).format("MM/DD/YYYY");
                }

                if (dt_end_dt !== new Date(2100, 1, 1)) {
                    dt_end_dt = this.f_end_quarter_date(dt_end_dt);
                    adw_datawindow[l_row][as_end_colname] = moment(new Date(dt_end_dt.getFullYear(), dt_end_dt.getMonth(), dt_end_dt.getDay() - 1, 23, 59, 59)).format("MM/DD/YYYY");
                } else {
                    adw_datawindow[l_row][as_end_colname] = moment(new Date(2100, 1, 1)).format("DD/MM/YYYY");

                }
                i_returnCode++;
            }
            l_row++;
        }

        return i_returnCode;
    }

    public f_begin_quarter_date(as_date: Date): Date {
        let i_month: number;
        let i_year: number;
        let dt_begin_q_date: Date;



        i_month = as_date.getMonth();
        i_year = as_date.getFullYear();

        switch (i_month) {
            case 0:
            case 1:
            case 2:
                dt_begin_q_date = new Date(i_year, 0, 1);
                break;
            case 3:
            case 4:
            case 5:
                dt_begin_q_date = new Date(i_year, 3, 1);
                break;
            case 6:
            case 7:
            case 8:
                dt_begin_q_date = new Date(i_year, 6, 1);
                break;
            case 9:
            case 10:
            case 11:
                dt_begin_q_date = new Date(i_year, 9, 1);
                break;
        }
        return dt_begin_q_date;
    }

    public f_end_quarter_date(as_date: Date): Date {
        let i_month: number;
        let i_year: number;
        let dt_end_q_date: Date;

        if (as_date >= new Date("01/01/2100")) {
            return new Date("01/01/2100");
        }

        i_month = as_date.getMonth();
        i_year = as_date.getFullYear();

        switch (i_month) {
            case 0:
            case 1:
            case 2:
                dt_end_q_date = new Date(i_year, 2, 31);
                break;
            case 3:
            case 4:
            case 5:
                dt_end_q_date = new Date(i_year, 5, 30);
                break;
            case 6:
            case 7:
            case 8:
                dt_end_q_date = new Date(i_year, 8, 30);
                break;
            case 9:
            case 10:
            case 11:
                dt_end_q_date = new Date(i_year, 11, 31);
                break;
        }
        return dt_end_q_date;
    }

}