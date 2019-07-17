let srch_nodes;
let srch_fh;
let srch_fhf;
let srch_depth;
let srch_time;
let srch_start;
let srch_stop;
let srch_best;
let srch_best_captured;
let srch_thinking;

function CheckUp() {
	if( ($.now()-srch_start) > srch_time ) srch_stop = BOOL.TRUE;
}

function PickNextMove(moveNum) {

	let index = 0;
	let bestScore = 0; 
	let bestNum = moveNum;
	
	for (index = moveNum; index < brd_moveListStart[brd_ply + 1]; ++index) {
		if (brd_moveScores[index] > bestScore) {
			bestScore = brd_moveScores[index];
			bestNum = index;
		}
	}
	
	temp = brd_moveList[moveNum];
	brd_moveList[moveNum] = brd_moveList[bestNum];
	brd_moveList[bestNum] = temp;

	if (brd_captureListStart[brd_ply] < brd_captureListStart[brd_ply + 1]) {
		let cap_moveNum = brd_captureListStart[brd_ply] + moveNum - brd_moveListStart[brd_ply];
		let cap_bestNum = brd_captureListStart[brd_ply] + bestNum - brd_moveListStart[brd_ply];
		temp = brd_captureList[cap_moveNum];
		brd_captureList[cap_moveNum] = brd_captureList[cap_bestNum];
		brd_captureList[cap_bestNum] = temp;
	}
	
	temp = brd_moveScores[moveNum];
	brd_moveScores[moveNum] = brd_moveScores[bestNum];
	brd_moveScores[bestNum] = temp;
}

function IsRepetition() {

	let index = 0;

	for(index = 0; index < brd_hisPly-1; ++index) {				
		if(brd_posKey == brd_history[index].posKey) {
			return BOOL.TRUE;
		}
	}	
	return BOOL.FALSE;
}

function ClearPvTable() {
	
	for(index = 0; index < PVENTRIES; index++) {
		brd_PvTable[index].move = NOMOVE;
		brd_PvTable[index].capture = NOMOVE;
		brd_PvTable[index].posKey = 0;
		
	}
}

function ClearForSearch() {
	
	let index = 0;
	
	for(index = 0; index < 14 * BRD_SQ_NUM; ++index) {		
		brd_searchHistory[index] = 0;	
	}
	
	for(index = 0; index < 3 * MAXDEPTH; ++index) {
		brd_searchKillers[index] = 0;
	}	
	
	ClearPvTable();
		
	brd_ply = 0;	
	
	srch_nodes = 0;
	srch_fh = 0;
	srch_fhf = 0;
	srch_start = $.now();
	srch_stop = BOOL.FALSE;
}


function Quiescence(alpha, beta) {
	// console.log("Quiescence alpha="+alpha+" beta="+beta);

	if((srch_nodes & 2047) == 0) CheckUp();
	
	srch_nodes++;
	
	if(IsRepetition()) {
		return 0;
	}
	
	if(brd_ply > MAXDEPTH - 1) {
		return EvalPosition(alpha, beta);
	}
	
	let Score = EvalPosition(alpha, beta);
	// console.log("Score="+Score+" alpha="+alpha+" beta="+beta);
	
	if(Score >= beta) {
		return beta;
	}
	
	if(Score > alpha) {
		alpha = Score;
	}
	// console.log("Score="+Score+" alpha="+alpha+" beta="+beta);
	
	GenerateCaptures();
      
    let MoveNum = 0;
	let Legal = 0;
	let OldAlpha = alpha;
	let BestMove = NOMOVE;
	let BestCapture = NOMOVE;
	Score = -INFINITE;
	let PvMove;	
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
	PvMove = move;
	
	if( PvMove != NOMOVE) {
		for(MoveNum = brd_moveListStart[brd_ply]; MoveNum < brd_moveListStart[brd_ply + 1]; ++MoveNum) {
			if( brd_moveList[MoveNum] == PvMove) {
				brd_moveScores[MoveNum] = 2000000;
				break;
			}
		}
	}
	
	for(MoveNum = brd_moveListStart[brd_ply]; MoveNum < brd_moveListStart[brd_ply + 1]; ++MoveNum)  {	
			
		PickNextMove(MoveNum);	
		
		let move = brd_moveList[MoveNum];
		let capture;
		if (CAPTURED(move)) capture = brd_captureList[brd_captureListStart[brd_ply]+MoveNum-brd_moveListStart[brd_ply]];
        if ( MakeMove(move, capture) == BOOL.FALSE)  {
            continue;
        }
        
		Legal++;
		// console.log("Score="+Score+" alpha="+alpha+" beta="+beta);
		Score = -Quiescence( -beta, -alpha);
		TakeMove();					
		if(srch_stop == BOOL.TRUE) return 0;
		// console.log("Score="+Score+" alpha="+alpha+" beta="+beta);
		let logStr = "from="+FROMSQ(move)+" to="+TOSQ(move)+" score="+Score;
		let logHis = " his";
		for(let i = 0; i<nowDepth; i++)	logHis += " from="+FROMSQ(brd_history[i].move)+" to="+TOSQ(brd_history[i].move);
		if(Score > alpha) {
			logStr += " bestMove from="+FROMSQ(brd_moveList[MoveNum])+" to="+TOSQ(brd_moveList[MoveNum]);
			if(Score >= beta) {
				logStr += " betaCut=1";
				console.log(logStr+logHis);
				if(Legal==1) {
					srch_fhf++;
				}
				srch_fh++;				
						
				return beta;
			}
			alpha = Score;
			BestMove = brd_moveList[MoveNum];
			BestCapture = NOMOVE;
			let capture = CAPTURED(BestMove);
			if (capture) BestCapture = brd_captureList[brd_captureListStart[brd_ply]+MoveNum-brd_moveListStart[brd_ply]];			
		}		
		console.log(logStr+logHis);
    }
	
	if(alpha != OldAlpha) {
		StorePvMove(BestMove, BestCapture);
	}
	
	return alpha;
}

