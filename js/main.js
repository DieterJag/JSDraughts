$(function() {
    // console.log("Start");
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
	let sq = SQUARES.A1;
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
	
	for(index = 0; index < 2 * 4; ++index) {				
		PieceKeys[index] = RAND_32();
	}
	
	SideKey = RAND_32();
	
}

function init() {
	let index = 0;

	InitFilesRanksBrd();
	InitHashKeys();
	ParseFen(START_FEN);
	initBoardSquares();
	SetInitialBoardPieces();
}
