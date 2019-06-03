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
    let is_new_capture;
    let cap_count;
    let is_new_path;
    let cap_count_from;
    let atack_piece;
 
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
        if (element == atack_men || element == atack_king) { // MEN CAPTURE AND KING CAPTURE
            atack_piece = element;
            cap_index = index;
            brd_pieces[cap_index]=PIECES.EMPTY;
            is_new_capture = BOOL.TRUE;
            cap_count_from = aPathOfCaptures.length;
            cap_step = -1;                                    
            cap_path_now = new PathOfCapture();
            is_new_path = BOOL.TRUE;
            while(is_new_capture == BOOL.TRUE) {
                is_new_capture = BOOL.FALSE;
                cap_count = aPathOfCaptures.length;
                for(let i = cap_count_from; i < cap_count || cap_step == -1; i++) {
                    if (cap_step == -1) cap_step++;
                    if (cap_step > 0){
                        if (aPathOfCaptures[i].captures.length != cap_step) continue;
                        cap_path_now = aPathOfCaptures[i];
                        cap_index = cap_path_now.captures[cap_path_now.captures.length-1].to;
                        is_new_path = BOOL.FALSE;
                    }
                    if (atack_piece == atack_men) {
                        for( let j = 0; j < 4; j++) // Capture directions
                        {
                            def_index = cap_index + mv_dir[j];
                            empty_index = def_index + mv_dir[j];
                            if (def_index >= 0 && def_index < BRD_SQ_NUM &&
                                empty_index >= 0 && empty_index < BRD_SQ_NUM &&
                                (brd_pieces[def_index] == defence_men || 
                                brd_pieces[def_index] == defence_king) && 
                                brd_pieces[empty_index] == PIECES.EMPTY &&
                                cap_path_now.isCaptured(def_index) == BOOL.FALSE) {
                                    // Add captured new variant
                                    if (is_new_path == BOOL.TRUE) {
                                        let pathOfCapture = new PathOfCapture();
                                        pathOfCapture.captures = [...cap_path_now.captures];
                                        pathOfCapture.remove();
                                        aPathOfCaptures.push(pathOfCapture); // dublicate capture path without last capture
                                        cap_path_now = aPathOfCaptures[aPathOfCaptures.length - 1];
                                    }
                                    if (atack_piece == PIECES.wM && empty_index > 41) atack_piece = PIECES.wK;
                                    else if (atack_piece == PIECES.bM && empty_index < 9) atack_piece = PIECES.bK;
                                    cap_path_now.add(new Capture(cap_index, empty_index, def_index, atack_piece, mv_dir[j]));
                                    is_new_capture = BOOL.TRUE;
                                    is_new_path = BOOL.TRUE;
                                }
                        }
                    }
                    else if (atack_piece == atack_king) {
                        for( let j = 0; j < 4; j++) {
                            if (cap_step == 0 || 
                                mv_dir[j] != -cap_path_now.captures[cap_step - 1].dir) {
                                    def_index = cap_index + mv_dir[j];
                                    while(brd_pieces[def_index] == PIECES.EMPTY) def_index += mv_dir[j];
                                    empty_index = def_index + mv_dir[j];
                                    if (def_index >= 0 && def_index < BRD_SQ_NUM &&
                                        empty_index >= 0 && empty_index < BRD_SQ_NUM &&
                                        (brd_pieces[def_index] == defence_men || 
                                        brd_pieces[def_index] == defence_king) && 
                                        brd_pieces[empty_index] == PIECES.EMPTY &&
                                        cap_path_now.isCaptured(def_index) == BOOL.FALSE) {
                                            // check king have more captures
                                            let check_add = BOOL.FALSE;
                                            while(brd_pieces[empty_index] == PIECES.EMPTY) {
                                                let check_def_index = empty_index;
                                                for( let k = 0; k < 4; k++) {
                                                    if (Math.abs(mv_dir[j]) != Math.abs(mv_dir[k])) {
                                                        check_def_index = empty_index;
                                                        while(brd_pieces[check_def_index] == PIECES.EMPTY) check_def_index += mv_dir[k];
                                                        let check_empty_index = check_def_index + mv_dir[k];
                                                        if (check_def_index >= 0 && check_def_index < BRD_SQ_NUM &&
                                                            check_empty_index >= 0 && check_empty_index < BRD_SQ_NUM &&
                                                            (brd_pieces[check_def_index] == defence_men ||
                                                            brd_pieces[check_def_index] == defence_king) &&
                                                            brd_pieces[check_empty_index] == PIECES.EMPTY &&
                                                            cap_path_now.isCaptured(check_def_index) == BOOL.FALSE) {
                                                                k = 4;
                                                                if (is_new_path == BOOL.TRUE) {
                                                                    let pathOfCapture = new PathOfCapture();
                                                                    pathOfCapture.captures = [...cap_path_now.captures];
                                                                    pathOfCapture.remove();
                                                                    aPathOfCaptures.push(pathOfCapture); // dublicate capture path without last capture
                                                                    cap_path_now = aPathOfCaptures[aPathOfCaptures.length - 1];
                                                                }
                                                                cap_path_now.add(new Capture(cap_index, empty_index, def_index, atack_piece, mv_dir[j]));
                                                                check_add = BOOL.TRUE;
                                                                is_new_capture = BOOL.TRUE;
                                                                is_new_path = BOOL.TRUE;
                                                        }
                                                    }
                                                }
                                                empty_index += mv_dir[j];
                                            }
                                            if (check_add == BOOL.FALSE) {
                                                let check_def_index = empty_index;
                                                let check_empty_index = empty_index + mv_dir[j];
                                                if (check_def_index >= 0 && check_def_index < BRD_SQ_NUM &&
                                                    check_empty_index >= 0 && check_empty_index < BRD_SQ_NUM &&
                                                    (brd_pieces[check_def_index] == defence_men ||
                                                    brd_pieces[check_def_index] == defence_king) &&
                                                    brd_pieces[check_empty_index] == PIECES.EMPTY &&
                                                    cap_path_now.isCaptured(check_def_index) == BOOL.FALSE) {
                                                        k = 4;
                                                        if (is_new_path == BOOL.TRUE) {
                                                            let pathOfCapture = new PathOfCapture();
                                                            pathOfCapture.captures = [...cap_path_now.captures];
                                                            pathOfCapture.remove();
                                                            aPathOfCaptures.push(pathOfCapture); // dublicate capture path without last capture
                                                            cap_path_now = aPathOfCaptures[aPathOfCaptures.length - 1];
                                                        }
                                                        cap_path_now.add(new Capture(cap_index, empty_index, def_index, atack_piece, mv_dir[j]));
                                                        check_add = BOOL.TRUE;
                                                        is_new_capture = BOOL.TRUE;
                                                        is_new_path = BOOL.TRUE;
                                                }
                                            }
                                            // Add captured new variant
                                            if (check_add == BOOL.FALSE) {
                                                empty_index = def_index + mv_dir[j];
                                                while(brd_pieces[empty_index] == PIECES.EMPTY) {
                                                    if (is_new_path == BOOL.TRUE) {
                                                        let pathOfCapture = new PathOfCapture();
                                                        pathOfCapture.captures = [...cap_path_now.captures];
                                                        pathOfCapture.remove();
                                                        aPathOfCaptures.push(pathOfCapture); // dublicate capture path without last capture
                                                        cap_path_now = aPathOfCaptures[aPathOfCaptures.length - 1];
                                                    }
                                                    cap_path_now.add(new Capture(cap_index, empty_index, def_index, atack_piece, mv_dir[j]));
                                                    is_new_capture = BOOL.TRUE;
                                                    is_new_path = BOOL.TRUE;
                                                    empty_index += mv_dir[j];
                                                }    
                                            }
                                        }
                            }
                        }
                    }
                }
                cap_step++;
            }
            brd_pieces[index] = atack_men;
        }
        index++;
    });
}
