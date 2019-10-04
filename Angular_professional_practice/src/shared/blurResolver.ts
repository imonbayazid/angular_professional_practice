import {Injectable} from '@angular/core';

@Injectable()
export class BlurResolver {
    private hasSave = false;
    private hasBlur = false;
    private saveFx = null;
    constructor() {
        this.hasSave = false;
        this.hasBlur = false;
        this.saveFx = null;
    }
    setBlur(fx) {
        this.hasBlur = true;
        fx().then(res => {
            this.hasBlur = false;
            if (res && this.saveFx) {
                this.saveFx();
                this.saveFx = null;
            }
        });
    }
    setSave(fx) {
        if (this.hasBlur) {
            this.saveFx = fx;
        }
        else {
            this.saveFx = null;
            fx();
        }
    }
}
