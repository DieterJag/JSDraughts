// board variables

let brd_side = COLOURS.WHITE;
let brd_pieces = new Array(BRD_SQ_NUM);
let brd_capture_pieces = new Array(BRD_SQ_NUM);
let brd_capture_to_pieces = new Array(BRD_CAPTURE_SQ_NUM);
let brd_posKey;	
let brd_ply;
let brd_hisPly;
let brd_history = [];
let brd_moveList = new Array(MAXDEPTH * MAXPOSITIONMOVES);
let brd_moveScores = new Array(MAXDEPTH * MAXPOSITIONMOVES);
let brd_captureList  = new Array(MAXDEPTH * MAXPOSITIONMOVES);
let brd_captureListStart = new Array(MAXDEPTH * MAXPOSITIONMOVES);
let brd_moveListStart = new Array(MAXDEPTH);

let brd_PvTable = [];	
let brd_PvArray = new Array(MAXDEPTH);
let brd_searchHistory = new Array(4 * BRD_SQ_NUM);
let brd_searchKillers = new Array(3 * MAXDEPTH);

function BoardToFen() {
    let fenStr;
    
    if (brd_side == 0) fenStr = "W:";
    else fenStr = "B:";
	
	for(rank = RANKS.RANK_8; rank >= RANKS.RANK_1; rank--) {
		emptyCount = 0; 
		for(file = FILES.FILE_A; file <= FILES.FILE_H; file++) {
			sq = FR2SQ(file,rank);
			piece = brd_pieces[sq];
			if(piece == PIECES.EMPTY) {
				emptyCount++;
			} else {
				if(emptyCount!=0) {
					fenStr += String.fromCharCode('0'.charCodeAt() + emptyCount);
				}
				emptyCount = 0;
				fenStr += PceChar[piece];
			}
		}
		if(emptyCount!=0) {
			fenStr += String.fromCharCode('0'.charCodeAt() + emptyCount);
		}
		
		if(rank!=RANKS.RANK_1) {
			fenStr += '/'
		} else {
			fenStr += ' ';
		}
	}
	
	fenStr += SideChar[brd_side] + ' ';
	if(brd_enPas == SQUARES.NO_SQ) {
		fenStr += '- '
	} else {
		fenStr += PrSq(brd_enPas) + ' ';
	}
	
	if(brd_castlePerm == 0) {
		fenStr += '- '
	} else {
		if(brd_castlePerm & CASTLEBIT.WKCA) fenStr += 'K';
		if(brd_castlePerm & CASTLEBIT.WQCA) fenStr += 'Q';
		if(brd_castlePerm & CASTLEBIT.BKCA) fenStr += 'k';
		if(brd_castlePerm & CASTLEBIT.BQCA) fenStr += 'q';
	}
	fenStr += ' ';
	fenStr += brd_fiftyMove;
	fenStr += ' ';
	var tempHalfMove = brd_hisPly;
	if(brd_side == COLOURS.BLACK) {
		tempHalfMove--;
	}
	fenStr += tempHalfMove/2;	
	
	return fenStr;
}

function ParseFenPos(fen, color) {
    let pos;
    let piece;
    let rank;
    let file;

    switch(color) {
        case COLOURS.WHITE: piece = PIECES.wM; break;
        case COLOURS.BLACK: piece = PIECES.bM; break;
    }
    if (fen[0] == 'K') { piece++; pos = Number(fen.substr(1));}
    else pos = Number(fen);
    rank = Math.floor((pos-1)/4);
    file = Math.floor(((pos - 1) % 4) * 2 + rank % 2);
    // console.log("color="+color+" fen="+fen+" pos="+pos+" piece="+piece+" rank="+rank+" file="+file);
    brd_pieces[FR2SQ(file, rank)] = piece;
}

function ParseFenColor(fen, color) {
    // console.log("fen="+fen+" color="+color);
    let fenA = fen.split(",");
    let index = 0;

    fenA.forEach(element => {
        ParseFenPos(element, color);
    });
}

function ParseFen(fen) {

    let fenA = fen.split(":");
    let index = 0;

    ResetBoard();

    fenA.forEach(element => {
        // console.log("index="+index+" fen="+element);
        switch(index) {
            case 0: brd_side = (element == "W") ? COLOURS.WHITE : COLOURS.BLACK; break;
            case 1: if (element[0] == 'W') ParseFenColor(element.substr(1), COLOURS.WHITE); break;
            case 2: if (element[0] == 'B') ParseFenColor(element.substr(1), COLOURS.BLACK); break;
        }
        index++;
    });

    brd_posKey = GeneratePosKey();
}

function ResetBoard() {
	for(index = 0; index < BRD_SQ_NUM; ++index) {
        if (FilesBrd[index] == SQUARES.OFFBOARD) brd_pieces[index] = SQUARES.OFFBOARD;
        else brd_pieces[index] = PIECES.EMPTY;
	}
	brd_side = COLOURS.BOTH;
	brd_ply = 0;
	brd_hisPly = 0;	
	brd_posKey = 0;
	brd_moveListStart[brd_ply] = 0;
	brd_captureListStart[brd_ply] = 0;
}

function GeneratePosKey() {

	let sq = 0;
	let finalKey = 0;
	let piece = PIECES.EMPTY;
	
	// pieces
	for(sq = 0; sq < BRD_SQ_NUM; ++sq) {
		piece = brd_pieces[sq];
		if(piece != PIECES.EMPTY && piece != SQUARES.OFFBOARD) {			
			finalKey ^= PieceKeys[(piece - 1) * 32 + sq];
		}		
	}
	
	if(brd_side == COLOURS.WHITE) {
		finalKey ^= SideKey;
	}
		
	return finalKey;
}
