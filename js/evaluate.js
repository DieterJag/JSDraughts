Get_EGDB getEGDB = 0;
/* board values */
#define OCCUPIED 0xf0
#define WHITE 1
#define BLACK 2
#define MAN 4
#define KING 8
#define FREE 0
#define MCP_MARGIN 32

#define WHT_MAN 5
#define BLK_MAN 6
#define WHT_KNG 9
#define BLK_KNG  10
/* definitions of new types   */
#define U64 unsigned __int64
#define S64 __int64
#define U32 unsigned __int32
#define  S32 __int32
#define U16 unsigned __int16
#define  S16  __int16
#define U8 unsigned __int8
#define S8  __int8

#define SHIFT_BM 0x180 //  (BLK_MAN << 6) or 384 or 0x180 in hex
#define SHIFT_WM 0x140 // (WHT_MAN << 6) or 320 or 0x140 in hex
#define SHIFT_BK 0x280    // (BLK_KNG << 6) or 640 or 0x280 in hex
#define SHIFT_WK 0x240  //   (WHT_KNG << 6) or 576 or 0x240 in hex

#define MOVE_PIECE( move )       ( (U8)  ((move.m[1]) >> 6 ))
#define CC 3 // change color
#define MAXDEPTH 80
#define MAXMOVES 60
#define MAXCAPTURES 50
#define MAXHIST 524288

#define MATE 30000   // de facto accepted value
#define INFINITY 30001
#define HASHMATE 29900// handle mates up to 100 ply
#define EC_SIZE  ( 0x8000 )
#define EC_MASK ( EC_SIZE - 1 )

#define ED_WIN 30000
#define REHASH 4
#define ETCDEPTH 6  // if depth >= ETCDEPTH do ETC
#define RADIUS 40

//#define KALLISTOAPI WINAPI
//#undef KALLISTO // uncomment if compile to CheckerBoard
#define KALLISTO // uncomment if compile to KallistoGUI

/*----------> compile options  */
// not used options
//#define PERFT
#undef PERFT
#undef MUTE
#undef VERBOSE
#undef STATISTICS

/* getmove return values */
#define DRAW 0
#define WIN 1
#define LOSS 2
#define UNKNOWN 3

#define TICKS CLK_TCK
#define SQUARE_TO_32(square) (SquareTo32[square])

#define EARLY_GAME  ((g_pieces[ (color | KING)  ] > g_pieces[ (color^CC| KING)  ] + 1 ) || ( g_pieces[ (color | KING)  ] + g_pieces[ ( color | MAN ) ] >= 8 ))
#define NOT_ENDGAME ( g_pieces[BLK_KNG] + g_pieces[BLK_MAN] + g_pieces[WHT_KNG ] + g_pieces[WHT_MAN ] > 13 )
#define DO_EXTENSIONS  ( realdepth < depth )

//enum ValueType{
//	NONE=0, UPPER=1, LOWER=2, EXACT= 1 | 2};
const int NONE = 0;
const int UPPER = 1 << 0;
const int LOWER = 1 << 1;
const int EXACT = UPPER | LOWER;
/*	
typedef struct{
     U32  m_lock;
     int  m_value : 32;
     int  m_depth : 8;
     int  m_age : 16;
     U8 m_best_from;
     U8 m_best_to;
     int m_valuetype : 8;
     U8 m_best_from2;
     U8 m_best_to2;
                      }TEntry;
*/
typedef struct{
     U32  m_lock;
     S32  m_value;
     S8  m_depth;
     S16  m_age;
     U8 m_best_from;
     U8 m_best_to;
     S8 m_valuetype;
     U8 m_best_from2;
     U8 m_best_to2;
                      }TEntry;
#define NODE_OPP(type) (-(type))
#define ISWINSCORE(score) ((score) >= HASHMATE)
#define ISLOSSSCORE(score) ((score) <= -HASHMATE)
#define MAX(x, y) (( (x) >= (y)) ? (x) : (y))
#define MIN(x, y) (( (x) <= (y)) ? (x) : (y))
struct coor             /* coordinate structure for board coordinates */
 {
   unsigned int x;
   unsigned int y;
 };

 struct CBmove    // all the information there is about a move
  {
  int jumps;               // how many jumps are there in this move?
  int newpiece;            // what type of piece appears on to
  int oldpiece;            // what disappears on from
  struct  coor from, to;            // coordinates of the piece in 8x8 notation
  struct coor path[12];            // intermediate path coordinates
  struct  coor del[12];            // squares whose pieces are deleted
  int delpiece[12];            // what is on these squares
  } GCBmove;

struct move2
  {
    unsigned short m[12];
    char path[11]; // was short path[12];
    unsigned char l; // move's length
  };
  
 struct move
  {
    unsigned short m[2];
  }; 

/* function prototypes */

static int          compute( int b[46],int color, int time, char output[256]);
static int          PVSearch(int b[46],int depth,int alpha,int beta,int color);
static int          Search(int b[46],int depth,int beta ,int color,int node_type,bool mcp);
static int          LowDepth(int b[46],int depth,int beta ,int color);
static int          rootsearch(int b[46], int alpha, int beta, int depth,int color,int search_type);
static int          QSearch(int b[46], int alpha,int beta,int color);
static void       QuickSort( int SortVals[MAXMOVES],struct move2 movelist[MAXMOVES], int inf, int sup);
static int          evaluation(int b[46], int color, int alpha, int beta);
static int          fast_eval(int b[46],int color);
static void       domove(int *b,struct move2 *move,int stm);
static void       domove2(int *b,struct move2 *move,int stm);
static void __inline  doprom(int *b,struct move *move,int stm );
static void __inline  undoprom(int *b,struct move *move,int stm );
static void       undomove(int *b,struct move2 *move,int stm);
static void       update_hash(struct move2 *move);
static unsigned int       Gen_Captures(int *b,struct move2 *movelist, int color, unsigned start );
static unsigned int       Gen_Moves(int *b,struct move2 *movelist, int color );
static unsigned int       Gen_Proms(int *b,struct move *movelist,int color );
static void                     black_king_capture(int *b,int *n,struct move2 *movelist, int j,int in_dir);
static void                     black_man_capture(int *b,int *n,struct move2 *movelist, int j,int in_dir);
static void                     white_king_capture(int *b,int *n,struct move2 *movelist, int j,int in_dir);
static void                     white_man_capture(int *b,int *n,struct move2 *movelist, int j,int in_dir);
static unsigned int        Test_Capture( int *b, int color);
static int          Test_From_pb( int *b,int mloc,int dir);
static int          Test_From_cb( int *b, int mloc,int dir);
static int          Test_From_pw( int *b,int mloc,int dir);
static int          Test_From_cw( int *b, int mloc,int dir);

static void         setbestmove(struct move2 move);
static void         MoveToStr(move2 m, char *s);
static struct       coor numbertocoor(int n);
static void         movetonotation(struct move2 move,char str[80]);

static U64           rand64(void);
static U64           Position_to_Hashnumber( int b[46] , int color );
static void           Create_HashFunction(void);
static void           TTableInit( unsigned int size);
static void           retrievepv( int b[46], char *pv, int color);
static int hashretrieve(int *tr_depth, int depth,int *value,int alpha,int beta,U8 *best_from,U8 *best_to,U8 *best_from2,U8 *best_to2, int *try_mcp);
static void       hashstore(int value,int depth,U8 best_from,U8 best_to,int f);
static int          value_to_tt( int value );
static void       ClearHistory( void );
static void       Perft(int *b,int color,unsigned depth);
static void __inline    killer( U8 bestfrom,U8 bestto,int realdepth,int capture);
static void                  hist_succ( U8 from,U8 to,int depth,int capture);
static void                  history_bad( U8 from,U8 to,int depth );
static  bool                  is_move_to_7( int b[46],struct move2 *move );
static int __inline       is_promotion(struct move2 *move);
static int                     is_blk_kng( int b[46] );
static int                     is_wht_kng( int b[46] );
static int                     is_blk_kng_1( int b[46] );
static int                      is_wht_kng_1( int b[46] );
static int                      is_blk_kng_2( int b[46] );
static int                      is_wht_kng_2( int b[46] );
static int                      is_blk_kng_3( int b[46] );
static int                      is_wht_kng_3( int b[46] );
static int                      is_blk_kng_4( int b[46] );
static int                      is_wht_kng_4( int b[46] );
static int                      pick_next_move( int *marker,int SortVals[MAXMOVES],int n );
static void                   Sort( int start,int num, int SortVals[MAXMOVES],struct move2 movelist[MAXMOVES] );
static void                   init_piece_lists( int b[46] );
__inline int                 value_mate_in(int ply);
__inline int                 value_mated_in(int ply);
static bool                    move_to_a1h8( struct move2 *move );
static int                      has_man_on_7th(int b[46],int color);
static int                      EdProbe(int c[46],int color);
static __inline             U8  FROM( struct move2 *move );
static __inline             U8  TO( struct move2 *move );
static     void               EvalHashClear(void);

/*----------> globals  */
CRITICAL_SECTION AnalyseSection;
int *play;
static U64 ZobristNumbers[41][16];
static U64 HashSTM; // random number - side to move
static U64 HASH_KEY; // global variable HASH_KEY
static U64 MASK;
unsigned int sizen = 8; // default size 8 MB
int realdepth;
unsigned int nodes;
struct move2 bestrootmove;
static U64 RepNum[MAXDEPTH];
static int history_tabular[1024]; // array used by history heuristics

// killer slots
static U8 killersf1[MAXDEPTH+2];
static U8 killerst1[MAXDEPTH+2];

static U8 killersf2[MAXDEPTH+2];
static U8 killerst2[MAXDEPTH+2];

