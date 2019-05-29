// board variables

var brd_side = COLOURS.WHITE;
var brd_pieces = new Array(BRD_SQ_NUM);

function ParseFenPos(fen, color) {
    var pos;
    var piece;
    var rank;
    var file;

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
    var fenA = fen.split(",");
    var index = 0;

    fenA.forEach(element => {
        ParseFenPos(element, color);
    });
}

function ParseFen(fen) {

    var fenA = fen.split(":");
    var index = 0;

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
}

function ResetBoard() {
	for(index = 0; index < BRD_SQ_NUM; ++index) {
		brd_pieces[index] = PIECES.EMPTY;
	}
}