function AlphaBeta(alpha, beta, depth) {
	// console.log("AlphaBeta alpha="+alpha+" beta="+beta);

		
	if(depth <= 0) {
		return Quiescence(alpha, beta);
		// return EvalPosition();
	}	
	if((srch_nodes & 2047) == 0) CheckUp();
	
	srch_nodes++;
	
	if((IsRepetition()) && brd_ply != 0) {	
		return 0;
	}
	
	if(brd_ply > MAXDEPTH - 1) {
		return EvalPosition(alpha, beta);
	}
	
	let Score = -INFINITE;
	
	// if( DoNull == BOOL.TRUE && 
	// 		brd_ply != 0 && (brd_material[brd_side] > 50200) && depth >= 4) {
		
		
	// 	brd_side ^= 1;
    // 	HASH_SIDE();
 		
	// 	Score = -AlphaBeta( -beta, -beta + 1, depth-4, BOOL.FALSE);
		
	// 	brd_side ^= 1;
    // 	HASH_SIDE();
		
	// 	if(srch_stop == BOOL.TRUE) return 0;	
	// 	if (Score >= beta) {		 
	// 	  return beta;
	// 	}	
	// }
		
	GenerateCaptures();
    if (aPathOfCaptures.length == 0) {
        GenerateMoves();
	}
      
    let MoveNum = 0;
	let Legal = 0;
	let OldAlpha = alpha;
	let BestMove = NOMOVE;
	let BestCapture = NOMOVE;
	Score = -INFINITE;
	let PvMove;		
	let move;
	// let capture;
	let index = ProbePvTable();
	if (index != -1) {
		move = brd_PvTable[index].move;
		// capture = brd_PvTable[index].capture;
	} else {
		move = NOMOVE;
		// capture = NOMOVE;
	}
	PvMove = move;
	
	if( PvMove != NOMOVE) {
		for(MoveNum = brd_moveListStart[brd_ply]; MoveNum < brd_moveListStart[brd_ply + 1]; ++MoveNum) {
			if( brd_moveList[MoveNum] == PvMove) {
				brd_moveScores[MoveNum] = 2000000; 
				break;
			}
		}
	}
	
	for(MoveNum = brd_moveListStart[brd_ply]; MoveNum < brd_moveListStart[brd_ply + 1]; ++MoveNum)  {	
			
		PickNextMove(MoveNum);	
		
		let move = brd_moveList[MoveNum];
		let capture;
		if (CAPTURED(move)) capture = brd_captureList[brd_captureListStart[brd_ply]+MoveNum-brd_moveListStart[brd_ply]];
        if ( MakeMove(move, capture) == BOOL.FALSE)  {
            continue;
        }
        
		Legal++;
		// console.log("AlpaBeta in alpha="+beta+" beta="+alpha+" depth="+depth);
		// console.log(BoardToFen());
		Score = -AlphaBeta( -beta, -alpha, depth-1);
		// console.log("Score="+Score);
		// console.log(BoardToFen());
		TakeMove();						
		if(srch_stop == BOOL.TRUE) return 0;				
		
		let logStr = "from="+FROMSQ(move)+" to="+TOSQ(move)+" score="+Score+" depth="+depth;
		let logHis = " his";
		for(let i = 0; i<nowDepth; i++)	logHis += " from="+FROMSQ(brd_history[i].move)+" to="+TOSQ(brd_history[i].move);

		if(Score > alpha) {
			logStr += " bestMove from="+FROMSQ(brd_moveList[MoveNum])+" to="+TOSQ(brd_moveList[MoveNum]);
			if(Score >= beta) {
				logStr += " betaCut=1";
				console.log(logStr+logHis);
				if(Legal==1) {
					srch_fhf++;
				}
				srch_fh++;	
				
				if((brd_moveList[MoveNum] & MFLAGCAP) == 0) {
					brd_searchKillers[MAXDEPTH + brd_ply] = brd_searchKillers[brd_ply];
					brd_searchKillers[brd_ply] = brd_moveList[MoveNum];
				}				
				return beta;
			}
			alpha = Score;
			BestMove = brd_moveList[MoveNum];
			BestCapture = NOMOVE;
			let capture = CAPTURED(BestMove);
			if (capture) BestCapture = brd_captureList[brd_captureListStart[brd_ply]+MoveNum-brd_moveListStart[brd_ply]];			
			else {
				brd_searchHistory[ brd_pieces[FROMSQ(BestMove)] * BRD_SQ_NUM + TOSQ(BestMove) ] += depth;
			}
		}		
		console.log(logStr+logHis);
    }
	
	if(Legal == 0) {
		return (brd_side == COLORS.BLACK)?MATE:-MATE;
	}
	
	if(alpha != OldAlpha) {		
		StorePvMove(BestMove, BestCapture);
	}
	
	return alpha;
} 