double PerftNodes;
static const int directions[4] =  { -0x5,-0x4,0x5,0x4 };
static const int NodeAll = -1;
static const int NodePV  =  0;
static const int NodeCut = +1;
static const int MVALUE[11] = {0,0,0,0,0,100,100,0,0,250,250};
static int g_pieces[11]; // global array
double start,t,maxtime; // time variables
const int SearchNormal = 0;
const int SearchShort  = 1;

const int SquareTo32[41] = { 0,0,0,0,0,           // 0 .. 4
	                                            0,1,2,3,0,           // 5 .. 8 (9)
                                                 4,5,6,7,             // 10 .. 13	                                            
                                                 8,9,10,11,0,       // 14 .. 17 (18)	                                            
                                                 12,13,14,15,       // 19 .. 22
                                                  16,17,18,19,0,    // 23 .. 26 (27)
                                                  20,21,22,23,       // 28 .. 31
                                                  24,25,26,27,0,      // 32 .. 35 (36)
                                                  28,29,30,31          // 37 .. 40                                          
                                                 };

static unsigned int indices[41]; // indexes into p_list for a given square
static unsigned int p_list[3][16]; // p_list contains the location of all the pieces of either color
static unsigned int c_num[MAXDEPTH+1][16]; // captured number

unsigned int num_wpieces;
unsigned int num_bpieces;
int  g_Panic; // add more time
int  g_seldepth; // selective depth i.e.  maximal reached depth
int g_root_mb;    // root material balance
unsigned int searches_performed_in_game = 0; // age or generation
TEntry *ttable = NULL;
EdAccess *ED = NULL;

unsigned int EdPieces = 0;
bool Reversible[MAXDEPTH+1];
int EdRoot[3];
bool EdNocaptures = false;
static bool inSearch;

 const int GrainSize = 2;
 U64 EvalHash[ EC_SIZE ];
 bool ZobristInitialized = false;
