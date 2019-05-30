// board variables

let brd_side = COLOURS.WHITE;
let brd_pieces = new Array(BRD_SQ_NUM);
let brd_posKey;	
let brd_ply;
let brd_history = [];

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
    console.log("color="+color+" fen="+fen+" pos="+pos+" piece="+piece+" rank="+rank+" file="+file);
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
            case 0: (element == "W") ? brd_side = COLOURS.WHITE : COLOURS.BLACK; break;
            case 1: if (element[0] == 'W') ParseFenColor(element.substr(1), COLOURS.WHITE); break;
            case 2: if (element[0] == 'B') ParseFenColor(element.substr(1), COLOURS.BLACK); break;
        }
        index++;
    });

    brd_posKey = GeneratePosKey();
}

function ResetBoard() {
	for(index = 0; index < BRD_SQ_NUM; ++index) {
		brd_pieces[index] = PIECES.EMPTY;
	}
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
