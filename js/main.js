$(function() {
    // console.log("Start");
    init();
});

function initBoardSquares() {

	
	var light = 1;
	var rankName;
	var fileName;
	var divString;
	var lightString;
	
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
	
	var index = 0;
	var file = FILES.FILE_A;
	var rank = RANKS.RANK_1;
	var sq = SQUARES.A1;
	var sq64 = 0;
	
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

function init() {
	var index = 0;

	InitFilesRanksBrd();
	ParseFen(START_FEN);
	initBoardSquares();
	brd_pieces.forEach(element => {
		if (element != PIECES.EMPTY) AddGUIPiece(index, element);
		index++;
	})
	// AddGUIPiece(5, 1);
	// AddGUIPiece(6, 2);
	// AddGUIPiece(39, 3);
	// AddGUIPiece(40, 4);
}
