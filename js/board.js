// board variables

let brd_side = COLORS.WHITE;
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
let brd_cap_PvArray = new Array(MAXDEPTH);
let brd_searchHistory = new Array(4 * BRD_SQ_NUM);
let brd_searchKillers = new Array(3 * MAXDEPTH);

function BoardToFen() {
    let fenStr;
    let fenW = "";
    let fenB = "";

    brd_pieces.forEach((element, index) => {
        switch(element){
            case PIECES.wM:
                if (fenW.length == 0) fenW = "W";
                else fenW += ",";
                fenW += IND2STD(index);
                break;
            case PIECES.wK:
                if (fenW.length == 0) fenW = "W";
                else fenW += ",";
                fenW += "K"+IND2STD(index);
                break;
            case PIECES.bM:
                if (fenB.length == 0) fenB = "B";
                else fenB += ",";
                fenB+= IND2STD(index);
                break;
            case PIECES.bK:
                if (fenB.length == 0) fenB = "B";
                else fenB += ",";
                fenB+= "K"+IND2STD(index);
                break;
        }
    })
    
    if (brd_side == 0) fenStr = "W:";
    else fenStr = "B:";
	
	return fenStr+fenW+":"+fenB;
}

function ParseFenPos(fen, color) {
    let pos;
    let piece;
    let rank;
    let file;

    switch(color) {
        case COLORS.WHITE: piece = PIECES.wM; break;
        case COLORS.BLACK: piece = PIECES.bM; break;
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
            case 0: brd_side = (element == "W") ? COLORS.WHITE : COLORS.BLACK; break;
            case 1: if (element[0] == 'W') ParseFenColor(element.substr(1), COLORS.WHITE); break;
            case 2: if (element[0] == 'B') ParseFenColor(element.substr(1), COLORS.BLACK); break;
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
	brd_side = COLORS.BOTH;
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
			finalKey ^= PieceKeys[piece * 46 + sq];
		}		
	}
	
	if(brd_side == COLORS.WHITE) {
		finalKey ^= SideKey;
	}
		
	return finalKey;
}
