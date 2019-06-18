let aPathOfCaptures = []; // all posible path of captures 

class PathOfCapture {
    
    constructor() {
        this.captures = [];
        this.change_piece = 0;
    }

    // add capture one move
    add(capture) {
        this.captures.push(capture);
    }

    // reomove last capture
    remove() {
        this.captures.pop();
    }

    isCaptured(def_index) {
        let ret = BOOL.FALSE;
        this.captures.forEach(element => {
            if (element.captured == def_index) ret = BOOL.TRUE;
        });
        return ret;
    }
}
