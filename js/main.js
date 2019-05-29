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

function init() {
    // console.log("Init");
    initBoardSquares();
}
