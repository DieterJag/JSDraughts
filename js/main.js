$(function() {
    init();
	$('#fenIn').val(START_FEN);
});

function initBoardSquares() {

	
	let light = 1;
	let rankName;
	let fileName;
	let divString;
	let lightString;
	
	for(rankIter = RANKS.RANK_8; rankIter >= RANKS.RANK_1; rankIter--) {	
		light = light ^ 1;
		rankName = "rank" + (rankIter + 1);			
		for(fileIter = FILES.FILE_A; fileIter <= FILES.FILE_H; fileIter++) {			
		    fileName = "file" + (fileIter + 1); 
		    if(light==0) lightString="Light";
			else lightString="Dark";
			divString = "<div class=\"Square clickElement " + rankName + " " + fileName + " " + lightString + "\"/>";
			// console.log(divString);
			light ^= 1;
			$("#Board").append(divString);
		}
	}	
}

function InitFilesRanksBrd() {
	
	let index = 0;
	let file = FILES.FILE_A;
	let rank = RANKS.RANK_1;
	let sq;
	let sq64 = 0;
	
	for(index = 0; index < BRD_SQ_NUM; ++index) {
		FilesBrd[index] = SQUARES.OFFBOARD;
		RanksBrd[index] = SQUARES.OFFBOARD;
	}
	
	for(rank = RANKS.RANK_1; rank <= RANKS.RANK_8; ++rank) {
		for(file = FILES.FILE_A; file <= FILES.FILE_H; ++file) {
			sq = FR2SQ(file,rank);
			if ((file + rank) % 2 == 0) {
				FilesBrd[sq] = file;
				RanksBrd[sq] = rank;
				// console.log("file="+file+" rank="+rank+" sq="+sq);
			}
		}
	}
}

function InitHashKeys() {
    let index = 0;
	
	for(index = 0; index < 64 * 4; ++index) {				
		PieceKeys[index] = RAND_32();
	}
	
	SideKey = RAND_32();
	
}

function InitBoardVars() {

	var index = 0;
	for(index = 0; index < MAXGAMEMOVES; index++) {
		brd_history.push({
			move : NOMOVE,
			capture : NOMOVE,
			posKey : 0
		}); 
	}

	for(index = 0; index < EC_MASK; index++) {
		eval_hash.push({
			key : 0,
			score : 0
		}); 
	}

	for(index = 0; index < PVENTRIES; index++) {
		brd_PvTable.push({
			move : NOMOVE,
			capture : NOMOVE,
			posKey : 0
		}); 
	}
}

function InitCaptureBoard() {
	let cap_index = 0;
	for(index = 0; index < BRD_SQ_NUM; ++index) {
		if (FilesBrd[index] == SQUARES.OFFBOARD || 
			FilesBrd[index] == FILES.FILE_A || 
			FilesBrd[index] == FILES.FILE_H ||
			RanksBrd[index] == RANKS.RANK_1 ||
			RanksBrd[index] == RANKS.RANK_8) brd_capture_pieces[index] = SQUARES.OFFBOARD;
        else {
			brd_capture_pieces[index] = cap_index;
			brd_capture_to_pieces[cap_index] = index;
			cap_index++;
		}
	}
	// console.log(brd_capture_pieces);
	// console.log(brd_capture_to_pieces);
}

function init() {
	InitFilesRanksBrd();
	InitCaptureBoard();
	InitHashKeys();
	InitBoardVars();
	ParseFen(START_FEN);
	initBoardSquares();
	SetInitialBoardPieces();
	initDirections();

	// for(let i = 0; i<38; i++) StartSearch();
	PreSearch();
}
