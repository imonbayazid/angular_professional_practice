import {Injectable}   from '@angular/core';
@Injectable()
export class juDateTimeUtil {
    public f_set_quarter_dates(data, as_eff_colname, as_end_colname) {
        let i_ReturnCode;
        let l_RowCount, l_row = 1;
        //dwItemStatus dwis_status
        let dt_eff_dt, dt_end_dt;

        l_RowCount = data.length;

        if (l_RowCount < 1) {
            return 0;
        }

        for (var i = 0; i < l_RowCount; i++) {
            //* Processing for each row
            let row = data[i];
            //dwis_status = adw_datawindow.GetItemStatus(l_row, 0, Primary!)
            if (row.isNew || row.isUpdated) {
                dt_eff_dt = row[as_eff_colname];
                dt_end_dt = row[as_end_colname];

                //* Set the date values to the quarter date values.
                if (new Date(dt_eff_dt).getTime() != new Date('1700-01-01').getTime()) {
                    dt_eff_dt = this.beginQuarterDate(new Date(dt_eff_dt));
                    row[as_eff_colname] = dt_eff_dt;
                }

                if (new Date(dt_end_dt).getTime() !== new Date('2100-01-01').getTime()) {
                    dt_end_dt = this.endQuarterDate(new Date(dt_end_dt));
                    row[as_end_colname] = new Date(new Date(dt_end_dt).setHours(23, 59, 59)).toISOString();
                }
                else {
                    row[as_end_colname] = '01/01/2100' //2100-01-01

                }

                i_ReturnCode++
            }
        }
        return i_ReturnCode;
    }

    public beginQuarterDate(date: Date) {

        let month = date.getMonth() + 1;
        let year = date.getFullYear();

        let eff_dt;

        if (month === 1 || month === 2 || month === 3) {
            eff_dt = "01/01/" + year;
        }
        if (month === 4 || month === 5 || month === 6) {
            eff_dt = "04/01/" + year;
        }
        if (month === 7 || month === 8 || month === 9) {
            eff_dt = "07/01/" + year;
        }
        if (month === 10 || month === 11 || month === 12) {
            eff_dt = "10/01/" + year;
        }

        return eff_dt;
    }

    public endQuarterDate(date: Date) {

        let month = date.getMonth() + 1;
        let year = date.getFullYear();

        let end_dt;

        if (month === 1 || month === 2 || month === 3) {
            end_dt = "03/31/" + year;
        }
        if (month === 4 || month === 5 || month === 6) {
            end_dt = "06/30/" + year;
        }
        if (month === 7 || month === 8 || month === 9) {
            end_dt = "09/30/" + year;
        }
        if (month === 10 || month === 11 || month === 12) {
            end_dt = "12/31/" + year;
        }

        return end_dt;
    }
}