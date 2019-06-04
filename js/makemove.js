function ClearPieces(move) {
    let captures = move >> 14;
    let cap_count = captures & 0xF;
    captures >>= 4;
    for(let i = 0; i < cap_count; i++) {
        let index = captures & 0x3F;
        let pce = brd_pieces[index];	
        HASH_PCE(pce, index);
        brd_pieces[index] = PIECES.EMPTY;
        captures >>= 7;
    }
}

function AddCapturedPieces(move) {
    let mv_piece_all = MVPS(move);	
    let captures = move >> 14;
    let cap_count = captures & 0xF;
    if (brd_side = COLOURS.WHITE) {
        if (mv_piece_all == 1) piece = PIECES.wK;
        else piece = PIECES.wM;
    } else {
        if (mv_piece_all == 1) piece = PIECES.bK;
        else piece = PIECES.bM;
    }
	
    captures >>= 4;
    for(let i = 0; i < cap_count; i++) {
        let index = captures & 0x3F;
        let mv_piece = (captures >> 6) & 1;
        if (brd_side = COLOURS.WHITE) {
            if (mv_piece == 1) piece = PIECES.wM;
        } else {
            if (mv_piece == 1) piece = PIECES.bM;
        }
        HASH_PCE(piece, index);
        brd_pieces[index] = piece;
        captures >>= 7;
    }
}

function MovePiece(from, to, piece) {   
	
	let pce = brd_pieces[from];	

	HASH_PCE(pce,from);
	brd_pieces[from] = PIECES.EMPTY;
	
	HASH_PCE(piece, to);
	brd_pieces[to] = piece;	
	
}

function MakeMove(move) {
	
	let from = FROMSQ(move);
    let to = TOSQ(move);
    let mv_piece = MVPS(move);
    let piece;

    if (brd_side = COLOURS.WHITE) {
        if (mv_piece == 1) piece = PIECES.wK;
        else piece = PIECES.wM;
    } else {
        if (mv_piece == 1) piece = PIECES.bK;
        else piece = PIECES.bM;
    }
	
	brd_history[brd_hisPly].posKey = brd_posKey;
	brd_history[brd_hisPly].move = move;
	brd_hisPly++;
	brd_ply++;
	
    let capture = CAPTURED(move);
	
	if (capture) {
        ClearPieces(move);
    }
	
	MovePiece(from, to, piece);
	
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
    let piece = MVPS(move);
	
    brd_side ^= 1;
    HASH_SIDE();
	
	MovePiece(to, from, -piece);
	
	let capture = CAPTURED(move);
    if(capture) {      
        AddCapturedPieces(move);
    }
}
