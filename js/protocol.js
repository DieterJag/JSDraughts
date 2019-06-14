function ThreeFoldRep() {
	var i = 0, r = 0;
	for (i = 0; i < brd_hisPly; ++i)	{
	    if (brd_history[i].posKey == brd_posKey) {
		    r++;
		}
	}
	return r;
}

function DrawMaterial() {

    return BOOL.FALSE;

    // let pieces_count = new Array(5);

    // brd_pieces.forEach(element => {
    //     if (element < 5) pieces_count[element]++;
    // })

    // if (pieces_count[PIECES.wM] != pieces_count[PIECES.bM] || pieces_count[PIECES.wK] != pieces_count[PIECES.bK]) return BOOL.FALSE;
	
    // return BOOL.TRUE;
}
