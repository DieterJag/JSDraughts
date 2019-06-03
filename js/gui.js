$("#SetFen").click(function () {
	let fenStr = $("#fenIn").val();	
	ParseFen(fenStr);
	// PrintBoard();		
    SetInitialBoardPieces();	
    GenerateCaptures();
    console.log(aPathOfCaptures);
    if (aPathOfCaptures.length == 0) {
        GenerateMoves();
        console.log(aMoves);
    }

	// GameController.PlayerSide = brd_side;	
	// CheckAndSet();	
	// EvalPosition();	
	// //PerftTest(5);
	// newGameAjax();	 
});

function AddGUIPiece(sq,pce) {	
	let rank = RanksBrd[sq];
	let file = FilesBrd[sq];
	let rankName = "rank" + (rank + 1);	
	let fileName = "file" + (file + 1);	
	pieceFileName = "image/" + SideChar[PieceCol[pce]] + PceChar[pce].toLowerCase() + ".png";
	imageString = "<image src=\"" + pieceFileName + "\" class=\"Piece clickElement " + rankName + " " + fileName + "\"/>";
	// console.log("add on " + imageString);
	$("#Board").append(imageString);
}

function SetInitialBoardPieces(){

    let index = 0;
	ClearAllPieces();
	brd_pieces.forEach(element => {
		if (element != PIECES.EMPTY && element != SQUARES.OFFBOARD) AddGUIPiece(index, element);
		index++;
	})

}

function ClearAllPieces() {
	console.log("Removing pieces");
	$(".Piece").remove();
}
