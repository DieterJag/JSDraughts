$("#SetFen").click(function () {
	let fenStr = $("#fenIn").val();	
	ParseFen(fenStr);
	// PrintBoard();		
    SetInitialBoardPieces();	
    GenerateCaptures();
    console.log(aPathOfCaptures);
    if (aPathOfCaptures.length == 0) {
        GenerateMoves();
    }
    console.log(brd_moveList);
    console.log(brd_moveListStart);
    console.log(brd_history);

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

function MoveGUIPiece(move) {
	let from = FROMSQ(move);
	let to = TOSQ(move);
	
	let rank = RanksBrd[to];
	let file = FilesBrd[to];
	let rankName = "rank" + (rank + 1);	
	let fileName = "file" + (file + 1);
	
	$( ".Piece" ).each(function( index ) {
     if( (RanksBrd[from] == 7 - Math.round($(this).position().top/60)) && (FilesBrd[from] == Math.round($(this).position().left/60)) ){
     	$(this).removeClass();
     	$(this).addClass("Piece clickElement " + rankName + " " + fileName);     
     }
    });
    
    // printGameLine();
}

function PreSearch() {
		
	if(GameController.GameOver != BOOL.TRUE) {				
		srch_thinking = BOOL.TRUE;
		$('#ThinkingImageDiv').append('<image src="image/think3.png" id="ThinkingPng"/>')
		setTimeout( function() {StartSearch(); }, 200);
	}
}

function StartSearch() {
	srch_depth = MAXDEPTH;
	let t = $.now();
	let tt = $('#ThinkingTimeChoise').val();
	console.log("time:" + t + " TimeChoice:" + tt);
	srch_time = parseInt(tt) * 1000;
	SearchPosition(); 	
	
	// TODO MakeMove here on internal board and GUI
	MakeMove(srch_best);
	MoveGUIPiece(srch_best);	
	$('#ThinkingPng').remove();
	CheckAndSet();
}

function CheckAndSet() {
	if(CheckResult() != BOOL.TRUE) {
		GameController.GameOver = BOOL.FALSE;
		$("#GameStatus").text('');		
	} else {
		GameController.GameOver = BOOL.TRUE;
		GameController.GameSaved = BOOL.TRUE; // save the game here
	}
	$("#currentFenSpan").text(BoardToFen());
}

function CheckResult() {

    if (ThreeFoldRep() >= 2) {
     $("#GameStatus").text("GAME DRAWN {3-fold repetition}"); 
     return BOOL.TRUE;
    }
	
	if (DrawMaterial() == BOOL.TRUE) {
     $("#GameStatus").text("GAME DRAWN {insufficient material to mate}"); 
     return BOOL.TRUE;
    }
	
	console.log('Checking end of game');
	GenerateMoves();
      
    let MoveNum = 0;
	let found = 0;
	for(MoveNum = brd_moveListStart[brd_ply]; MoveNum < brd_moveListStart[brd_ply + 1]; ++MoveNum)  {	
       
        if ( MakeMove(brd_moveList[MoveNum]) == BOOL.FALSE)  {
            continue;
        }
        found++;
		TakeMove();
		break;
    }
    
    $("#currentFenSpan").text(BoardToFen()); 
	
	if(found != 0) return BOOL.FALSE;
	
	if(brd_side == COLORS.WHITE) {
		$("#GameStatus").text("GAME OVER {black mates}");return BOOL.TRUE;
	} else {
		$("#GameStatus").text("GAME OVER {white mates}");return BOOL.TRUE;
	}
	// no possible
    console.log('Returning False');
	return BOOL.FALSE;	
}
