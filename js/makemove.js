function ClearPieces(captures) {
    let bit = 1;
    for(let i = 0; i < BRD_CAPTURE_SQ_NUM; i++) {
        if (captures & bit) {
            let index = brd_capture_to_pieces[i];
            let pce = brd_pieces[index];	
            HASH_PCE(pce, index);
            brd_pieces[index] = PIECES.EMPTY;
        }
        bit <<= 1;
    }
}

function AddCapturedPieces(captures) {
    let bit = 1;
    let kings = captures >> BRD_CAPTURE_SQ_NUM;
    let piece_men;
    let piece_king;

    if (brd_side == COLORS.WHITE) {
        piece_king = PIECES.bK;
        piece_men = PIECES.bM;
    } else {
        piece_king = PIECES.wK;
        piece_men = PIECES.wM;
    }

    let cap_bit = 1;
    let pce;
    for(let i = 0; i < BRD_CAPTURE_SQ_NUM; i++) {
        if (captures & bit) {
            let index = brd_capture_to_pieces[i];
            if (kings & cap_bit) pce  = piece_king;
            else pce = piece_men;
            HASH_PCE(pce, index);
            brd_pieces[index] = pce;
            cap_bit <<= 1;
        }
        bit <<= 1;
    }
}

function MovePiece(from, to, piece) {   
	
	let pce = brd_pieces[from];	

	HASH_PCE(pce,from);
	brd_pieces[from] = PIECES.EMPTY;
	
	HASH_PCE(piece, to);
	brd_pieces[to] = piece;	
	
}

function CountPieces()
{
    let count_wm = 0;
    let count_wk = 0;
    let count_bm = 0;
    let count_bk = 0;

    brd_pieces.forEach((element, index) => {
        switch(element) {
            case PIECES.wK:
                count_wk++;
                break;
            case PIECES.wM:
                count_wm++;
                break;
            case PIECES.bK:
                count_bk++;
                break;
            case PIECES.bM:
                count_bm++;
                break;
        }
    })

    return (count_wk << 12) | (count_wm << 8) | (count_bk << 4) | count_bm; 
}

function MakeMove(move, captures = undefined) {
	
	let from = FROMSQ(move);
    let to = TOSQ(move);
    let mv_piece = MVPS(move);
    let piece = brd_pieces[from];

    if (brd_side == COLORS.WHITE) {
        if (mv_piece == 1) piece = PIECES.wK;
    } else {
        if (mv_piece == 1) piece = PIECES.bK;
    }
    
 	brd_history[brd_hisPly].posKey = brd_posKey;
    brd_history[brd_hisPly].move = move;
    if (captures != undefined) brd_history[brd_hisPly].capture = captures;
    else brd_history[brd_hisPly].capture = NOMOVE;
	
    let capture = CAPTURED(move);
	
	if (capture) {
        if (captures == undefined) {
            console.log("capture error");
        }
        ClearPieces(brd_history[brd_hisPly].capture);
    }
    
	MovePiece(from, to, piece);
    let count_pieces = CountPieces();
    brd_history[brd_hisPly].countpieces = count_pieces;

    brd_hisPly++;
	brd_ply++;
	brd_side ^= 1;

    HASH_SIDE();
	
	return BOOL.TRUE;	
}

function TakeMove() {		
	
	brd_hisPly--;
    brd_ply--;
	
    let move = brd_history[brd_hisPly].move;
    let from = FROMSQ(move);
    let to = TOSQ(move);	
    let mv_piece = MVPS(move);
    let piece;

    brd_side ^= 1;
    HASH_SIDE();
	
   if (brd_side == COLORS.WHITE) {
        if (mv_piece == 1) piece = PIECES.wM;
        else piece = brd_pieces[to];
    } else {
        if (mv_piece == 1) piece = PIECES.bM;
        else piece = brd_pieces[to];
    }
	
	MovePiece(to, from, piece);
	
	let capture = CAPTURED(move);
    if (capture) {      
        AddCapturedPieces(brd_history[brd_hisPly].capture);
    }

    let count_pieces = CountPieces();
    if (brd_hisPly != 0 && count_pieces != brd_history[brd_hisPly - 1].countpieces) {
        console.log("TakeMove erorr");
    }
    
}