let domUpdate_depth;
let domUpdate_move;
let domUpdate_score;
let domUpdate_nodes;
let domUpdate_ordering;

function UpdateDOMStats() {
		let scoreText = "Score: " + (domUpdate_score/100).toFixed(2);
		if(Math.abs(domUpdate_score) > MATE-MAXDEPTH) {
			scoreText = "Score: " + "Mate In " + (MATE - Math.abs(domUpdate_score)) + " moves";
		}
		
		//console.log("UpdateDOMStats depth:" + domUpdate_depth + " score:" + domUpdate_score + " nodes:" + domUpdate_nodes);
		$("#OrderingOut").text("Ordering: " + domUpdate_ordering + "%");
		$("#DepthOut").text("Depth: " + domUpdate_depth);
		$("#ScoreOut").text(scoreText);
		$("#NodesOut").text("Nodes: " + domUpdate_nodes);
		$("#TimeOut").text("Time: " + (($.now()-srch_start)/1000).toFixed(1) + "s");
}

function SearchPosition() {
	
	let bestMove = NOMOVE;
	let bestCapture = NOMOVE;
	let bestScore = -INFINITE;
	let currentDepth = 0;	
	let line;
	ClearForSearch();
	
	// if(GameController.BookLoaded == BOOL.TRUE) {
	// 	bestMove = BookMove();
	
	// 	if(bestMove != NOMOVE) {
	// 		$("#OrderingOut").text("Ordering:");
	// 		$("#DepthOut").text("Depth: ");
	// 		$("#ScoreOut").text("Score:");
	// 		$("#NodesOut").text("Nodes:");
	// 		$("#TimeOut").text("Time: 0s");
	// 		$("#BestOut").text("BestMove: " + PrMove(bestMove) + '(Book)');
	// 		srch_best = bestMove;
	// 		srch_thinking = BOOL.FALSE;
	// 		return;
	// 	}
	// }
	
	// iterative deepening
	for( currentDepth = 1; currentDepth <= srch_depth; ++currentDepth ) {						
		nowDepth = currentDepth - 1;
		// console.log("AlpaBeta in alpha=-"+INFINITE+" beta="+INFINITE+" depth="+currentDepth+" bestScore="+bestScore);
		// console.log(BoardToFen());
		bestScore = AlphaBeta(-INFINITE, INFINITE, currentDepth, BOOL.TRUE);
		// console.log("AlpaBeta out depth="+currentDepth+" bestScore="+bestScore);
		// console.log(BoardToFen());
		if(srch_stop == BOOL.TRUE) break;
		pvNum = GetPvLine(currentDepth);
		bestMove = brd_PvArray[0];
		bestCapture = brd_cap_PvArray[0];
		line = ("Depth:" + currentDepth + " best:" + PrMove(bestMove, bestCapture) + " Score:" + bestScore + " nodes:" + srch_nodes); 
		
		if(currentDepth!=1) {
			line += (" Ordering:" + ((srch_fhf/srch_fh)*100).toFixed(2) + "%");
		}
		console.log(line);
		// brd_pieces.forEach((element, index) => {
		// 	if (element == 0 && (index > 27 || index < 18)) console.log(index + " => " + element);
		// 	else if (element == 1 && (index > 18)) console.log(index + " => " + element);
		// 	else if (element == 3 && (index < 27)) console.log(index + " => " + element);
		// })
		
		domUpdate_depth = currentDepth;
		domUpdate_move = bestMove;
		domUpdate_score = bestScore;
		domUpdate_nodes = srch_nodes;
		domUpdate_ordering = ((srch_fhf/srch_fh)*100).toFixed(2);
	}	
		
	$("#BestOut").text("BestMove: " + PrMove(bestMove, bestCapture));
	UpdateDOMStats();
	srch_best = bestMove;
	srch_best_captured = bestCapture;
	srch_thinking = BOOL.FALSE;
	
}