let evl_hash = new Array(EC_SIZE);

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

    eval = 100 * (count_wm - count_bm) + 300 * (count_wk - count_bk);

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
        if ( abs(count_bm - count_wm ) <= 1  && abs(count_bk - count_wk ) <= 1 && abs( count_w - count_b ) <= 1 )  eval /= 2;
    //Lazy evaluation
    // Early exit from evaluation if eval already is extremely low or extremely high
    if ( beta - alpha == 1 ){
    let teval = ( brd_side == COLOURS.WHITE ) ? -eval : eval;
    if ( ( teval - 130 ) > beta )
    return teval;
    if ( ( teval + 130 ) < alpha )
    return teval;
                                     }
    return eval;
}
