function GetPvLine(depth) {

	//console.log("GetPvLine");
	let move;
	let capture;
	let index = ProbePvTable();
	if (index != -1) {
		move = brd_PvTable[index].move;
		capture = brd_PvTable[index].capture;
	} else {
		move = NOMOVE;
		capture = NOMOVE;
	}
	let count = 0;
	
	while(move != NOMOVE && count < depth) {
	
		if( MoveExists(move) ) {
			MakeMove(move, capture);
			brd_PvArray[count] = move;
			brd_cap_PvArray[count++] = capture;
			//console.log("GetPvLine added " + PrMove(move));	
		} else {
			break;
		}		
		index = ProbePvTable();	
		if (index != -1) {
			move = brd_PvTable[index].move;
			capture = brd_PvTable[index].capture;
		} else {
			move = NOMOVE;
			capture = NOMOVE;
		}
		}
	
	while(brd_ply > 0) {
		TakeMove();
	}
	return count;
	
}

function StorePvMove(move, capture) {

	let index = brd_posKey % PVENTRIES;	
	
	brd_PvTable[index].move = move;
	brd_PvTable[index].capture = capture;
    brd_PvTable[index].posKey = brd_posKey;
}

function ProbePvTable() {

	let index = brd_posKey % PVENTRIES;	
	
	if( brd_PvTable[index].posKey == brd_posKey ) {
		return index;
	}
	
	return -1;
}