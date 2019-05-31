let aPathOfCaptures = []; // all posible path of captures 

class PathOfCapture {
    
    constructor() {
        this.captures = [];
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
        // console.log('cap_path_now='+cap_path_now+' aPathOfCaptures[cap_path_now]='+aPathOfCaptures[cap_path_now])
        console.log("isCaptured:");
        console.log(this);
        this.captures.forEach(element => {
            if (element.captured = def_index) return BOOL.TRUE;
        });
        return BOOL.FALSE;
    }
}