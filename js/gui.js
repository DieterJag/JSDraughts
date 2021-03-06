var UserMove = {};
UserMove.from = SQUARES.NO_SQ;
UserMove.to = SQUARES.NO_SQ;
UserMove.capture_count = 0;
UserMove.capture_index = -1;

$("#SetFen").click(function () {
	let fenStr = $("#fenIn").val();	
	ParseFen(fenStr);
	// PrintBoard();		
    SetInitialBoardPieces();	
    GenerateCaptures();
    // console.log(aPathOfCaptures);
    if (aPathOfCaptures.length == 0) {
        GenerateMoves();
    }
    // console.log(brd_moveList);
    // console.log(brd_moveListStart);
    // console.log(brd_history);

	// GameController.PlayerSide = brd_side;	
	// CheckAndSet();	
	// EvalPosition();	
	// //PerftTest(5);
	// newGameAjax();	 
});

$("#SearchButton").click(function () {	
	GameController.PlayerSide = brd_side^1;
	PreSearch();	
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
	// console.log("Removing pieces");
	$(".Piece").remove();
}

function ClearGUIPieces(captures) {
    let bit = 1;
    for(let i = 0; i < BRD_CAPTURE_SQ_NUM; i++) {
        if (captures & bit) {
            let index = brd_capture_to_pieces[i];
            // let pce = brd_pieces[index];	
			// let rank = RanksBrd[to];
			// let file = FilesBrd[to];
			// let rankName = "rank" + (rank + 1);	
			// let fileName = "file" + (file + 1);
			
			$( ".Piece" ).each(function() {
				if( (RanksBrd[index] == 7 - Math.round($(this).position().top/60)) && (FilesBrd[index] == Math.round($(this).position().left/60)) ){
					$(this).removeClass();
				}
			});
		}
        bit <<= 1;
    }
}

// need new parameter captured 2019-07-09
function MoveGUIPiece(move, captured) {
	let from = FROMSQ(move);
	let to = TOSQ(move);
    let mv_piece = MVPS(move);
	
	let rank = RanksBrd[to];
	let file = FilesBrd[to];
	let rankName = "rank" + (rank + 1);	
	let fileName = "file" + (file + 1);
	
	$( ".Piece" ).each(function() {
		if((RanksBrd[from] == 7 - Math.round($(this).position().top/60)) && (FilesBrd[from] == Math.round($(this).position().left/60))){
			if (mv_piece == 1) {
				$(this).remove();
				AddGUIPiece(to, brd_pieces[to]);
			} else $(this).removeClass();
			$(this).addClass("Piece clickElement " + rankName + " " + fileName);     
		}
	   });
	
	// caputere remove pieces
    let capture = CAPTURED(move);
	
	if (capture) {
        ClearGUIPieces(captured);
    }
	
    // printGameLine();
}

function PreSearch() {
		
	if(GameController.GameOver != BOOL.TRUE) {				
		srch_thinking = BOOL.TRUE;
		$('#ThinkingImageDiv').append('<image src="image/think3.png" id="ThinkingPng"/>')
		setTimeout( function() {StartSearch(); }, 200);
	}
}

function DeselectSq(sq) {

	$( ".Square" ).each(function( index ) {     
     if( (RanksBrd[sq] == 7 - Math.round($(this).position().top/60)) && (FilesBrd[sq] == Math.round($(this).position().left/60)) ){     	
     	$(this).removeClass('SqSelected');    
     }
    });
}

function SetSqSelected(sq) {
	
	$( ".Square" ).each(function( index ) {    
     if( (RanksBrd[sq] == 7 - Math.round($(this).position().top/60)) && (FilesBrd[sq] == Math.round($(this).position().left/60)) ){   
     	$(this).addClass('SqSelected');    
     }
    });
}

function ClickedSquare(pageX, pageY) {
	let position = $("#Board").position();
	
	let workedX = Math.floor(position.left);
	let workedY = Math.floor(position.top);
	pageX = Math.floor(pageX);
	pageY = Math.floor(pageY);
	
	let file = Math.floor((pageX-workedX) / 60);
	let rank = 7 - Math.floor((pageY-workedY) / 60);
	
	let sq = FR2SQ(file,rank);
	

	SetSqSelected(sq); // must go here before mirror
	
	return sq;

}

function MakeUserMove() {
	if(UserMove.from != SQUARES.NO_SQ && UserMove.to != SQUARES.NO_SQ) {
		console.log("User Move:" + PrSq(UserMove.from) + PrSq(UserMove.to));
		
		var parsed = ParseMove(UserMove.from,UserMove.to);
		
		DeselectSq(UserMove.from);
		DeselectSq(UserMove.to);
		
		console.log("Parsed:" + parsed);
		
		if(parsed != NOMOVE) {
			MakeMove(parsed);
			MoveGUIPiece(parsed);
			CheckAndSet();
			PreSearch();
		}
		
		UserMove.from = SQUARES.NO_SQ;
		UserMove.to = SQUARES.NO_SQ; 	
		UserMove.capture_count = 0;
		UserMove.capture_index = -1;
	}
}

$(document).on('click','.Piece', function (e) {	
	console.log("Piece Click");
	if(srch_thinking == BOOL.FALSE && GameController.PlayerSide == brd_side) {
		if(UserMove.from == SQUARES.NO_SQ) 
			UserMove.from = ClickedSquare(e.pageX, e.pageY);
		else 
			UserMove.to = ClickedSquare(e.pageX, e.pageY);	
		
		MakeUserMove();	
	}	
});

$(document).on('click','.Square', function (e) {	
	console.log("Square Click");
	if(srch_thinking == BOOL.FALSE && GameController.PlayerSide == brd_side && UserMove.from != SQUARES.NO_SQ) {
		UserMove.to = ClickedSquare(e.pageX, e.pageY);
		MakeUserMove();
	}
});

function StartSearch() {
	srch_depth = MAXDEPTH;
	let t = $.now();
	let tt = $('#ThinkingTimeChoise').val();
	// console.log("time:" + t + " TimeChoice:" + tt);
	srch_time = parseInt(tt) * 1000;
	SearchPosition(); 	
	
	// TODO MakeMove here on internal board and GUI
	MakeMove(srch_best, srch_best_captured);
	MoveGUIPiece(srch_best, srch_best_captured);	
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
	
	// if (DrawMaterial() == BOOL.TRUE) {
    //  $("#GameStatus").text("GAME DRAWN {insufficient material to mate}"); 
    //  return BOOL.TRUE;
    // }
	
	// console.log('Checking end of game');
	GenerateCaptures();
    if (aPathOfCaptures.length == 0) {
        GenerateMoves();
    }
      
    let MoveNum = 0;
	let found = 0;
	for(MoveNum = brd_moveListStart[brd_ply]; MoveNum < brd_moveListStart[brd_ply + 1]; ++MoveNum)  {	
	   
		let move = brd_moveList[MoveNum];
		let capture;
		if (CAPTURED(move)) capture = brd_captureList[brd_captureListStart[brd_ply]+MoveNum-brd_moveListStart[brd_ply]];
        if ( MakeMove(move, capture) == BOOL.FALSE)  {
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
