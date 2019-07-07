let BRD_SQ_NUM = 46;
let BRD_CAPTURE_SQ_NUM = 18;

let MAXGAMEMOVES = 2048;
let MAXPOSITIONMOVES = 256;
let MAXDEPTH = 64;

let EC_SIZE = 0x8000;
let EC_MASK = EC_SIZE - 1;

let INFINITE = 30000;
let MATE = 29000;
let NOMOVE = 0;

// let START_FEN = "W:W1,2,3,4,5,6,7,8,9,10,11,12:B21,22,23,24,25,26,27,28,29,30,31,32";
let START_FEN = "W:W16:B10,12,20,K26,27,32";

let FILES =  { FILE_A:0, FILE_B:1, FILE_C:2, FILE_D:3, FILE_E:4, FILE_F:5, FILE_G:6, FILE_H:7, FILE_NONE:8 };
let RANKS =  { RANK_1:0, RANK_2:1, RANK_3:2, RANK_4:3, RANK_5:4, RANK_6:5, RANK_7:6, RANK_8:7, RANK_NONE:8 };

let COLORS = { WHITE:0, BLACK:1, BOTH:2 };

let PIECES =  { EMPTY : 0, wM : 1, wK : 2, bM : 3, bK : 4 };

let PceChar = ".MKmk";
let SideChar = "wb-";
let RankChar = "12345678";
let FileChar = "abcdefgh";

let MFLAGCAP = 0x2000;

let PieceCol = [ COLORS.BOTH, COLORS.WHITE, COLORS.WHITE, COLORS.BLACK, COLORS.BLACK ];

let PieceKeys = new Array(2 * 64);
let SideKey;

let SQUARES = {
    A1:5, H8:45, NO_SQ:46, OFFBOARD:47
  };
  
let BOOL = { FALSE:0, TRUE:1 };

let FilesBrd = new Array(BRD_SQ_NUM);
let RanksBrd = new Array(BRD_SQ_NUM);

let MAX_CAPTURE_VARIATION = 50;

let PVENTRIES = 10000;

function FR2SQ(f,r) {
    return ( (5 + ((f+r) / 2) ) + ( r * 4 ) );
}

function RAND_32() {

	return (Math.floor((Math.random()*255)+1) << 23) | (Math.floor((Math.random()*255)+1) << 16)
		 | (Math.floor((Math.random()*255)+1) << 8) | Math.floor((Math.random()*255)+1);

}

function HASH_PCE(pce,sq) { 
	brd_posKey ^= PieceKeys[pce*46 + sq]; 
}
function HASH_SIDE() { brd_posKey ^= SideKey; }

function IND2STD(ind) {return (ind - 4 - Math.floor(ind/9)); }

function FROMSQ(m) { return (m & 0x3F); }
function TOSQ(m)  { return (((m)>>6) & 0x3F); }
function CAPTURED(m)  { return (m & 0x2000); }
function MVPS(m)  { return (((m) >> 12) & 1); }

let GameController = {};
GameController.EngineSide = COLORS.BOTH;
GameController.PlayerSide = COLORS.BOTH;
GameController.BoardFlipped = BOOL.FALSE;
GameController.GameOver = BOOL.FALSE;
GameController.BookLoaded = BOOL.FALSE;
GameController.GameSaved = BOOL.TRUE;
