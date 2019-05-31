let mv_dir = new Array(4);
let mv_captured = [];

function initDirections() {
    mv_dir[0] = 4;
    mv_dir[1] = 5;
    mv_dir[2] = -4;
    mv_dir[3] = -5;
}

function GenerateMoves() {

}

function GenerateCaptures() {
    let atack_men;
    let atack_king;
    let defence_men;
    let defence_king;
    let index = 0;
    let cap_index = 0;
    let def_index = 0;
    let empty_index = 0;
    let cap_step = -1;
    let cap_path_now;
    let cap_path_new;
    let is_new_capture;
    let cap_count;
 
    if (brd_side == COLOURS.WHITE) {
        atack_men = PIECES.wM;
        atack_king = PIECES.wK;
        defence_men = PIECES.bM;
        defence_king = PIECES.bK;
    } else {
        atack_men = PIECES.bM;
        atack_king = PIECES.bK;
        defence_men = PIECES.wM;
        defence_king = PIECES.wK;
    }

    // aPathOfCaptures.forEach(element => {
    //     element.length = 0;});
    aPathOfCaptures.length = 0; // delete all elements
    brd_pieces.forEach(element => {
        if (element == atack_men) { // MEN CAPTURE
            captured_count = 0;
            cap_index = index;
            is_new_capture = BOOL.TRUE;
            while(is_new_capture == BOOL.TRUE) {
                is_new_capture = BOOL.FALSE;
                cap_count = aPathOfCaptures.length;
                console.log('cap_count='+cap_count+' cap_step='+cap_step);
                for(let i = 0; i < cap_count || cap_step == -1; i++) {
                    if (cap_step == -1) cap_step++;
                    if (cap_step > 0){
                        if (aPathOfCaptures[i].length != cap_step) continue;
                        cap_path_now = aPathOfCaptures[i];
                    }
                    cap_path_new = cap_path_now;
                    for( let j = 0; j < 4; j++) // Capture directions
                    {
                        def_index = cap_index + mv_dir[j];
                        empty_index = def_index + mv_dir[j];
                        console.log('def_index='+def_index+' empty_index='+empty_index);
                        console.log(cap_path_now);
                        if (def_index >= 0 && def_index < BRD_SQ_NUM &&
                            empty_index >= 0 && empty_index < BRD_SQ_NUM &&
                            (brd_pieces[def_index] == defence_men || 
                            brd_pieces[def_index] == defence_king) && 
                            brd_pieces[empty_index] == PIECES.EMPTY &&
                            (!cap_path_now ||
                            cap_path_now.isCaptured(def_index) == BOOL.FALSE)) {
                                // Add captured new variant
                                if (cap_path_new == -1 && cap_path_now) {
                                    console.log(aPathOfCaptures);
                                    console.log(cap_path_now);
                                    let pathOfCapture = Object.assign(cap_path_now);
                                    console.log(pathOfCapture);
                                    pathOfCapture.remove();
                                    aPathOfCaptures.push(pathOfCapture); // dublicate capture path without last capture
                                    cap_path_now = aPathOfCaptures[aPathOfCaptures.length - 1];
                                    console.log("83:");
                                    console.log(aPathOfCaptures);
                                }
                                if (aPathOfCaptures[cap_path_now] == undefined) aPathOfCaptures[cap_path_now] = new PathOfCapture();
                                // aCaptures.push(new Capture(cap_index, empty_index, def_index));
                                let pathOfCapture = aPathOfCaptures[cap_path_now];
                                console.log(pathOfCapture);
                                pathOfCapture.add(new Capture(cap_index, empty_index, def_index));
                                console.log("capture from: "+cap_index+" to: "+empty_index+" captured: "+def_index+" aPathOfCaptures=");
                                console.log(aPathOfCaptures);
                                is_new_capture = BOOL.TRUE;
                                cap_path_new = -1;
                            }
                    }
                }
                cap_step++;
            }
        }
        index++;
    });
}
