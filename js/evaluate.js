let eval_hash = new Array(EC_SIZE);

let EVL_man_op = [0,0,0,0,0,  // 0 .. 4
    15,40,42,45,0,            // 5 .. 8 (9)
    12,38,36,15,              // 10 .. 13
    28,26,30,20,0,            // 14 .. 17 (18)
    18,26,36,28,              // 19 .. 22
    32,38,10,18,0,            // 23 .. 26 (27)
    18,22,24,20,              //  28 .. 31
    26,0,0,0,0,               // 32 .. 35 (36)
    0,0,0,0];                 // 37 .. 40
              
let EVL_man_en = [0,0,0,0,0,  // 0 .. 4
    0,2,2,2,    0,            // 5 .. 8 (9)
    4,4,4,4,                  // 10 .. 13
    6,6,6,6,    0,            // 14 .. 17 (18)
    10,10,10,10,              // 19 .. 22
    16,16,16,16,0,            // 23 .. 26 (27)
    22,22,22,22,              //  28 .. 31
    30,0,0,0,   0,            // 32 .. 35 (36)
    0,0,0,0];                 // 37 .. 40

let EVL_king = [0,0,0,0,0,    // 0..4
                20,5,0,10,0,  // 5..8 (9)
                20,5,10,10,   // 10..13
                5,20,12,10,0, // 14..18
                5,20,12,0,    // 19..22
                0,12,20,5,0,  // 23..27
                10,12,20,5,   // 28..31
                10,10,5,20,0, // 32..36
                10,0,5,20];   // 37..40

let edge1 = [ 5, 14, 23, 32];
let edge2 = [ 13, 22, 31];
//                0   1    2   3   4   5    6     7     8   9  10    11  12
let edge_malus = [0 ,60 , 40 ,30, 20 , 5 ,  5 ,   5 ,   0 , 0 , 0 ,   0 , 0 ];
             