//#pragma warn -8057 // disable warning #8057 when compiling
//#pragma warn -8004 // disable warning #8004 when compiling
 //sprintf(Lstr, "engines\\%s", gCBoptions.primaryenginestring);
 HINSTANCE hinstLibEd = NULL;

 let evl_hash = new Array(0x8000);

 static int evaluation(int b[46], int color, int alpha, int beta){
    /*----> purpose: static evaluation of the board */
    //U64 TESTHASH = Position_to_Hashnumber(b,color);
    //assert( TESTHASH == HASH_KEY );
    int eval;
    int GLAV = 0;
    if (( ( HASH_KEY ^ EvalHash[ ( U32) (HASH_KEY & EC_MASK )  ] ) & 0xffffffffffff0000 ) == 0 )
        {
    eval  = (int) ((S16) ( EvalHash[ (U32) (HASH_KEY & EC_MASK ) ] & 0xffff ) );
    return  eval;
        }
    int nbm = g_pieces[BLK_MAN]; // number of black men
    int nwm = g_pieces[WHT_MAN]; // number of white men
    int nbk = g_pieces[BLK_KNG]; // number of black kings
    int nwk = g_pieces[WHT_KNG]; // number of white kings
 
    if ( (nbm == 0) && (nbk == 0) ){
    eval = realdepth - MATE;
    //	assert( color == BLACK );
    //EvalHash[ (U32) ( HASH_KEY & EC_MASK ) ] = (HASH_KEY & 0xffffffffffff0000) | ( eval & 0xffff);
    return eval;
                                                        }
    if ( (nwm == 0) && (nwk == 0) ){
    eval = realdepth - MATE;
    //	assert( color == WHITE );
    //EvalHash[ (U32) ( HASH_KEY & EC_MASK ) ] = (HASH_KEY & 0xffffffffffff0000) | ( eval & 0xffff);
    return eval;
                                                           }
 
            int White = nwm + nwk; // total number of white pieces
            int Black = nbm + nbk;     // total number of black pieces
            int v1 = 100 * nbm + 300 * nbk;
            int v2 = 100 * nwm + 300 * nwk;
            eval = v1 - v2;         // material values
      
            // draw situations
            if ( nbm == 0 && nwm == 0 && abs( nbk - nwk) <= 1 ){ 
            EvalHash[ (U32) ( HASH_KEY & EC_MASK ) ] = (HASH_KEY & 0xffffffffffff0000) | ( 0 & 0xffff);
            return (0); // only kings left
                       }
            if ( ( eval > 0 ) && ( nwk > 0 ) && (Black < (nwk+2)) ){
            EvalHash[ (U32) ( HASH_KEY & EC_MASK ) ] = (HASH_KEY & 0xffffffffffff0000) | ( 0 & 0xffff);
            return (0); // black cannot win
                                           }
 
            if ( ( eval < 0 ) && (nbk > 0) && (White < (nbk+2)) ){
            EvalHash[ (U32) ( HASH_KEY & EC_MASK ) ] = (HASH_KEY & 0xffffffffffff0000) | ( 0 & 0xffff);
            return (0); //  white cannot win
                                            }
 
   static U8 PST_man_op[41] = {0,0,0,0,0,   // 0 .. 4
                              15,40,42,45,0,              // 5 .. 8 (9)
                              12,38,36,15,                     // 10 .. 13
                              28,26,30,20,0,               // 14 .. 17 (18)
                              18,26,36,28,                    // 19 .. 22
                              32,38,10,18,0,                // 23 .. 26 (27)
                              18,22,24,20,                 //  28 .. 31
                              26,0,0,0,0,                      // 32 .. 35 (36)
                              0,0,0,0                          // 37 .. 40
                                        };
                                        
  static U8 PST_man_en[41] = {0,0,0,0,0,  // 0 .. 4
                              0,2,2,2,    0,                  // 5 .. 8 (9)
                              4,4,4,4,                     // 10 .. 13
                              6,6,6,6,    0,               // 14 .. 17 (18)
                              10,10,10,10,                  // 19 .. 22
                              16,16,16,16,   0,              // 23 .. 26 (27)
                              22,22,22,22,                //  28 .. 31
                              30,0,0,0,         0,            // 32 .. 35 (36)
                              0,0,0,0                        // 37 .. 40
                                        };     
  
   static U8 PST_king[41] = {0,0,0,0,0,  // 0..4
                                                20,5,0,10,0, // 5..8 (9)
                                                20,5,10,10, // 10..13
                                                5,20,12,10,0, // 14..18
                                                5,20,12,0, // 19..22
                                                0,12,20,5,0, // 23..27
                                                10,12,20,5, // 28..31
                                                10,10,5,20,0, // 32..36
                                                10,0,5,20 // 37..40
                                               };
            unsigned int i;       
            int square;  
            int opening = 0;
            int endgame = 0;
            //a piece of code to encourage exchanges
           //in case of material advantage:
               // king's balance
             if ( nbk != nwk){
             if ( nwk == 0 ){
                     if ( nwm <= 4 ){
                  endgame += 50;
                  if ( nwm <= 3 ){
                  endgame += 100;
                  if ( nwm <= 2 ){
                  endgame += 100;
                  if ( nwm <= 1 )
                  endgame += 100;	
                                           }
                                         }
                                        }
                                       }
              if ( nbk == 0 ){
                  if ( nbm <= 4 ){
                  endgame -= 50;
                  if ( nbm <= 3 ){
                  endgame -= 100;
                  if ( nbm <= 2 ){
                  endgame -= 100;
                  if ( nbm <= 1 )
                  endgame -= 100;	
                                           }
                                         }
                                       }
                                   }  
                          } 
            else{           
            if ( (nbk == 0) && (nwk == 0) )
            eval += 250*( v1 - v2 ) / ( v1 + v2 ); 
            if ( nbk + nwk != 0 )
            eval += 100*( v1 - v2 ) / ( v1 + v2 );
                  }
          
            // special case : very very late endgame
            if ( (White < 4) && (Black < 4) ){
            GLAV = 0; // main diagonal a1-h8 control
            for (  i = 5; i < 41; i+= 5 )
            GLAV += b[i];
            if ( eval < 0 && nbk == 1 && GLAV == BLK_KNG ){
            if ( nbm == 0 || b[32] == BLK_MAN ){
            EvalHash[ (U32) ( HASH_KEY & EC_MASK ) ] = (HASH_KEY & 0xffffffffffff0000) | ( 0 & 0xffff);
            return (0);
                                             }
                                           }
           if ( eval > 0 && nwk == 1 && GLAV == WHT_KNG ){
           if ( nwm == 0 || b[13] == WHT_MAN ){
           EvalHash[ (U32) ( HASH_KEY & EC_MASK ) ] = (HASH_KEY & 0xffffffffffff0000) | ( 0 & 0xffff);
           return (0);
                                             }
                              }
           if ( (nwk != 0) && (nbk != 0) && ( nbm == 0 ) && ( nwm == 0 ) ){
           // only kings left
           if ( nbk == 1 && nwk == 3 ){
              int double_r1 = is_wht_kng_1(b); //
              int double_r2 = is_wht_kng_2(b); //
               if (( double_r1 < 3 ) && ( double_r2 < 3 )){
               if ( double_r1 + double_r2 == 3 )
                   eval -= 300;
               if ( double_r1 + double_r2 == 2 )
                   eval -= 300;
               if ( double_r1 + double_r2 == 1 )
                   eval -= 100;
                                                                                    }
            
               int triple_r1 = is_wht_kng_3(b); //
               int triple_r2 = is_wht_kng_4(b); //
               if ( ( triple_r1 < 3 ) && ( triple_r2 < 3 ) ){
               if ( triple_r1 + triple_r2 == 3 )
                  eval -= 200;
                  if ( triple_r1 + triple_r2 == 2 )
                  eval -= 200;
                  if ( triple_r1 + triple_r2 == 1 )
                  eval -= 100;
                                                                                }
                    if ( is_blk_kng_1(b) == 0 && is_blk_kng_2(b) == 0 ){
                   if ( is_blk_kng_3(b) == 0 && is_blk_kng_4(b) == 0 ){
                   if ( color == BLACK ){
                      if (( b[15] == WHT_KNG ) && ( b[29] == WHT_KNG ) && ( b[16] == WHT_KNG ))
                      eval -= 1000;
                      if (( b[29] == WHT_KNG ) && ( b[16] == WHT_KNG ) && ( b[30] == WHT_KNG ))
                      eval -= 1000;
                     if (( b[15] == WHT_KNG ) && ( b[24] == WHT_KNG ) && ( b[21] == WHT_KNG ))
                      eval -= 1000;
                   if (( b[24] == WHT_KNG ) && ( b[21] == WHT_KNG ) && ( b[30] == WHT_KNG ))
                      eval -= 1000;
                                }
                              }
                            }
                      }
               if ( nwk == 1 && nbk == 3 ){
               int double_r1 = is_blk_kng_1(b); //
               int double_r2 = is_blk_kng_2(b); //
               if ( ( double_r1 < 3 ) && ( double_r2 < 3 ) ){
               if ( double_r1 + double_r2 == 3 )
                   eval += 300;
               if ( double_r1 + double_r2 == 2 )
                   eval += 300;
                if ( double_r1 + double_r2 == 1 )
                   eval += 100;
                                                                                      }
               int triple_r1 = is_blk_kng_3(b); //
               int triple_r2 = is_blk_kng_4(b); //
               if ( ( triple_r1  < 3 ) && ( triple_r2 < 3 ) ){
               if ( triple_r1 + triple_r2 == 3 )
                  eval += 200;
                  if ( triple_r1 + triple_r2 == 2 )
                  eval += 200;
              if ( triple_r1 + triple_r2 == 1 )
                  eval += 100;
                                                                                  }
                  if ( is_wht_kng_1(b) == 0 && is_wht_kng_2(b) == 0 ){
               if ( is_wht_kng_3(b) == 0 && is_wht_kng_4(b) == 0 ){
               if ( color == WHITE ){
                      if (( b[15] == BLK_KNG ) && ( b[29] == BLK_KNG ) && ( b[16] == BLK_KNG ))
                      eval += 1000;
                      if (( b[29] == BLK_KNG ) && ( b[16] == BLK_KNG ) && ( b[30] == BLK_KNG ))
                      eval += 1000;
                     if (( b[15] == BLK_KNG ) && ( b[24] == BLK_KNG ) && ( b[21] == BLK_KNG ))
                      eval += 1000;
                   if (( b[24] == BLK_KNG ) && ( b[21] == BLK_KNG ) && ( b[30] == BLK_KNG ))
                      eval += 1000;
                                }
                              }
                            }
                      }
           for ( i = 1;i <= num_bpieces;i++){
           if ( (square = p_list[BLACK][i] )  == 0 ) continue;
           if ( ( b[square] & KING ) != 0 ) // black king
           eval += PST_king[square];
                                                                } // for
                        
     for ( i = 1;i <= num_wpieces;i++){
            if ( (square = p_list[WHITE][i]) == 0 ) continue;
            if ( ( b[square] & KING ) != 0 ) // white king
            eval -= PST_king[square];
                                                            } // for
           // negamax formulation requires this:
           eval = ( color == BLACK ) ? eval : -eval;
           EvalHash[ (U32) ( HASH_KEY & EC_MASK ) ] = (HASH_KEY & 0xffffffffffff0000) | ( eval & 0xffff);
           return (eval); 
                               } // only kings left
     if ( nbk == 0 && nwk == 0 ){ // only men left
                 // strong opposition
       if ( b[19] == BLK_MAN )
     if ( (b[32] == WHT_MAN) && (b[28] == WHT_MAN ))
     if (( b[23] == FREE ) && ( b[24] == FREE ))
         eval += 24;
      if ( b[26] == BLK_MAN )
      if ( (b[40] == WHT_MAN) && (b[35] == WHT_MAN ))
      if (( b[30] == FREE ) && ( b[31] == FREE ))
     eval += 24;
          
      if ( b[26] == WHT_MAN )
      if ( (b[13] == BLK_MAN) && (b[17] == BLK_MAN ))
      if (( b[21] == FREE ) && ( b[22] == FREE ))
        eval -= 24;
        if ( b[19] == WHT_MAN )
     if ( (b[5] == BLK_MAN) && (b[10] == BLK_MAN ))
     if (( b[14] == FREE ) && ( b[15] == FREE ))
     eval -= 24;
   
     // most favo(u)rable opposition
   
     if (( b[28] == BLK_MAN ) && ( b[37] == WHT_MAN ) && ( b[38] == FREE ))
         if (( b[32] == FREE ) && ( b[33] == FREE ))
     eval += 28;
     if (( b[17] == WHT_MAN ) && ( b[8] == BLK_MAN ) && ( b[7] == FREE ))
     if (( b[12] == FREE ) && ( b[13] == FREE ))
     eval -= 28;
                                         } // only men left
                               } // special case : very very late endgame
 
  
      // piece-square-tables    
      
      for ( i = 1;i <= num_bpieces;i++){
           if ( (square = p_list[BLACK][i] )  == 0 ) continue;
           if ( ( b[square] & MAN ) != 0 ){ // black man
           opening += PST_man_op[square];
           endgame += PST_man_en[square];
                                                             }
                                                       } // for
                        
     for ( i = 1;i <= num_wpieces;i++){
            if ( (square = p_list[WHITE][i]) == 0 ) continue;
            if ( ( b[square] & MAN ) != 0 ){  // white man
            opening -= PST_man_op[ 45 - square];
            endgame -= PST_man_en[ 45 - square];
                                                               }
                                                   } // for
                                                           
    int phase = nbm + nwm - nbk - nwk;
    if ( phase < 0 ) phase = 0;
    int antiphase = 24 - phase;
       
    eval += (( opening * phase + endgame * (antiphase) )/24);
     if ( ( White + Black < 8 ) &&  nbk != 0 && nwk != 0 && nbm != 0 && nwm != 0 ){
         if ( abs(nbm - nwm ) <= 1  && abs(nbk - nwk ) <= 1 && abs( White - Black ) <= 1 ){
            eval /= 2;
                           }
                           }
     //Lazy evaluation
    // Early exit from evaluation if eval already is extremely low or extremely high
    if ( beta - alpha == 1 ){
    int teval = ( color == WHITE ) ? -eval : eval;
    if ( ( teval - 130 ) > beta )
    return teval;
    if ( ( teval + 130 ) < alpha )
    return teval;
                                        }
 
    static U8 edge1[4] = { 5, 14, 23, 32};
    static U8 edge2[3] = { 13, 22, 31};
    //                                          0   1    2    3    4     5    6     7     8   9  10  11 12
    static U8 edge_malus[13] = {0 ,60 , 40 ,30, 20 , 5 ,  5 ,   5 ,   0 , 0 , 0 ,   0 , 0 };
    int nbme = 0;
    int nwme = 0;
                 /* men on edges */
    if ( nbm <= 4 && nwm <= 4 ){
    for( i = 0; i < 4; i++){
          if( b[edge1[i]] == BLK_MAN ){
          if(( b[edge1[i] + 5 ] == FREE ) && ( b[edge1[i] + 10 ] == WHT_MAN ))
          nbme++;
          else
          if( b[edge1[i] + 1 ] == WHT_MAN )
          nbme++;
                                                            }
          if( b[edge1[i]] == WHT_MAN ){
          if(( b[edge1[i] - 4 ] == FREE ) && ( b[edge1[i] - 8 ] == BLK_MAN ))
          nwme++;
          else
          if( b[edge1[i] + 1 ] == BLK_MAN )
          nwme++;
                                                               } 
                                  };
        for( i = 0; i < 3; i++){
          if( b[edge2[i]] == BLK_MAN ){
          if(( b[edge2[i] + 4 ] == FREE ) && ( b[edge2[i] + 8 ] == WHT_MAN ))
          nbme++;
          else
          if( b[edge2[i] - 1 ] == WHT_MAN )
          nbme++;
                                                            }
          if( b[edge2[i]] == WHT_MAN ){
          if(( b[edge2[i] - 5 ] == FREE ) && ( b[edge2[i] - 10 ] == BLK_MAN ))
          nwme++;
          else
          if( b[edge2[i] - 1 ] == BLK_MAN )
          nwme++;
                                                               } 
                                  };                            
                        }
    eval -= nbme*edge_malus[nbm];
    eval += nwme*edge_malus[nwm];
    // back rank ( a1,c1,e1,g1 ) guard
    // back rank values
    static S8 br[16] = {0,-1,1, 0,3,3,3,3,2,2,2,2,4,4,8,8  };
 
    int code;
    int backrank;
    code = 0;
    if(b[5] & MAN) code++;
    if(b[6] & MAN) code+=2;
    if(b[7] & MAN) code+=4; // Golden checker
    if(b[8] & MAN) code+=8;
    backrank = br[code];
    code = 0;
    if(b[37] & MAN) code+=8;
    if(b[38] & MAN) code+=4; // Golden checker
    if(b[39] & MAN) code+=2;
    if(b[40] & MAN) code++;
    backrank -= br[code];
    int brv = ( NOT_ENDGAME ? 2 : 1);  // multiplier for back rank -- back rank value
    eval += brv * backrank;
 
    opening = 0;
    endgame = 0;
 
    if ( (nbk == 0) && (nwk == 0) ){
     int j;	
                       
     // the move : the move is an endgame term that defines whether one side
     // can force the other to retreat
     if ( nbm == nwm && nbm + nwm <= 12 ){
     int move;
 
     int stonesinsystem = 0;
     if ( color == BLACK && has_man_on_7th(b,BLACK) == 0 )
          {
     for ( i=5; i <= 8;i++)
              {
     for ( j=0; j < 4; j++)
                     {
            if ( b[i+9*j] != FREE ) stonesinsystem++;
                      }
               }
      if ( b[32] == BLK_MAN ) stonesinsystem++; // exception from the rule
      if ( stonesinsystem % 2 ) // the number of stones in blacks system is odd -> he has the move
      endgame += 4;
      else
      endgame -= 4;
         }
         
      if ( color == WHITE && has_man_on_7th(b , WHITE) == 0 )
      {
      for ( i=10; i <= 13;i++)
               {
      for ( j=0; j < 4; j++)
                   {
             if ( b[i+9*j] != FREE ) stonesinsystem++;
                    }
               }
      if ( b[13] == WHT_MAN ) stonesinsystem++;
      if ( stonesinsystem % 2 ) // the number of stones in whites system is odd -> he has the move
      endgame -= 4;
      else
      endgame += 4;
      }
                       }
              /* balance                */
             /* how equally the pieces are distributed on the left and right sides of the board */
     if ( nbm == nwm ){
     int balance = 0;
     int code;
     int index;
     static int value[7] = {0,0,0,0,0,1,256};
     int nbma,nbmb,nbmc,nbmd ; // number black men left a-b-c-d
     int nbme,nbmf,nbmg,nbmh ; // number black men right e-f-g-h
     int nwma,nwmb,nwmc,nwmd ; // number white men left a-b-c-d
     int nwme,nwmf,nwmg,nwmh;  // number white men right e-f-g-h
     // left flank
     code = 0;
     // count file-a men ( on 5,14,23,32 )
     code+=value[b[5]];
     code+=value[b[14]];
     code+=value[b[23]];
     code+=value[b[32]];
     nwma = code & 15;
     nbma = (code>>8) & 15;
     code = 0;
     // count file-b men ( on 10,19,28,37 )
     code+=value[b[10]];
     code+=value[b[19]];
     code+=value[b[28]];
     code+=value[b[37]];
     nwmb = code & 15;
     nbmb = (code>>8) & 15;
     
     code = 0;
     // count file-c men ( on 6,15,24,33 )
     code+=value[b[6]];
     code+=value[b[15]];
     code+=value[b[24]];
     code+=value[b[33]];
     nwmc = code & 15;
     nbmc = (code>>8) & 15;
     code = 0;
     // count file-d men ( on 11,20,29,38 )
     code+=value[b[11]];
     code+=value[b[20]];
     code+=value[b[29]];
     code+=value[b[38]];
     nwmd = code & 15;
     nbmd = (code>>8) & 15;
     
     // right flank
     code = 0;
     // count file-e men ( on 7,16,25,34 )
     code+=value[b[7]];
     code+=value[b[16]];
     code+=value[b[25]];
     code+=value[b[34]];
     nwme = code & 15;
     nbme = (code>>8) & 15;
     code = 0;
     // count file-f men ( on 12,21,30,39 )
     code+=value[b[12]];
     code+=value[b[21]];
     code+=value[b[30]];
     code+=value[b[39]];
     nwmf = code & 15;
     nbmf = (code>>8) & 15;
     code = 0;
     // count file-g men ( on 8,17,26,35 )
     code+=value[b[8]];
     code+=value[b[17]];
     code+=value[b[26]];
     code+=value[b[35]];
     nwmg = code & 15;
     nbmg = (code>>8) & 15;
     code = 0;
     // count file-h men ( on 13,22,31,40 )
     code+=value[b[13]];
     code+=value[b[22]];
     code+=value[b[31]];
     code+=value[b[40]];
     nwmh = code & 15;
     nbmh = (code>>8) & 15;
     
     // 2 blacks stops 3 whites in right flank
     if ( ( nwmf+nwmg+nwmh+nwme ) == 3 ){
     if ( ( nbmf+nbmg+nbmh+nbme ) == 2 ){
     if ( ( b[21] == BLK_MAN ) && ( b[22] == BLK_MAN ) ){
     if ( ( b[35] == WHT_MAN ) && ( b[30] == WHT_MAN ) && ( b[31] == WHT_MAN ) )
     endgame += 24;
                                                                                                  }
     if ( ( b[26] == WHT_MAN ) && ( b[30] == WHT_MAN ) && ( b[31] == WHT_MAN ) ){
     if ( ( b[22] == BLK_MAN ) && ( b[17] == BLK_MAN ) )
     endgame += 24;
                                                                                                                }
                                                         }
                                            } 
 
     // 2 blacks stops 3 whites in left flank
     int nbmabcd = nbma+nbmb+nbmc+nbmd;
     int nwmabcd = nwma+nwmb+nwmc+nwmd;
     if ( ( nbmabcd == 2 ) && ( nwmabcd == 3 ) ){
     if (( b[23] == BLK_MAN ) && ( b[20] == BLK_MAN ))
     if ( ( b[28] == WHT_MAN ) && ( b[32] == WHT_MAN ) && ( b[33] == WHT_MAN ) )
     endgame += 24;
     if (( b[14] == BLK_MAN ) && ( b[11] == BLK_MAN ))
     if ( ( b[19] == WHT_MAN ) && ( b[23] == WHT_MAN ) && ( b[24] == WHT_MAN ) )
         endgame += 24;
                                                                                }
      // for white color
     // 2 whites stops 3 blacks
     if ( ( nwma+nwmb+nwmc+nwmd ) == 2 ){
     if ( ( nbma+nbmb+nbmc+nbmd ) == 3 ){
     if ( ( b[23] == WHT_MAN ) && ( b[24] == WHT_MAN ) ){
     if ( ( b[10] == BLK_MAN ) && ( b[14] == BLK_MAN ) && ( b[15] == BLK_MAN ) )
     endgame -= 24;
                                                                                                     }
     if ( ( b[23] == WHT_MAN ) && ( b[28] == WHT_MAN ) ){
     if ( ( b[14] == BLK_MAN ) && ( b[15] == BLK_MAN ) && ( b[19] == BLK_MAN ) )
     endgame -= 24;
                                                                  }
                                                        }
                                                            }
                                                  
     // 2 whites stops 3 blacks
     int nwmfghe = nwmf + nwmg + nwmh + nwme;
     int nbmfghe = nbmf + nbmg + nbmh + nbme;
     if ( ( nwmfghe == 2 ) && ( nbmfghe == 3 ) ){
     if (( b[22] == WHT_MAN ) && ( b[25] == WHT_MAN ))
     if ( ( b[12] == BLK_MAN ) && ( b[13] == BLK_MAN ) && ( b[17] == BLK_MAN ) )
     endgame -= 24;
     if (( b[31] == WHT_MAN ) && ( b[34] == WHT_MAN )){
     if ( ( b[26] == BLK_MAN ) && ( b[21] == BLK_MAN ) && ( b[22] == BLK_MAN ) )
         endgame -= 24;                                                                                              
                                             }
                                                       }
 
     const S8 cscore_center[4][4] = {
                                           0 , -8,-20,-30,       // 0 versus 0,1,2,3
                                           8,   0,   -8, -20,        // 1 versus 0,1,2,3
                                           20,  8,    0,  -4,           // 2 versus  0,1,2,3
                                           30, 20,  4,   0           // 3 versus  0,1,2,3
                                                 };
                                                 
      const S8 cscore_edge[4][4] = {
                                           0 , -8,-10,-12,       // 0 versus 0,1,2,3
                                           8,   0,   -4, -6,        // 1 versus 0,1,2,3
                                           10,  4,    0,  - 2,           // 2 versus  0,1,2,3
                                           12,  6,    2,   0           // 3 versus  0,1,2,3
                                                 };
          int nbmab = nbma + nbmb;
       int nbmcd = nbmc + nbmd;
       int nbmgh = nbmg + nbmh;
          int nbmef = nbme + nbmf;
   
          
       if ( nbmab > 3 ) nbmab = 3;
       if ( nbmcd > 3 ) nbmcd = 3;
          if ( nbmef > 3 ) nbmef = 3;
          if ( nbmgh > 3 ) nbmgh = 3;
          
          int nwmab = nwma + nwmb;
          int nwmcd = nwmc + nwmd;
          int nwmef = nwme + nwmf;
          int nwmgh = nwmg + nwmh;
          
          if ( nwmab > 3 ) nwmab = 3;
       if ( nwmcd > 3 ) nwmcd = 3;
          if ( nwmef > 3 ) nwmef = 3;
          if ( nwmgh > 3 ) nwmgh = 3;
              
       eval += cscore_edge[nbmab][nwmab];
       eval += cscore_edge[nbmgh][nwmgh];
       eval += cscore_center[nbmcd][nwmcd];
       eval += cscore_center[nbmef][nwmef];
       
      index = -8*nbma - 4*nbmb -2*nbmc -1*nbmd + 1*nbme + 2*nbmf + 4*nbmg + 8*nbmh;
      balance -= abs(index);
      index = -8*nwma - 4*nwmb -2*nwmc - 1*nwmd  + 1*nwme + 2*nwmf + 4*nwmg + 8*nwmh;
      balance += abs(index);
      eval += balance;
      } // balance
               // mobility check
    int b_free = 0; // black's free moves counter
    int b_exchanges = 0; // black's exchanges counter
    int b_losing = 0; // black's apparently losing moves counter
    
    static U8 bonus[25] = {0,6,12,18,24,30,36,42,48,54,60,64,70,76,82,88,94,100,100,100,100,100,100,100,100};
    for ( i = 1;i <= num_bpieces;i++){
           if ( ( square = p_list[BLACK][i] ) == 0 ) continue;
           if ( b[square+5] == FREE ){
           do{
           int is_square_safe = 1;
           int can_recapture = 0;
           if ( ( b[square+10] & WHITE ) != 0 ){ // (1) danger
           is_square_safe = 0;
           // can white capture from square
           if ( ( ( b[square-4] & BLACK ) != 0 ) && ( b[square-8] == FREE ) ){b_losing++;break;}
           if ( ( ( b[square-5] & BLACK ) != 0 ) && ( b[square-10] == FREE ) ){b_losing++;break;}
           if ( ( ( b[square+4] & BLACK ) != 0 ) && ( b[square+8] == FREE ) ){b_losing++;break;}
           // can black recapture square
           if ( ( b[square-5] & BLACK ) != 0 )
           can_recapture = 1;          
           else
           if ( ( ( b[square-4] & BLACK ) != 0 )  && ( b[square+4] == FREE ) )
           can_recapture = 1;
           else
           if ( ( b[square-4] == FREE ) && ( ( b[square+4] & BLACK ) != 0 ) )
           can_recapture = 1;
           else{
           b_losing++;break;
                 }
                                                                  } // (1) danger
 
           if ( ( ( b[square+9] & WHITE ) != 0 ) && ( b[square+1] == FREE ) ){ // (2) danger
           is_square_safe = 0;                         
           // can white capture from (square+1)
           if ( ( ( b[square-3] & BLACK ) != 0 ) && ( b[square-7] == FREE ) ) {b_losing++;break;}
           if ( ( ( b[square-4] & BLACK ) != 0 ) && ( b[square-9] == FREE ) ) {b_losing++;break;}
           if ( ( ( b[square+6] & BLACK ) != 0 ) && ( b[square+11] == FREE ) ) {b_losing++;break;}
           // can black recapture (square+1)
           if ( ( b[square-3] & BLACK ) != 0 )
           can_recapture = 1;          
           else
           if ( ( ( b[square-4] & BLACK ) != 0 )  && ( b[square+6] == FREE ) )
           can_recapture = 1;
           else
           if ( ( b[square-4] == FREE ) && ( ( b[square+6] & BLACK ) != 0 ) )
           can_recapture = 1;
           else{
           b_losing++;break;
                 }
                                                                                                                       } // (2) danger
                                                           
           if ( ( ( b[square+4] & BLACK ) != 0 ) && ( ( b[square+8] & WHITE ) != 0 ) ){ // (3) danger
           is_square_safe = 0;
           // can white capture from square
           if ( b[square+10] == FREE ){b_losing++;break;}
           if ( ( ( b[square-5] & BLACK ) != 0 ) && ( b[square-10] == FREE ) ){b_losing++;break;}
           if ( ( ( b[square-4] & BLACK ) != 0 ) && ( b[square-8] == FREE ) ) {b_losing++;break;}
           // can black recapture square
           if ( b[square-5] == FREE )
           can_recapture = 1;
           else
           if ( ( b[square-4] & BLACK ) != 0 )
           can_recapture = 1;
           else{
           b_losing++;break;
                 }
                                                                                                                                   } // (3) danger
                                                                                                                                   
           if ( ( b[square+9] == FREE ) && ( ( b[square+1] & WHITE ) != 0 ) ){ // (4) danger
           is_square_safe = 0;          	
           // can white capture from square+9
           if ( ( ( b[square+4] & BLACK ) != 0 ) && ( b[square-1] == FREE ) ){b_losing++;break;}
           if ( ( ( b[square+14] & BLACK ) != 0 ) && ( b[square+19] == FREE ) ){b_losing++;break;}
           if ( ( ( b[square+13] & BLACK ) != 0 ) && ( b[square+17] == FREE ) ){b_losing++;break;}
           // can black recapture square+9
           if ( ( b[square+13] & BLACK ) != 0 )
           can_recapture = 1;
           else
           if ( ( ( b[square+4] & BLACK ) != 0 )  && ( b[square+14] == FREE ) )
           can_recapture = 1;
           else
               if ( ( b[square+4] == FREE ) && ( ( b[square+14] & BLACK ) != 0 ) )
            can_recapture = 1;       
            else{
            b_losing++;break;
                   }   
                                                                                                                     } // (4) danger
                                                                                                                     
           // incomplete dangers
           if ( ( ( b[square-5] & BLACK ) != 0 ) && ( ( b[square-10] & WHITE ) != 0 ) ){ break; } // (5)
           if ( ( ( b[square-4] & BLACK ) != 0 ) && ( ( b[square-8] & WHITE ) != 0 ) ){ break; } // (6)
           // assert( is_square_safe^can_recapture == 1 );
           b_free += is_square_safe;
           b_exchanges += can_recapture;    
                  }while (0);
                                               };
                                                       
           if ( b[square+4] == FREE ){
           do{
           int is_square_safe = 1;
           int can_recapture = 0;
           if ( ( b[square+8] & WHITE ) != 0 ){ // (1) danger
           is_square_safe = 0;
           // can white capture from square
           if ( ( ( b[square-4] & BLACK ) != 0 ) && ( b[square-8] == FREE ) ){b_losing++; break;}
           if ( ( ( b[square+5] & BLACK ) != 0 ) && ( b[square+10] == FREE ) ){b_losing++; break;}
           if ( ( ( b[square-5] & BLACK ) != 0 ) && ( b[square-10] == FREE ) ){b_losing++; break;}
           // can black recapture square
           if ( ( b[square-4] & BLACK ) != 0 )
           can_recapture = 1;          
           else
           if ( ( ( b[square-5] & BLACK ) != 0 )  && ( b[square+5] == FREE ) )
           can_recapture = 1;
           else
           if ( ( b[square-5] == FREE ) && ( ( b[square+5] & BLACK ) != 0 ) )
           can_recapture = 1;
           else{
           b_losing++;break;
                 }
                                                                 } // (1) danger
 
           if ( ( ( b[square+9] & WHITE ) != 0 ) && ( b[square-1] == FREE ) ){ // (2) danger
           is_square_safe = 0;                         
           // can white capture from (square-1)
           if ( ( ( b[square-5] & BLACK ) != 0 ) && ( b[square-9] == FREE ) ){b_losing++; break;}
           if ( ( ( b[square-6] & BLACK ) != 0 ) && ( b[square-11] == FREE ) ){b_losing++; break;}
           if ( ( ( b[square+3] & BLACK ) != 0 ) && ( b[square+7] == FREE ) ){b_losing++; break;}
           // can black recapture (square-1)
           if ( ( b[square-6] & BLACK ) != 0 )
           can_recapture = 1;          
           else
           if ( ( ( b[square-5] & BLACK ) != 0 )  && ( b[square+3] == FREE ) )
           can_recapture = 1;
           else
           if ( ( b[square-5] == FREE ) && ( ( b[square+3] & BLACK ) != 0 ) )
           can_recapture = 1;
           else{
           b_losing++;break;
                 }
                                                                                                                    } // (2) danger
                                                           
           if ( ( ( b[square+5] & BLACK ) != 0 ) && ( ( b[square+10] & WHITE ) != 0 ) ){ // (3) danger
           is_square_safe = 0;
           // can white capture from square
           if ( b[square+8] == FREE ) {b_losing++;break;}
           if ( ( ( b[square-5] & BLACK ) != 0 ) && ( b[square-10] == FREE ) ) {b_losing++;break;}
           if ( ( ( b[square-4] & BLACK ) != 0 ) && ( b[square-8] == FREE ) ){b_losing++;break;}
           // can black recapture square
           if ( b[square-4] == FREE )
           can_recapture = 1;
           else
           if ( ( b[square-5] & BLACK ) != 0 )
           can_recapture = 1;
           else{
           b_losing++;break;
                 }
                                                                                                         } // (3) danger
                                                                                                         
           if ( ( b[square+9] == FREE ) && ( ( b[square-1] & WHITE ) != 0 ) ){  // (4) danger
           is_square_safe = 0;
           // can white capture from square+9
           if ( ( ( b[square+5] & BLACK ) != 0 ) && ( b[square+1] == FREE ) ){b_losing++;break;}
           if ( ( ( b[square+14] & BLACK ) != 0 ) && ( b[square+19] == FREE ) ){b_losing++;break;}
           if ( ( ( b[square+13] & BLACK ) != 0 ) && ( b[square+17] == FREE ) ){b_losing++;break;}
           // can black recapture square+9
           if ( ( b[square+14] & BLACK ) != 0 )
           can_recapture = 1;
           else
           if ( ( ( b[square+5] & BLACK ) != 0 )  && ( b[square+13] == FREE ) )
           can_recapture = 1;
           else
               if ( ( b[square+5] == FREE ) && ( ( b[square+13] & BLACK ) != 0 ) )
            can_recapture = 1;       
            else{
            b_losing++;break;
                   }
                               }
          // incomplete dangers
          if ( ( ( b[square-4] & BLACK ) != 0 ) && ( ( b[square-8] & WHITE ) != 0 ) ){ break;} // (5)
          if ( ( ( b[square-5] & BLACK ) != 0 ) && ( ( b[square-10] & WHITE ) != 0 ) ){ break;} // (6)
           // assert( is_square_safe^can_recapture == 1 );
           b_free += is_square_safe;
           b_exchanges += can_recapture;          
             }while (0);
                                 };
                        } // for
                        
            int w_free = 0; // white's free moves counter
            int w_exchanges = 0; // white's exchanges counter
            int w_losing = 0; // whites's apparently losing moves counter
    
            for ( i = 1;i <= num_wpieces;i++){
            if ( ( square = p_list[WHITE][i] ) == 0 ) continue;
            if ( b[square-5] == FREE ){
             do{
            int is_square_safe = 1;
            int can_recapture = 0;
            if ( ( b[square-10] & BLACK ) != 0 ){ // (1) danger
            is_square_safe = 0;
            // can black capture from square
            if ( ( ( b[square+5] & WHITE ) != 0 ) && ( b[square+10] == FREE ) ){w_losing++; break;}
            if ( ( ( b[square+4] & WHITE ) != 0 ) && ( b[square+8] == FREE ) ){w_losing++; break;}
            if ( ( ( b[square-4] & WHITE ) != 0 ) && ( b[square-8] == FREE ) ){w_losing++; break;}
            // can white recapture square
            if ( ( b[square+5] & WHITE ) != 0 )
            can_recapture = 1;
            else          	
            if ( ( ( b[square+4] & WHITE ) != 0 ) && ( b[square-4] == FREE ) )
            can_recapture = 1;
            else
            if ( ( b[square+4] == FREE ) && ( ( b[square-4] & WHITE ) != 0 ) )
            can_recapture = 1;
            else{
            w_losing++;break;
                  }
                                                                   } // (1) danger
                                                                       
            if ( ( b[square-9] & BLACK ) != 0 && ( b[square-1] == FREE ) ){ // (2) danger
            is_square_safe = 0;
            // can black capture from (square-1)
            if ( ( ( b[square+3] & WHITE ) != 0 ) && ( b[square+7] == FREE ) ){w_losing++; break;}
            if ( ( ( b[square+4] & WHITE ) != 0 ) && ( b[square+9] == FREE ) ){w_losing++; break;}
            if ( ( ( b[square-6] & WHITE ) != 0 ) && ( b[square-11] == FREE ) ){w_losing++; break;}
            // can white recapture (square-1)
            if ( ( b[square+3] & WHITE ) != 0 )
            can_recapture = 1;
            else
            if ( ( ( b[square-6] & WHITE ) != 0 ) && ( b[square+4] == FREE ) )
            can_recapture = 1;
            else
               if ( ( b[square-6] == FREE ) && ( ( b[square+4] & WHITE ) !=0 ) )
               can_recapture = 1;
               else{
               w_losing++;break;
                   }
                                                                                                                   } // (2) danger
                                                                                                                   
           if ( ( b[square-4] & WHITE ) != 0 && ( b[square-8] & BLACK ) != 0 ){ // (3) danger
           is_square_safe = 0;
           // can black capture from square
           if ( b[square-10] == FREE ){w_losing++; break;}
           if ( ( ( b[square+5] & WHITE ) != 0 ) && ( b[square+10] == FREE ) ){w_losing++; break;}
           if ( ( ( b[square+4] & WHITE ) != 0 ) && ( b[square+8] == FREE ) ){w_losing++; break;}
           // can white recapture square
           if ( b[square+5] == FREE )
           can_recapture = 1;
           else
           if ( ( b[square+4] & WHITE ) != 0 )
           can_recapture = 1;
           else{
           w_losing++;break;
                 }
                                                                                                              } // (3) danger
                                                                                                              
            if ( ( b[square-9] == FREE ) && ( b[square-1] & BLACK ) != 0 ){ // (4) danger
            is_square_safe = 0;
            // can black capture from square-9
            if ( ( ( b[square-4] & WHITE ) != 0 ) && ( b[square+1] == FREE ) ){w_losing++;break;}
            if ( ( ( b[square-14] & WHITE ) != 0 ) && ( b[square-19] == FREE ) ){w_losing++;break;}
            if ( ( ( b[square-13] & WHITE ) != 0 ) && ( b[square-17] == FREE ) ){w_losing++;break;}
            // can white recapture square-9
            if ( ( b[square-13] & WHITE ) != 0 )
            can_recapture = 1;
            else
            if ( ( ( b[square-14] & WHITE ) != 0 ) && ( b[square-4] == FREE ) )
            can_recapture = 1;
            else
               if ( ( b[square-14] == FREE ) && ( ( b[square-4] & WHITE ) !=0 ) )
               can_recapture = 1;
               else{
               w_losing++;break;
                   }
                           } // (4)
               
           // incomplete                                                                                                                           
           if (( b[square+5] & WHITE)!=0 && ( b[square+10] & BLACK)!=0){ break;} // (5)
           if (( b[square+4] & WHITE)!=0 && ( b[square+8] & BLACK)!=0){ break;} // (6)
     
           // assert( is_square_safe^can_recapture == 1 );	
           w_free += is_square_safe;
           w_exchanges += can_recapture;
            }while (0);   
                 };
       
           if ( b[square-4] == FREE ){
           do{
           int is_square_safe = 1;
           int can_recapture = 0;
           if ( ( b[square-8] & BLACK ) != 0 ){ // (1) danger
           is_square_safe = 0;
           // can black capture from square
           if ( ( ( b[square+4] & WHITE ) != 0 ) && ( b[square+8] == FREE ) ){w_losing++; break;}
           if ( ( ( b[square+5] & WHITE ) != 0 ) && ( b[square+10] == FREE ) ){w_losing++; break;}
           if ( ( ( b[square-5] & WHITE ) != 0 ) && ( b[square-10] == FREE ) ){w_losing++; break;}
           // can white recapture square
           if ( ( b[square+4] & WHITE ) != 0 )
           can_recapture = 1;
           else
           if ( ( ( b[square+5] & WHITE ) != 0 ) && ( b[square-5] == FREE ) )
           can_recapture = 1;
           else
           if ( ( b[square+5] == FREE ) && ( ( b[square-5] & WHITE ) != 0 ) )
           can_recapture = 1;
           else{
           w_losing++;break;
                 }
                                                                 } // (1) danger
 
          if ( ( b[square-9] & BLACK ) != 0 && ( b[square+1] == FREE ) ){ // (2) danger
          is_square_safe = 0;
          // can black capture from (square+1)
          if ( ( ( b[square+6] & WHITE ) != 0 ) && ( b[square+11] == FREE ) ){w_losing++; break;}
          if ( ( ( b[square+5] & WHITE ) != 0 ) && ( b[square+9] == FREE ) ){w_losing++;break;}
          if ( ( ( b[square-3] & WHITE ) != 0 ) && ( b[square-7] == FREE ) ){w_losing++; break;}
          // can white recapture (square+1)
          if ( ( ( b[square+6] & WHITE ) != 0 ) )
          can_recapture = 1;
          else
          if ( ( ( b[square-3] & WHITE ) != 0 ) && ( b[square+5] == FREE ) )
          can_recapture = 1;
          else
          if ( ( b[square-3] == FREE ) && ( ( b[square+5] & WHITE ) != 0 ) )
          can_recapture = 1;
          else{
          w_losing++;break;
                }
                                                                                                                 } // (2) danger
                                                                                                                 
           if ( ( b[square-5] & WHITE ) != 0 && ( b[square-10] & BLACK ) != 0 ){ // (3) danger
           is_square_safe = 0;         	
           // can black capture from square
           if ( b[square-8] == FREE ){w_losing++; break;}
           if ( ( ( b[square+5] & WHITE ) != 0 ) && ( b[square+10] == FREE ) ){w_losing++; break;}
           if ( ( ( b[square+4] & WHITE ) != 0 ) && ( b[square+8] == FREE ) ){w_losing++; break;}
           // can white recapture square
           if ( b[square+4] == FREE )
           can_recapture = 1;
           else
           if ( ( b[square+5] & WHITE ) != 0 )
           can_recapture = 1;
           else{
           w_losing++;break;
                 }       	
                                                                                                                             } // (3) danger
                                                                                                                             
          if ( ( b[square-9] == FREE ) && ( ( b[square+1] & BLACK ) != 0 ) ){ // (4) danger
          is_square_safe = 0;
           // can black capture from square-9
           if ( ( ( b[square-14] & WHITE ) != 0 ) && ( b[square-19] == FREE ) ){w_losing++;break;}
           if ( ( ( b[square-13] & WHITE ) != 0 ) && ( b[square-17] == FREE ) ){w_losing++;break;}
           if ( ( ( b[square-5] & WHITE ) != 0 ) && ( b[square-1] == FREE ) ){w_losing++;break;}
           // can white recapture square-9
           if ( ( b[square-14] & WHITE ) != 0 )
           can_recapture = 1;
           else
           if ( ( ( b[square-13] & WHITE ) != 0 ) && ( b[square-5] == FREE ) )
           can_recapture = 1;
           else
           if ( ( b[square-13] == FREE ) && ( ( b[square-5] & WHITE ) !=0 ) )
           can_recapture = 1;
           else{
           w_losing++;break;
                   }         	
               } // (4)
              
          // incomplete dangers
          if ( ( ( b[square+4] & WHITE) !=0 ) && ( ( b[square+8] & BLACK ) !=0 ) ){ break;} // (5)
          if ( ( ( b[square+5] & WHITE) !=0 ) && ( ( b[square+10] & BLACK ) !=0 ) ){ break;} // (6)
          // assert( is_square_safe^can_recapture == 1 );		
          w_free += is_square_safe;
          w_exchanges += can_recapture;
              }while(0);
                };
                
                
              } // for
  
              if ( b_exchanges ){
              eval += 4*b_exchanges;
                                             }
 
                if ( w_exchanges ){
                 eval -= 4*w_exchanges;
                                             }
                         
              eval += w_losing;
              eval -= b_losing;
              // free moves bonuses
              eval += bonus[b_free];
              eval -= bonus[w_free];
              
              if ( b_free == 0 && b_exchanges == 0 )
              eval -= 36;
              if ( b_free == 0 && b_exchanges == 1 )
              eval -= 36;
                  
              if ( w_free == 0 && w_exchanges == 0 )
              eval += 36;
              if ( w_free == 0 && w_exchanges == 1 )
              eval += 36;
                   } // if ( (nbk == 0) && (nwk == 0) )
               
      // developed black's single corner
      if ( ( b[5] == FREE ) && ( b[10] == FREE ) ){
      opening += 20;
      if (( b[14] != WHT_MAN ) && ( b[15] != WHT_MAN ))
      endgame += 20;
               }
      // developed white's single corner
      if ( ( b[40] == FREE )  && ( b[35] == FREE ) ){
      opening -= 20;
      if (( b[30] != BLK_MAN ) && ( b[31] != BLK_MAN ))
      endgame -= 20;
               }
     // one pattern ( V. K. Adamovich , Genadij I. Xackevich , Viktor Litvinovich )
     if ( ( b[15] == BLK_MAN ) && ( b[30] == WHT_MAN ) ){
     if ( ( b[16] == BLK_MAN ) && ( b[21] == BLK_MAN ) ){
     if ( ( b[24] == WHT_MAN ) && ( b[29] == WHT_MAN ) ){
     if ( ( b[20] == FREE ) && ( b[25] == FREE ) ){
     if ( color == BLACK )
     if (( b[23] != WHT_MAN ) || ( b[19] != BLK_MAN ))
         eval += 8;
         if ( color == WHITE )
     if (( b[22] != BLK_MAN ) || ( b[26] != WHT_MAN ))
         eval -= 8;
                                                                                       }
                                                                                     }
                                                                                   }
                                                                                 }
     // parallel checkers
     if (( b[8] == BLK_MAN ) && ( b[16] == BLK_MAN ))
     if ( b[12] + b[7] + b[20] == FREE )
         endgame -= 24;
     if (( b[13] == BLK_MAN ) && ( b[21] == BLK_MAN ))
     if ( b[12] + b[17] + b[25] == FREE )
         endgame -= 24;
     if (( b[37] == WHT_MAN ) && ( b[29] == WHT_MAN ))
     if ( b[38] + b[33] + b[25] == FREE )
         endgame += 24;
     if (( b[32] == WHT_MAN ) && ( b[24] == WHT_MAN ))
     if ( b[33] + b[28] + b[20] == FREE )
         endgame += 24; 
    // passers on b6,d6,f6,h6
    if ( b[28] == BLK_MAN ){ // b6 ?
    do{
    if ( ( b[32] == FREE ) && ( b[37] == FREE ) ){ endgame += 24;break;}
    if ( color != BLACK ) break;
    if (( b[38] & WHITE ) != 0 ) break;
    if ( b[33] != FREE ) break;
    if ( ( ( b[37] & WHITE ) != 0 ) && ( b[29] == FREE )) break;
    if ( ( ( b[29] & WHITE ) != 0 ) && ( b[37] == FREE )) break;
    endgame += 12;
       }while(0);
                                            }
  
    if ( b[29] == BLK_MAN ){ // d6 ?
    do{
    if ( color != BLACK ) break;
    if ( b[34] != FREE ) break;
    if ( ( b[39] & WHITE ) != 0 ) break;
    if ( ( b[38] == FREE ) && ( ( b[30] & WHITE ) != 0 ) ) break;
    if ( ( ( b[38] & WHITE ) != 0 ) && ( b[30] == FREE ) ) break;	
    endgame += 12;
        }while(0);
    do{
    if ( color != BLACK ) break;
    if ( b[33] != FREE ) break;
    if ( ( b[37] & WHITE ) != 0 ) break;
    if ( ( b[38] == FREE ) && ( ( b[28] & WHITE ) != 0 ) ) break;
    if ( ( ( b[38] & WHITE ) != 0 ) && ( b[28] == FREE ) ) break;	
    endgame += 12;
        }while(0);
                                            }
                                           
    if ( b[30] == BLK_MAN ){ // f6 ?
    do{
    if ( color != BLACK ) break;
    if ( b[35] != FREE ) break;
    if ( ( b[40] & WHITE ) != 0 ) break;
    if ( ( b[39] == FREE ) && ( ( b[31] & WHITE ) != 0 ) ) break;
    if ( ( ( b[39] & WHITE ) != 0 ) && ( b[31] == FREE ) ) break;
    endgame += 12;
       }while(0);
    do{
    if ( color != BLACK ) break;
    if ( b[34] != FREE ) break;
    if ( ( b[38] & WHITE ) != 0 ) break;
    if ( ( b[39] == FREE ) && ( ( b[29] & WHITE ) != 0 ) ) break;
    if ( ( ( b[39] & WHITE ) != 0 ) && ( b[29] == FREE ) ) break;
    endgame += 12;
        }while(0);
                                             }
                                             
    if ( b[31] == BLK_MAN ){ // h6 ?
    if ( is_wht_kng(b) == 0 ){
    if ( b[39] == FREE && b[40] == WHT_MAN )
    endgame += 8;
    if ( b[24] == BLK_MAN )  // h6 + c5
    endgame += 8;
    do{
    if ( color != BLACK ) break;
    if (( b[39] & WHITE ) != 0 ) break;
    if ( b[35] != FREE ) break;
    if ( ( ( b[30] & WHITE ) != 0 ) && ( b[40] == FREE ) ) break;
    if ( ( b[30] == FREE ) && ( ( b[40] & WHITE ) != 0 ) ) break;
    endgame += 12;
       }while(0);
                                            }
                  }                                            
    // passers on a3,c3,e3,g3
    if ( b[14] == WHT_MAN ){ // a3 ?
    if ( is_blk_kng(b) == 0 ){
    if ( b[6] == FREE && b[5] == BLK_MAN )
    endgame -= 8;
    if ( b[21] == WHT_MAN ) // a3 + f4
    endgame -= 8;
    do{
    if ( color != WHITE ) break;
    if (( b[6] & BLACK) != 0) break;
    if ( b[10] != FREE ) break;
    if ( ( ( b[5] & BLACK ) != 0 ) && ( b[15] == FREE ) ) break;
    if ( ( b[5] == FREE ) && ( ( b[15] & BLACK) != 0 ) ) break;
    endgame -= 12;
       }while(0);
                                              }
                                             }
 
    if ( b[15] == WHT_MAN ){ // c3 ?
    do{
    if ( color != WHITE ) break;
    if ( b[10] != FREE ) break;
    if ( ( b[5] & BLACK ) != 0 ) break;
    if ( ( b[6] == FREE ) && ( ( b[14] & BLACK ) != 0 ) ) break;
    if ( ( ( b[6] & BLACK ) != 0 ) && ( b[14] == FREE ) ) break;
    endgame -= 12;
       }while(0);
    do{
    if ( color != WHITE ) break;
    if ( b[11] != FREE ) break;
    if ( ( b[7] & BLACK ) != 0 ) break;
    if ( ( b[6] == FREE ) && ( ( b[16] & BLACK ) != 0 ) ) break;
    if ( ( ( b[6] & BLACK ) != 0 ) && ( b[16] == FREE ) ) break;
    endgame -= 12;
        }while(0);
                                             }
                                             
    if ( b[16] == WHT_MAN ){ // e3 ?
    do{
    if ( color != WHITE ) break;
    if ( b[11] != FREE ) break;
    if ( ( b[6] & BLACK ) != 0 ) break;
    if ( ( b[7] == FREE ) && ( ( b[15] & BLACK ) != 0 ) ) break;
    if ( ( ( b[7] & BLACK ) != 0 ) && ( b[15] == FREE ) ) break;
    endgame -= 12;
       }while(0);
    do{
    if ( color != WHITE ) break;
    if ( b[12] != FREE ) break;
    if ( ( b[8] & BLACK ) != 0 ) break;
    if ( ( b[7] == FREE ) && ( ( b[17] & BLACK ) != 0 ) ) break;
    if ( ( ( b[7] & BLACK ) != 0 ) && ( b[17] == FREE ) ) break;
    endgame -= 12;
        }while(0);
                                             }
 
    if ( b[17] == WHT_MAN ){ // g3 ?
    do{
    if ( ( b[8] == FREE ) && ( b[13] == FREE ) ){ endgame -= 24;break;}
    if ( color != WHITE ) break;
    if ( (b[7] & BLACK) != 0 ) break;
    if ( b[12] != FREE ) break;   	
    if ( ( ( b[8] & BLACK ) != 0 ) && ( b[16] == FREE ) ) break;
    if ( ( b[8] == FREE ) && ( ( b[16] & BLACK ) != 0 ) ) break;
    endgame -= 12;
       }while(0);
                                               }
    // stroennost shashek  
    const int shadow = 5; // bonus for stroennost
    // stroennost for black
    if ( (b[16] & BLACK) != 0 )
    if ( (b[11] & BLACK) != 0 )
    if ( (b[6] & BLACK) != 0 )
    if ( b[21] == FREE )
        eval += shadow;
    if ( (b[16] & BLACK) != 0 )
    if ( (b[12] & BLACK) != 0 )
    if ( (b[8] & BLACK) != 0 )
    if ( b[20] == FREE )
        eval += shadow;
    if ( (b[20] & BLACK) != 0 )
    if ( (b[15] & BLACK) != 0 )
    if ( (b[10] & BLACK) != 0 )
    if ( b[25] == FREE )
        eval += shadow;
    if ( (b[20] & BLACK) != 0 )
    if ( (b[16] & BLACK) != 0 )
    if ( (b[12] & BLACK) != 0 )
    if ( b[24] == FREE )
        eval += shadow;
    if ( (b[25] & BLACK) != 0 )
    if ( (b[20] & BLACK) != 0 )
    if ( (b[15] & BLACK) != 0 )
    if ( b[30] == FREE )
        eval += shadow;
 
    // stroennost for white
    if ( (b[29] & WHITE) != 0 )
    if ( (b[34] & WHITE) != 0 )
    if ( (b[39] & WHITE) != 0 )
    if ( b[24] == FREE )
        eval -= shadow;
    if ( (b[29] & WHITE) != 0 )
    if ( (b[33] & WHITE) != 0 )
    if ( (b[37] & WHITE) != 0 )
    if ( b[25] == FREE )
        eval -= shadow;
    if ( (b[25] & WHITE) != 0 )
    if ( (b[30] & WHITE) != 0 )
    if ( (b[35] & WHITE) != 0 )
    if ( b[20] == FREE )
        eval -= shadow;
    if ( (b[25] & WHITE) != 0 )
    if ( (b[29] & WHITE) != 0 )
    if ( (b[33] & WHITE) != 0 )
    if ( b[21] == FREE )
        eval -= shadow;
    if ( (b[20] & WHITE) != 0 )
    if ( (b[25] & WHITE) != 0 )
    if ( (b[30] & WHITE) != 0 )
    if ( b[15] == FREE )
        eval -= shadow;
    // end stroennost
    int attackers,defenders;
    if ( b[24] == BLK_MAN ){ // b[24] safety
        if ( b[25] == WHT_MAN )
     eval -= 10;
     if (( b[31] != BLK_MAN ) && ( b[34] == WHT_MAN ) && ( b[39] == WHT_MAN ))
        eval -= 10; // bad for b[24]
     if ( ( b[23] == WHT_MAN ) && ( b[14] != FREE ) && ( b[15] == FREE ) && ( b[19] == FREE ))   	
        eval -= 10; // bad for b[24]
        attackers = defenders = 0;
     if ( b[5] == BLK_MAN )
            defenders++;
     if ( b[6] == BLK_MAN )
             defenders++;
     if ( b[10] == BLK_MAN )
            defenders++;
     if ( b[14] == BLK_MAN )
            defenders++;
     if ( b[29] == WHT_MAN )
            attackers++;
     if ( b[33] == WHT_MAN )
             attackers++;
     if ( b[37] == WHT_MAN )
            attackers++;
     if ( b[38] == WHT_MAN )
            attackers++;	   
     // must be defenders >= attackers
     if ( defenders < attackers )
           eval -= 20; 
                             }
                                                
    if ( b[21] == WHT_MAN ){ // b[21] safety
        if ( b[20] == BLK_MAN )
          eval += 10;
     if ( ( b[14] != WHT_MAN ) && ( b[6] == BLK_MAN ) && ( b[11] == BLK_MAN ))
        eval += 10; // bad for b[21]
    if ( ( b[22] == BLK_MAN ) && ( b[31] != FREE ) && ( b[30] == FREE ) && ( b[26] == FREE )) 
        eval += 10; // bad for b[21]
        attackers = defenders = 0;
     if ( b[39] == WHT_MAN )
          defenders++;
     if ( b[40] == WHT_MAN )
             defenders++;
     if ( b[35] == WHT_MAN )
             defenders++;
     if ( b[31] == WHT_MAN )
             defenders++;
     if ( b[16] == BLK_MAN )
             attackers++;
     if ( b[12] == BLK_MAN )
             attackers++;
     if ( b[8] == BLK_MAN )
             attackers++;
     if ( b[7] == BLK_MAN )
             attackers++;
     // must be defenders >= attackers
     if ( defenders < attackers )
           eval += 20;
                                                  }                                     
                                                
    // blocked pieces in quadrants
    if ( ( b[23] == WHT_MAN ) && ( b[14] == BLK_MAN ) && ( b[15] == BLK_MAN ) && ( b[19] == BLK_MAN)){
    eval -= 40;
             }
 
    if (( b[11] == BLK_MAN ) && ( b[15] == BLK_MAN ) && ( b[16] == BLK_MAN ) && ( b[20] == BLK_MAN)){
    if (( b[24] == WHT_MAN ) && ( b[28] == WHT_MAN ) && ( b[25] == WHT_MAN ) && ( b[30] == WHT_MAN)){
    eval -= 40;
    if (( b[6] == BLK_MAN ) && ( b[10] == FREE ) && ( b[14] != WHT_MAN ))
    eval += 10;
    if (( b[7] == BLK_MAN ) && ( b[12] == FREE ) && ( b[17] != WHT_MAN ))
    eval += 10;
               }
             }
  
    if (( b[12] == BLK_MAN ) && ( b[16] == BLK_MAN ) && ( b[17] == BLK_MAN ) && ( b[21] == BLK_MAN)){
    if (( b[22] == WHT_MAN ) && ( b[26] == WHT_MAN ) && ( b[31] == WHT_MAN )){
    eval -= 40;
    if ( b[23] == BLK_MAN )
    eval += 5;
    if (( b[8] == BLK_MAN ) && ( b[13] == FREE ))
    eval += 5;
            }
          }
    
    if (( b[15] == BLK_MAN ) && ( b[19] == BLK_MAN ) && ( b[20] == BLK_MAN ) && ( b[24] == BLK_MAN)){
    eval -= 40;
    if (( b[10] == BLK_MAN ) && ( b[14] == FREE ))
    eval += 10;
    if (( b[11] == BLK_MAN ) && ( b[16] == FREE ) && ( b[21] != WHT_MAN ))
    eval += 10;
             }
    
    if (( b[16] == BLK_MAN ) && ( b[20] == BLK_MAN ) && ( b[21] == BLK_MAN ) && ( b[25] == BLK_MAN)){
    eval -= 40;
    if (( b[11] == BLK_MAN ) && ( b[15] == FREE ) && ( b[19] != WHT_MAN ))
    eval += 10;
    if (( b[12] == BLK_MAN ) && ( b[17] == FREE ) && ( b[22] != WHT_MAN ))
    eval += 10;
                                       }
        
    if ( ( b[34] == WHT_MAN ) && ( b[31] == WHT_MAN ) && ( b[17] == BLK_MAN ) && ( b[21] == BLK_MAN ) && ( b[22] == BLK_MAN ) && ( b[26] == BLK_MAN)){
    eval -= 40;
                }
    //*********************************** for white color
    if ( ( b[22] == BLK_MAN ) && ( b[30] == WHT_MAN ) && ( b[31] == WHT_MAN ) && (b[26] == WHT_MAN)){
    eval += 40;
                     }
                     
    if (( b[33] == WHT_MAN ) && ( b[28] == WHT_MAN ) && ( b[29] == WHT_MAN ) && (b[24] == WHT_MAN)){
    if (( b[23] == BLK_MAN ) && ( b[19] == BLK_MAN ) && ( b[14] == BLK_MAN )){
    eval += 40;
    if ( b[22] == WHT_MAN )
    eval -= 5;
    if (( b[37] == WHT_MAN ) && ( b[32] == FREE ))
    eval -= 5;
                 }
               }
  
    if (( b[34] == WHT_MAN ) && ( b[29] == WHT_MAN ) && ( b[30] == WHT_MAN ) && (b[25] == WHT_MAN)){
    if (( b[15] == BLK_MAN ) && ( b[20] == BLK_MAN ) && ( b[21] == BLK_MAN ) && ( b[17] == BLK_MAN)){
    eval += 40;
    if (( b[38] == WHT_MAN ) && ( b[33] == FREE ) && ( b[28] != BLK_MAN  ))
    eval -= 10;
    if (( b[39] == WHT_MAN ) && ( b[35] == FREE ) && ( b[31] != BLK_MAN  ))
    eval -= 10;
                   }
                 }
    if ( ( b[11] == BLK_MAN ) && ( b[14] == BLK_MAN ) && ( b[28] == WHT_MAN ) && ( b[23] == WHT_MAN ) && ( b[24] == WHT_MAN ) && (b[19] == WHT_MAN)){
    eval += 40;
          }
    
    if (( b[29] == WHT_MAN ) && ( b[24] == WHT_MAN ) && ( b[25] == WHT_MAN ) && (b[20] == WHT_MAN)){
    eval += 40;
    if (( b[33] == WHT_MAN ) && ( b[28] == FREE ) && ( b[23] != BLK_MAN  ))
    eval -= 10;
    if (( b[34] == WHT_MAN ) && ( b[30] == FREE ) && ( b[26] != BLK_MAN  ))
    eval -= 10;
                             }   
    if (( b[30] == WHT_MAN ) && ( b[25] == WHT_MAN ) && ( b[26] == WHT_MAN ) && (b[21] == WHT_MAN)){
    eval += 40;
    if (( b[34] == WHT_MAN ) && ( b[29] == FREE ) && ( b[24] != BLK_MAN  ))
    eval -= 10;
    if (( b[35] == WHT_MAN ) && ( b[31] == FREE ))
    eval -= 10;
                         }
         
     // phase mix
     // smooth transition between game phases
     eval += ((opening * phase + endgame * antiphase )/24);
     eval &= ~(GrainSize - 1);
    // negamax formulation requires this:
    eval = ( color == BLACK ) ? eval : -eval;
    EvalHash[ (U32) ( HASH_KEY & EC_MASK ) ] = (HASH_KEY & 0xffffffffffff0000) | ( eval & 0xffff);
    return (eval);
                     }
 