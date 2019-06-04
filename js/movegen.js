/*
move bits
000c cccc cpss ss00 0000 0011 1111 -> 6 bits of square from ( & 0x1F)
000c cccc cpss ss00 1111 1100 0000 -> 6 bits of square to ((>> 6) & 0x1F)
000c cccc cpss ss01 0000 0000 0000 -> 1 bits piece (0x1000) (1 - men -> king, 0 - otherwise)
000c cccc cpss ss10 0000 0000 0000 -> 1 bits move or capture (0x2000) = 1 - capture 

if capure
ssss -> 4 bits captured pieces count ((move >> 14) $0xf)
ccc cccp -> 7 * cap_count bits of capture square (5 bits) and piece (1 bit) ((move >> 18) $0x7f) first time
                                                                        ((shift_move >> 7) $0x7f) next time
*/

let mv_dir = new Array(4);
let mv_captured = [];

function initDirections() {
    mv_dir[0] = 4;
    mv_dir[1] = 5;
    mv_dir[2] = -4;
    mv_dir[3] = -5;
}

function AddQuiteMove(from, to, mv_piece) {
	brd_moveList[brd_moveListStart[brd_ply + 1]] = from | (to << 6) | (((mv_piece - 1) & 1) << 7);
	brd_moveListStart[brd_ply + 1]++;	
}

function AddCapuresMoves() {
    aPathOfCaptures.forEach(element => {
        let bit_cap = 0;
        let from;
        let to;
        let piece;
        element.forEach((cap_element, index) => {
            if (index == 0) from = cap_element.from;
            to = cap_element.to;
            piece = cap_element.piece;
            bit_cap = (bit_cap << 6) | (cap_element.captured << 1) | ((brd_pieces[ap_element.captured] - 1) & 1);
        })
        brd_moveList[brd_moveListStart[brd_ply + 1]] = from | (to << 6) | (((piece - 1) & 1) << 7) | 
                                                        0x2000  | cap_element.length | (bit_cap << 18);
	    brd_moveListStart[brd_ply + 1]++;	    
    })
}

function GenerateMoves() {
    let move_men;
    let move_king;
    let start_dir;
    let end_dir;

    if (brd_side == COLOURS.WHITE) {
        move_men = PIECES.wM;
        move_king = PIECES.wK;
        start_dir = 0;
        end_dir = 2;
    } else {
        move_men = PIECES.bM;
        move_king = PIECES.bK;
        start_dir = 2;
        end_dir = 4;
    }

    aMoves.length = 0;

    brd_pieces.forEach((element, index) => {
        if (element == move_men) {
            for(let i = start_dir; i < end_dir; i++) {
                let to_move = index + mv_dir[i];
                if (brd_pieces[to_move] == PIECES.EMPTY) {
                    let mv_piece = 0;
                    if ((brd_side == COLOURS.WHITE && to_move > 36) ||
                        (brd_side == COLOURS.BLACK && to_move < 9)) mv_piece = 1;
                    AddQuiteMove(index, to_move, mv_piece);
                }
            }
        } else if (element == move_king) {
            for(let i = 0; i < 4; i++) {
                let to_move = index + mv_dir[i];
                while(brd_pieces[to_move] = PIECES.EMPTY) {
                    AddQuiteMove(index, to_move, 0);
                    to_move += mv_dir[i];
                }
            }
        }
    });
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
                                    if (atack_piece == PIECES.wM && empty_index > 36) atack_piece = PIECES.wK;
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
    AddCapuresMoves();
}