function EvalPosition(alpha, beta) {
    let eval = 0;
    let count_wm = 0;
    let count_wk = 0;
    let count_bm = 0;
    let count_bk = 0;
    let count_w;
    let count_b;
    let endgame = 0;
    let opening = 0;
    let main_line = 0;
    let count_w_double_line1 = 0;
    let count_w_double_line2 = 0;
    let count_w_triple_line1 = 0;
    let count_w_triple_line2 = 0;
    let count_b_double_line1 = 0;
    let count_b_double_line2 = 0;
    let count_b_triple_line1 = 0;
    let count_b_triple_line2 = 0;
    let v1;
    let v2;

    if ((( brd_posKey ^ eval_hash[(brd_posKey & EC_MASK )]) & 0xffffffffffff0000) == 0 ) {
        eval  = eval_hash[(brd_posKey & EC_MASK)] & 0xffff;
        return  eval;
    }
    brd_pieces.forEach((element, index) => {
        switch(element) {
            case PIECES.wM:
                if (index % 5 == 0) main_line += element;
                count_wm++;
                break;
            case PIECES.wK:
                if (index % 5 == 0) main_line += element;
                if (index <= 32 && index % 4 == 0) count_w_double_line1++;
                if (index >= 13 && index % 4 == 1) count_w_double_line2++;
                if (index % 5 == 4) count_w_triple_line1++;
                if (index % 5 == 1) count_w_triple_line2++;
                count_wk++;
                break;
            case PIECES.bM:
                if (index % 5 == 0) main_line += element;
                count_bm++;
                break;
            case PIECES.bK:
                if (index % 5 == 0) main_line += element;
                if (index <= 32 && index % 4 == 0) count_b_double_line1++;
                if (index >= 13 && index % 4 == 1) count_b_double_line2++;
                if (index % 5 == 4) count_b_triple_line1++;
                if (index % 5 == 1) count_b_triple_line2++;
                count_bk++;
                break;
        }
    });

    count_w = count_wm + count_wk;
    count_b = count_bm + count_bk;

    if (count_wm == 0 || count_wk == 0) {
        eval = -MATE;
        if (brd_side == COLOURS.BLACK) eval = - eval;
        return eval;
    } 
    if (count_bm == 0 || count_bk == 0) {
        eval = MATE;
        if (brd_side == COLOURS.BLACK) eval = - eval;
        return eval;
    } 

    v1 = 100 * count_bm + 300 * count_bk;
    v2 = 100 * count_wm + 300 * count_wk;
    eval = v1 - v2;

    // draw situations
    if ( count_bm == 0 && count_wm == 0 && abs( count_bk - count_wk) <= 1 ){ 
        eval_hash[(brd_posKey & EC_MASK)] = brd_posKey & 0xffffffffffff0000;
        return 0; // only kings left
    }
    if ( ( eval > 0 ) && ( count_wk > 0 ) && (count_b < (count_wk+2)) ){
        eval_hash[(brd_posKey & EC_MASK)] = brd_posKey & 0xffffffffffff0000;
        return 0; // black cannot win
    }

    if ( ( eval < 0 ) && (count_bk > 0) && (count_w < (count_bk+2)) ){
        eval_hash[(brd_posKey & EC_MASK)] = brd_posKey & 0xffffffffffff0000;
        return 0; // white cannot win
    }

    if ( count_bk != count_wk) {
        if ( count_wk == 0 ){
            if ( count_wm <= 4 ) {
                endgame += 50;
                if ( count_wm <= 3 ) {
                    endgame += 100;
                    if ( count_wm <= 2 ) {
                        endgame += 100;
                        if ( count_wm <= 1 )
                            endgame += 100;	
                    }
                }
            }
        }
        if ( count_bk == 0 ){
            if ( count_bm <= 4 ){
                endgame -= 50;
                if ( count_bm <= 3 ){
                    endgame -= 100;
                    if ( count_bm <= 2 ){
                        endgame -= 100;
                        if ( count_bm <= 1 )
                            endgame -= 100;	
                    }
                }
            }
        }  
    } 
    else {           
        if ( (count_bk == 0) && (count_wk == 0) ) eval += 250 * ( v1 - v2 ) / ( v1 + v2 ); 
        if ( count_bk + count_wk != 0 ) eval += 100 * ( v1 - v2 ) / ( v1 + v2 );
    }

    if ( (count_w < 4) && (count_b < 4) ){
        if ( eval < 0 && count_bk == 1 && main_line == PIECES.bK) {
            if ( count_bm == 0 || brd_pieces[32] == PIECES.bM ){
                eval_hash[(brd_posKey & EC_MASK)] = brd_posKey & 0xffffffffffff0000;
                return 0;
            }
        }
        if ( eval > 0 && nwk == 1 && main_line == PIECES.wK ){
            if ( count_wm == 0 || brd_pieces[13] == PIECES.wM){
                eval_hash[(brd_posKey & EC_MASK)] = brd_posKey & 0xffffffffffff0000;
                return (0);
            }
        }

        if ( (count_wk != 0) && (count_bk != 0) && ( count_bm == 0 ) && ( count_wm == 0 ) ) {
            // only kings left
            if ( count_bk == 1 && count_wk == 3 ){
                if (( count_w_double_line1 < 3 ) && ( count_w_double_line2 < 3 )) {
                    if ( count_w_double_line1 + count_w_double_line2 == 3 )
                        eval -= 300;
                    if ( count_w_double_line1 + count_w_double_line2 == 2 )
                        eval -= 300;
                    if ( count_w_double_line1 + count_w_double_line2 == 1 )
                        eval -= 100;
                }
             
                if ( ( count_w_triple_line1 < 3 ) && ( count_b_triple_line2 < 3 ) ) {
                    if (count_w_triple_line1 + count_w_triple_line2 == 3) eval -= 200;
                    if (count_w_triple_line1 + count_w_triple_line2 == 2) eval -= 200;
                    if (count_w_triple_line1 + count_w_triple_line1 == 1) eval -= 100;
                }
                // Triangle
                if ( count_b_double_line1 == 0 && count_b_double_line2 == 0 ) {
                    if ( count_b_triple_line1 == 0 && count_b_triple_line2 == 0 ) {
                        if (brd_side == COLOURS.BLACK){
                            if ((brd_pieces[15] == PIECES.wK) && (brd_pieces[29] == PIECES.wK) && (brd_pieces[16] == PIECES.wK))
                                eval -= 1000;
                            if ((brd_pieces[29] == PIECES.wK) && (brd_pieces[16] == PIECES.wK) && (brd_pieces[30] == PIECES.wK))
                                eval -= 1000;
                            if ((brd_pieces[15] == PIECES.wK) && (brd_pieces[24] == PIECES.wK) && (brd_pieces[21] == PIECES.wK))
                                eval -= 1000;
                            if ((brd_pieces[24] == PIECES.wK) && (brd_pieces[21] == PIECES.wK) && (brd_pieces[30] == PIECES.wK))
                                eval -= 1000;
                        }
                    }
                }
            }
            // same for black
            if ( count_wk == 1 && count_bk == 3 ) {
                if ( ( count_b_double_line1 < 3 ) && ( count_b_double_line2 < 3 ) ) {
                    if ( count_b_double_line1 + count_b_double_line2 == 3 ) eval += 300;
                    if ( count_b_double_line1 + count_b_double_line2 == 2 ) eval += 300;
                    if ( count_b_double_line1 + count_b_double_line2 == 1 ) eval += 100;
                }
                if ( ( count_b_triple_line1  < 3 ) && ( count_b_triple_line2 < 3 ) ) {
                    if ( count_b_triple_line1 + count_b_triple_line2 == 3 ) eval += 200;
                    if ( count_b_triple_line1 + count_b_triple_line2 == 2 ) eval += 200;
                    if ( count_b_triple_line1 + count_b_triple_line2 == 1 ) eval += 100;
                }
                if ( count_b_double_line1 == 0 && count_b_double_line2 == 0 ){
                    if ( count_b_triple_line1 == 0 && count_b_triple_line2 == 0 ){
                        if ( brd_side == COLOURS.WHITE ){
                            if ((brd_pieces[15] == PIECES.bK) && (brd_pieces[29] == PIECES.bK) && (brd_pieces[16] == PIECES.bK))
                            eval += 1000;
                            if ((brd_pieces[29] == PIECES.bK) && (brd_pieces[16] == PIECES.bK) && (brd_pieces[30] == PIECES.bK))
                            eval += 1000;
                            if ((brd_pieces[15] == PIECES.bK) && (brd_pieces[24] == PIECES.bK) && (brd_pieces[21] == PIECES.bK))
                            eval += 1000;
                            if ((brd_pieces[24] == PIECES.bK) && (brd_pieces[21] == PIECES.bK) && (brd_pieces[30] == PIECES.bK))
                            eval += 1000;
                        }
                    }
                }
            }
            brd_pieces.forEach((element, index) => {
                switch(element){
                    case PIECES.wK:
                        eval += EVL_king[index];
                        break;
                    case PIECES.bK:
                        eval -= EVL_king[index];
                }
            })
            // negamax formulation requires this:
            eval = ( brd_side == COLOURS.BLACK ) ? eval : -eval;
            EvalHash[ (U32) ( HASH_KEY & EC_MASK ) ] = (HASH_KEY & 0xffffffffffff0000) | ( eval & 0xffff);
            return (eval); 
        } // only kings left
        if ( count_bk == 0 && count_wk == 0 ){ // only men left
                  // strong opposition
            if ( brd_pieces[19] == PIECES.bM )
                if ( (brd_pieces[32] == PIECES.wM) && (brd_pieces[28] == PIECES.wM ))
                    if (( brd_pieces[23] == PIECES.EMPTY ) && ( brd_pieces[24] == PIECES.EMPTY )) eval += 24;
            if ( brd_pieces[26] == PIECES.bM )
                if ( (brd_pieces[40] == PIECES.wM) && (brd_pieces[35] == PIECES.wM ))
                if (( brd_pieces[30] == PIECES.EMPTY ) && ( brd_pieces[31] == PIECES.EMPTY ))  eval += 24;
           
            if ( brd_pieces[26] == PIECES.wM )
                if ( (brd_pieces[13] == PIECES.bM) && (brd_pieces[17] == PIECES.bM ))
                    if (( brd_pieces[21] == PIECES.EMPTY ) && ( brd_pieces[22] == PIECES.EMPTY )) eval -= 24;
            if ( brd_pieces[19] == PIECES.wM )
                if ( (brd_pieces[5] == PIECES.bM) && (brd_pieces[10] == PIECES.bM ))
                    if (( brd_pieces[14] == PIECES.EMPTY ) && ( brd_pieces[15] == PIECES.EMPTY )) eval -= 24;
            
            // most favo(u)rable opposition
            
            if (( brd_pieces[28] == PIECES.bM ) && ( brd_pieces[37] == PIECES.wM ) && ( brd_pieces[38] == PIECES.EMPTY ))
                if (( brd_pieces[32] == PIECES.EMPTY ) && ( brd_pieces[33] == PIECES.EMPTY )) eval += 28;
            if (( brd_pieces[17] == PIECES.wM ) && ( brd_pieces[8] == PIECES.bM ) && ( brd_pieces[7] == PIECES.EMPTY ))
                if (( brd_pieces[12] == PIECES.EMPTY ) && ( brd_pieces[13] == PIECES.EMPTY )) eval -= 28;
        } // only men left
    } // special case : very very late endgame

    // piece-square-tables    
    brd_pieces.forEach((element, index) => {
        switch(element) {
            case PIECES.bM:
                opening += EVL_man_op[index];
                endgame += EVL_man_en[index];
                break;
            case PIECES.wM:
                opening -= EVL_man_op[45 - index];
                endgame -= EVL_man_en[45 - index];
        }
    }) 
                                                        
    let phase = count_bm + count_wm - count_bk - count_wk;
    if ( phase < 0 ) phase = 0;
    let antiphase = 24 - phase;
        
    eval += (( opening * phase + endgame * (antiphase) )/24);
    if ( ( count_w + count_b < 8 ) &&  count_bk != 0 && count_wk != 0 && count_bm != 0 && count_wm != 0 )
    if ( Math.abs(count_bm - count_wm ) <= 1  && Math.abs(count_bk - count_wk ) <= 1 && Math.abs( count_w - count_b ) <= 1 )  eval /= 2;
    //Lazy evaluation
    // Early exit from evaluation if eval already is extremely low or extremely high
    if ( beta - alpha == 1 ){
        let teval = ( brd_side == COLOURS.WHITE ) ? -eval : eval;
        if ( ( teval - 130 ) > beta )
        return teval;
        if ( ( teval + 130 ) < alpha )
        return teval;
    }
    
    let count_bme = 0;
    let count_wme = 0;
    
    if ( count_bm <= 4 && count_wm <= 4 ) {
        edge1.forEach(element => {
            if (brd_pieces[element] == PIECES.bM) {
                if (brd_pieces[element + 5] == PIECES.EMPTY && brd_pieces[element + 10] == PIECES.wM) count_bme++;
                else if (brd_pieces[element + 1] == PIECES.wM) count_bme++;
            }
            if (brd_pieces[element] == PIECES.wM) {
                if (brd_pieces[element - 4] == PIECES.EMPTY && brd_pieces[element - 8] == PIECES.bM) count_wme++;
                else if (brd_pieces[element + 1] == PIECES.bM) count_wme++;
            }
        })

        edge2.forEach(element => {
            if (brd_pieces[element] == PIECES.bM) {
                if (brd_pieces[element + 4] == PIECES.EMPTY && brd_pieces[element + 8] == PIECES.wM) count_bme++;
                else if (brd_pieces[element - 1] == PIECES.wM) count_bme++;
            }
            if (brd_pieces[element] == PIECES.wM) {
                if (brd_pieces[element - 5] == PIECES.EMPTY && brd_pieces[element - 10] == PIECES.bM) count_wme++;
                else if (brd_pieces[element - 1] == PIECES.bM) count_wme++;
            }
        })

    }
    eval -= count_bme*edge_malus[count_bm];
    eval += count_wme*edge_malus[count_wm];
    // back rank ( a1,c1,e1,g1 ) guard
    // back rank values
    let br = [0,-1,1, 0,3,3,3,3,2,2,2,2,4,4,8,8  ];
    
    let code;
    ilett backrank;
    code = 0;
    if(brd_pieces[5] == PIECES.wM) code++;
    if(brd_pieces[6] == PIECES.wM) code+=2;
    if(brd_pieces[7] == PIECES.wM) code+=4; // Golden checker
    if(brd_pieces[8] == PIECES.wM) code+=8;
    backrank = br[code];
    code = 0;
    if(brd_pieces[37] == PIECES.bM) code+=8;
    if(brd_pieces[38] == PIECES.bM) code+=4; // Golden checker
    if(brd_pieces[39] == PIECES.bM) code+=2;
    if(brd_pieces[40] == PIECES.bM) code++;
    backrank -= br[code];
    let brv = ( count_wm + count_wk + count_bm + count_bk > 13 ? 2 : 1);  // multiplier for back rank -- back rank value
    eval += brv * backrank;
    
    opening = 0;
    endgame = 0;
    
    if ( (count_bk == 0) && (count_wk == 0) ){
        let j;	
                        
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
        return eval;
}
