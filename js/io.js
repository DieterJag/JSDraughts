function PrSq(sq) {
	let file = FilesBrd[sq];
	let rank = RanksBrd[sq];
	
	let sqStr = String.fromCharCode('a'.charCodeAt() + file) + String.fromCharCode('1'.charCodeAt() + rank);
	return sqStr;
}

function PrMove(move, captures = undefined) {

	let MvStr;
	
	let ff = FilesBrd[FROMSQ(move)];
	let rf = RanksBrd[FROMSQ(move)];
	let ft = FilesBrd[TOSQ(move)];
	let rt = RanksBrd[TOSQ(move)];
	
	MvStr = String.fromCharCode('a'.charCodeAt() + ff) + String.fromCharCode('1'.charCodeAt() + rf) + 
				String.fromCharCode('a'.charCodeAt() + ft) + String.fromCharCode('1'.charCodeAt() + rt)
				
    let capture = CAPTURED(move);
    if (capture) {
        MvStr += " captured: ";
        let cap_bit = 1;
        let bit = 1;
        let kings = captures >> 18;
        for(let i = 0; i < BRD_CAPTURE_SQ_NUM; i++) {
            if (captures & bit) {
                let index = brd_capture_to_pieces[i];
                if (kings & cap_bit) MvStr += "K";
                ff = FilesBrd[index];
                rf = RanksBrd[index];
                MvStr += String.fromCharCode('a'.charCodeAt() + ff) + String.fromCharCode('1'.charCodeAt() + rf) + ':';               
                cap_bit <<= 1;
            }
            bit <<= 1;
        }
    }  
                
	return MvStr;
}

function ParseMove(from, to) {
	
	GenerateCaptures();
    if (aPathOfCaptures.length == 0) {
        GenerateMoves();
    }
   
	let Move = NOMOVE;
	// let PromPce = PIECES.EMPTY;
	let found = BOOL.FALSE;
	for(index = brd_moveListStart[brd_ply]; index < brd_moveListStart[brd_ply + 1]; ++index) {	
		Move = brd_moveList[index];	
		if(FROMSQ(Move)==from && TOSQ(Move)==to) {
			// PromPce = PROMOTED(Move);
			// if(PromPce!=PIECES.EMPTY) {
			// 	if( (PromPce==PIECES.wQ && brd_side==COLOURS.WHITE) || (PromPce==PIECES.bQ && brd_side==COLOURS.BLACK) ) {
			// 		found = BOOL.TRUE;
			// 		break;
			// 	}
			// 	continue;
			// }
			found = BOOL.TRUE;
			break;
		}
    }
	
	if(found != BOOL.FALSE) {
		if(MakeMove(Move) == BOOL.FALSE) {
			return NOMOVE;
		}
		TakeMove();
		return Move;
	}
	
    return NOMOVE;	
}
