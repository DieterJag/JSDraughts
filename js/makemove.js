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
    let captured_count = 0;
    let cap_index = 0;
    let def_index = 0;
    let empty_index = 0;
    let is_captured = BOOL.FALSE;
    let cap_variant = 0;

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

    brd_pieces.forEach(element => {
        if (element == atack_men) { // MEN CAPURE
            captured_count = 0;
            cap_index = index;
            captures.length = 0; // delete all elements
            is_captured = BOOL.FALSE;
            for( let j = 0; j < 4; j++) // Capture directions
            {
                def_index = cap_index + mv_dir[j];
                empty_index = def_index + mv_dir[j];
                if (def_index >= 0 && def_index < BRD_SQ_NUM &&
                    empty_index >= 0 && empty_index < BRD_SQ_NUM &&
                    (brd_pieces[def_index] == defence_men || 
                    brd_pieces[def_index] == defence_king) && 
                    brd_pieces[empty_index] == PIECES.EMPTY &&
                    isCapured(def_index, cap_variant) == BOOL.FALSE) {
                        // Add captured
                        console.log("capture from: "+cap_index+" to: "+empty_index+" captured: "+def_index);
                        is_captured = BOOL.TRUE;
                    }
            }
        }
        index++;
    })
}