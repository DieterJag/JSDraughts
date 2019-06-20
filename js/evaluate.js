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
    let backrank;
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
        if ( count_bm == count_wm && count_bm + count_wm <= 12 ){
            let move;
        
            let stonesinsystem = 0;
            let has_man_on_7th_b = 0;
            if (brd_pieces[32] == PIECES.bM && brd_pieces[37] == PIECES.EMPTY) has_man_on_7th_b = 1;
            else if (brd_pieces[33] == PIECES.bM && (brd_pieces[37] == PIECES.EMPTY ||
                brd_pieces[38] == PIECES.EMPTY)) has_man_on_7th_b = 1;
            else if (brd_pieces[34] == PIECES.bM && (brd_pieces[38] == PIECES.EMPTY ||
                brd_pieces[39] == PIECES.EMPTY)) has_man_on_7th_b = 1;
            else if (brd_pieces[35] == PIECES.bM && (brd_pieces[39] == PIECES.EMPTY ||
                brd_pieces[40] == PIECES.EMPTY)) has_man_on_7th_b = 1;
            if ( brd_side == COLORS.BLACK && has_man_on_7th_b == 0 ) { 
                for ( i=5; i <= 8;i++) {
                    for ( j=0; j < 4; j++) {
                        if ( brd_pieces[i+9*j] != PIECES.EMPTY ) stonesinsystem++;
                    }
                }
                if ( brd_pieces[32] == PIECES.bM) stonesinsystem++; // exception from the rule
                if ( stonesinsystem % 2 ) endgame += 4;// the number of stones in blacks system is odd -> he has the move
                else endgame -= 4;
            }
                
            let has_man_on_7th_w = 0;
            if (brd_pieces[13] == PIECES.wM && brd_pieces[8] == PIECES.EMPTY) has_man_on_7th_w = 1;
            else if (brd_pieces[12] == PIECES.wM && (brd_pieces[7] == PIECES.EMPTY ||
                brd_pieces[8] == PIECES.EMPTY)) has_man_on_7th_w = 1;
            else if (brd_pieces[11] == PIECES.bM && (brd_pieces[6] == PIECES.EMPTY ||
                brd_pieces[7] == PIECES.EMPTY)) has_man_on_7th_w = 1;
            else if (brd_pieces[10] == PIECES.bM && (brd_pieces[5] == PIECES.EMPTY ||
                brd_pieces[6] == PIECES.EMPTY)) has_man_on_7th_w = 1;
            if ( brd_side == COLORS.WHITE && has_man_on_7th_w == 0 ) // need cha
            {
                for ( i=10; i <= 13;i++) {
                    for ( j=0; j < 4; j++) {
                        if ( brd_pieces[i+9*j] != PIECES.EMPTY ) stonesinsystem++;
                    }
                }
                if ( brd_pieces[13] == PIECES.wM ) stonesinsystem++;
                if ( stonesinsystem % 2 ) endgame -= 4; // the number of stones in whites system is odd -> he has the move
                else endgame += 4;
            }
        }
                /* balance                */
                /* how equally the pieces are distributed on the left and right sides of the board */
        if ( count_bm == count_wm ) {
            let balance = 0;
            let code;
            let index;
            let value = [0,0,0,0,0,1,256];
            let count_bma,count_bmb,count_bmc,count_bmd ; // number black men left a-b-c-d
            let count_bme,count_bmf,count_bmg,count_bmh ; // number black men right e-f-g-h
            let count_wma,count_wmb,count_wmc,count_wmd ; // number white men left a-b-c-d
            let count_wme,count_wmf,count_wmg,count_wmh;  // number white men right e-f-g-h
            // left flank
            code = 0;
            // count file-a men ( on 5,14,23,32 )
            code+=value[brd_pieces[5]];
            code+=value[brd_pieces[14]];
            code+=value[brd_pieces[23]];
            code+=value[brd_pieces[32]];
            count_wma = code & 15;
            count_bma = (code>>8) & 15;
            code = 0;
            // count file-b men ( on 10,19,28,37 )
            code+=value[brd_pieces[10]];
            code+=value[brd_pieces[19]];
            code+=value[brd_pieces[28]];
            code+=value[brd_pieces[37]];
            count_wmb = code & 15;
            count_bmb = (code>>8) & 15;
            
            code = 0;
            // count file-c men ( on 6,15,24,33 )
            code+=value[brd_pieces[6]];
            code+=value[brd_pieces[15]];
            code+=value[brd_pieces[24]];
            code+=value[brd_pieces[33]];
            count_wmc = code & 15;
            count_bmc = (code>>8) & 15;
            code = 0;
            // count file-d men ( on 11,20,29,38 )
            code+=value[brd_pieces[11]];
            code+=value[brd_pieces[20]];
            code+=value[brd_pieces[29]];
            code+=value[brd_pieces[38]];
            count_wmd = code & 15;
            count_bmd = (code>>8) & 15;
            
            // right flank
            code = 0;
            // count file-e men ( on 7,16,25,34 )
            code+=value[brd_pieces[7]];
            code+=value[brd_pieces[16]];
            code+=value[brd_pieces[25]];
            code+=value[brd_pieces[34]];
            count_wme = code & 15;
            count_bme = (code>>8) & 15;
            code = 0;
            // count file-f men ( on 12,21,30,39 )
            code+=value[brd_pieces[12]];
            code+=value[brd_pieces[21]];
            code+=value[brd_pieces[30]];
            code+=value[brd_pieces[39]];
            count_wmf = code & 15;
            count_bmf = (code>>8) & 15;
            code = 0;
            // count file-g men ( on 8,17,26,35 )
            code+=value[brd_pieces[8]];
            code+=value[brd_pieces[17]];
            code+=value[brd_pieces[26]];
            code+=value[brd_pieces[35]];
            count_wmg = code & 15;
            count_bmg = (code>>8) & 15;
            code = 0;
            // count file-h men ( on 13,22,31,40 )
            code+=value[brd_pieces[13]];
            code+=value[brd_pieces[22]];
            code+=value[brd_pieces[31]];
            code+=value[brd_pieces[40]];
            count_wmh = code & 15;
            count_bmh = (code>>8) & 15;
            
            // 2 blacks stops 3 whites in right flank
            if ( ( count_wmf+count_wmg+count_wmh+count_wme ) == 3 ){
                if ( ( count_bmf+count_bmg+count_bmh+count_bme ) == 2 ){
                    if ( ( brd_pieces[21] == BLK_MAN ) && ( brd_pieces[22] == PIECES.bM ) ){
                        if ((brd_pieces[35] == PIECES.wM) && (brd_pieces[30] == PIECES.wM) && 
                            (brd_pieces[31] == PIECES.wM)) endgame += 24;
                    }
                    if ( ( brd_pieces[26] == PIECES.wM ) && ( brd_pieces[30] == PIECES.wM ) && ( brd_pieces[31] == PIECES.wM ) ){
                        if ( ( brd_pieces[22] == PIECES.bM ) && ( brd_pieces[17] == PIECES.bM ) ) endgame += 24;
                    }
                }
            } 
        
            // 2 blacks stops 3 whites in left flank
            let count_bmabcd = count_bma+count_bmb+count_bmc+count_bmd;
            let count_wmabcd = count_wma+count_wmb+count_wmc+count_wmd;
            if ( ( count_bmabcd == 2 ) && ( count_wmabcd == 3 ) ){
                if (( brd_pieces[23] == PIECES.bM ) && ( brd_pieces[20] == PIECES.bM ))
                    if ((brd_pieces[28] == PIECES.wM) && (brd_pieces[32] == PIECES.wM) && 
                        (brd_pieces[33] == PIECES.wM)) endgame += 24;
                if (( brd_pieces[14] == PIECES.bM ) && ( brd_pieces[11] == PIECES.bM ))
                    if ((brd_pieces[19] == PIECES.wM) && (brd_pieces[23] == PIECES.wM) && 
                        (brd_pieces[24] == PIECES.wM)) endgame += 24;
            }
            // for white color
            // 2 whites stops 3 blacks
            if ( ( count_wma+count_wmb+count_wmc+count_wmd ) == 2 ){
                if ( ( count_bma+count_bmb+count_bmc+count_bmd ) == 3 ){
                    if ( ( brd_pieces[23] == PIECES.wM ) && ( brd_pieces[24] == PIECES.wM ) ){
                        if ((brd_pieces[10] == PIECES.bM) && (brd_pieces[14] == PIECES.bM) && 
                            (brd_pieces[15] == PIECES.bM)) endgame -= 24;
                    }
                    if ( ( brd_pieces[23] == PIECES.wM ) && ( brd_pieces[28] == PIECES.wM ) ){
                        if ((brd_pieces[14] == PIECES.bM) && (brd_pieces[15] == PIECES.bM) && 
                            (brd_pieces[19] == PIECES.bM)) endgame -= 24;
                    }
                }
            }
                                                        
            // 2 whites stops 3 blacks
            let count_wmfghe = count_wmf + count_wmg + count_wmh + count_wme;
            let count_bmfghe = count_bmf + count_bmg + count_bmh + count_bme;
            if ( ( count_wmfghe == 2 ) && ( count_bmfghe == 3 ) ){
                if (( brd_pieces[22] == PIECES.wM ) && ( brd_pieces[25] == PIECES.wM ))
                    if ((brd_pieces[12] == PIECES.bM) && (brd_pieces[13] == PIECES.bM) && 
                        (brd_pieces[17] == PIECES.bM)) endgame -= 24;
                if (( brd_pieces[31] == PIECES.wM ) && ( brd_pieces[34] == PIECES.wM )){
                    if ((brd_pieces[26] == PIECES.bM) && (brd_pieces[21] == PIECES.bM) && 
                        (brd_pieces[22] == PIECES.bM)) endgame -= 24;                                                                                              
                }
            }
    
            let cscore_center = [
                                    [0 , -8,  -20, -30],       // 0 versus 0,1,2,3
                                    [8,   0,   -8, -20],       // 1 versus 0,1,2,3
                                    [20,  8,    0,  -4],       // 2 versus  0,1,2,3
                                    [30, 20,    4,   0]        // 3 versus  0,1,2,3
            ];
                                                        
            let cscore_edge = [
                                    [0 , -8,  -10,  -12],       // 0 versus 0,1,2,3
                                    [8,   0,   -4,   -6],       // 1 versus 0,1,2,3
                                    [10,  4,    0,  - 2],       // 2 versus  0,1,2,3
                                    [12,  6,    2,    0]        // 3 versus  0,1,2,3
            ];
            let count_bmab = count_bma + count_bmb;
            let count_bmcd = count_bmc + count_bmd;
            let count_bmgh = count_bmg + count_bmh;
            let count_bmef = count_bme + count_bmf;
        
                
            if ( count_bmab > 3 ) count_bmab = 3;
            if ( count_bmcd > 3 ) count_bmcd = 3;
            if ( count_bmef > 3 ) count_bmef = 3;
            if ( count_bmgh > 3 ) count_bmgh = 3;
            
            let count_wmab = count_wma + count_wmb;
            let count_wmcd = count_wmc + count_wmd;
            let count_wmef = count_wme + count_wmf;
            let count_wmgh = count_wmg + count_wmh;
            
            if ( count_wmab > 3 ) count_wmab = 3;
            if ( count_wmcd > 3 ) count_wmcd = 3;
            if ( count_wmef > 3 ) count_wmef = 3;
            if ( count_wmgh > 3 ) count_wmgh = 3;
                    
            eval += cscore_edge[count_bmab][count_wmab];
            eval += cscore_edge[count_bmgh][count_wmgh];
            eval += cscore_center[count_bmcd][count_wmcd];
            eval += cscore_center[count_bmef][count_wmef];
            
            index = -8*count_bma - 4*count_bmb -2*count_bmc -1*count_bmd + 1*count_bme + 2*count_bmf + 4*count_bmg + 8*count_bmh;
            balance -= abs(index);
            index = -8*count_wma - 4*count_wmb -2*count_wmc - 1*count_wmd  + 1*nwme + 2*count_wmf + 4*count_wmg + 8*count_wmh;
            balance += abs(index);
            eval += balance;
        } // balance
                // mobility check
        let b_free = 0; // black's free moves counter
        let b_exchanges = 0; // black's exchanges counter
        let b_losing = 0; // black's apparently losing moves counter
        
        let w_free = 0; // white's free moves counter
        let w_exchanges = 0; // white's exchanges counter
        let w_losing = 0; // whites's apparently losing moves counter

        let bonus = [0,6,12,18,24,30,36,42,48,54,60,64,70,76,82,88,94,100,100,100,100,100,100,100,100];

        brd_pieces.forEach((element, index) => {
            if (element == PIECES.bM) {

                if ( brd_pieces[index+5] == PIECES.EMPTY ){
                    do{
                    let is_square_safe = 1;
                    let can_recapture = 0;
                    if (brd_pieces[index+10] == PIECES.wM){ // (1) danger
                        is_square_safe = 0;
                        // can white capture from square
                        if ((brd_pieces[index-4] == PIECES.bM) && (brd_pieces[index-8] == PIECES.EMPTY)){b_losing++;break;}
                        if ((brd_pieces[index-5] == PIECES.bM) && (brd_pieces[index-10] == PIECES.EMPTY)){b_losing++;break;}
                        if ((brd_pieces[index+4] == PIECES.bM) && (brd_pieces[index+8] == PIECES.EMPTY)){b_losing++;break;}
                        // can black recapture square
                        if (brd_pieces[index-5] == PIECES.bM)
                            can_recapture = 1;          
                        else
                        if ((brd_pieces[index-4] == PIECES.bM)  && (brd_pieces[index+4] == PIECES.EMPTY))
                            can_recapture = 1;
                        else
                        if ((brd_pieces[index-4] == PIECES.EMPTY) && (brd_pieces[index+4] == PIECES.bM))
                            can_recapture = 1;
                        else{
                            b_losing++;break;
                        }
                    } // (1) danger
            
                    if ((brd_pieces[index+9] == PIECES.wM) && (brd_pieces[index+1] == PIECES.EMPTY)){ // (2) danger
                    is_square_safe = 0;                         
                    // can white capture from (square+1)
                    if ( ( ( brd_pieces[index-3] & PIECES.bM ) != 0 ) && ( brd_pieces[index-7] == PIECES.EMPTY ) ) {b_losing++;break;}
                    if ( ( ( brd_pieces[index-4] & PIECES.bM ) != 0 ) && ( brd_pieces[index-9] == PIECES.EMPTY ) ) {b_losing++;break;}
                    if ( ( ( brd_pieces[index+6] & PIECES.bM ) != 0 ) && ( brd_pieces[index+11] == PIECES.EMPTY ) ) {b_losing++;break;}
                    // can black recapture (square+1)
                    if ( ( brd_pieces[index-3] & PIECES.bM ) != 0 )
                    can_recapture = 1;          
                    else
                    if ( ( ( brd_pieces[index-4] & PIECES.bM ) != 0 )  && ( brd_pieces[index+6] == PIECES.EMPTY ) )
                    can_recapture = 1;
                    else
                    if ( ( brd_pieces[index-4] == PIECES.EMPTY ) && ( ( brd_pieces[index+6] & PIECES.bM ) != 0 ) )
                    can_recapture = 1;
                    else{
                    b_losing++;break;
                            }
                                                                                                                                } // (2) danger
                                                                    
                    if ( ( ( brd_pieces[index+4] & PIECES.bM ) != 0 ) && ( ( brd_pieces[index+8] & WHITE ) != 0 ) ){ // (3) danger
                    is_square_safe = 0;
                    // can white capture from square
                    if ( brd_pieces[index+10] == PIECES.EMPTY ){b_losing++;break;}
                    if ( ( ( brd_pieces[index-5] & PIECES.bM ) != 0 ) && ( brd_pieces[index-10] == PIECES.EMPTY ) ){b_losing++;break;}
                    if ( ( ( brd_pieces[index-4] & PIECES.bM ) != 0 ) && ( brd_pieces[index-8] == PIECES.EMPTY ) ) {b_losing++;break;}
                    // can black recapture square
                    if ( brd_pieces[index-5] == PIECES.EMPTY )
                    can_recapture = 1;
                    else
                    if ( ( brd_pieces[index-4] & PIECES.bM ) != 0 )
                    can_recapture = 1;
                    else{
                    b_losing++;break;
                            }
                                                                                                                                            } // (3) danger
                                                                                                                                            
                    if ( ( brd_pieces[index+9] == PIECES.EMPTY ) && ( ( brd_pieces[index+1] & WHITE ) != 0 ) ){ // (4) danger
                    is_square_safe = 0;          	
                    // can white capture from square+9
                    if ( ( ( brd_pieces[index+4] & PIECES.bM ) != 0 ) && ( brd_pieces[index-1] == PIECES.EMPTY ) ){b_losing++;break;}
                    if ( ( ( brd_pieces[index+14] & PIECES.bM ) != 0 ) && ( brd_pieces[index+19] == PIECES.EMPTY ) ){b_losing++;break;}
                    if ( ( ( brd_pieces[index+13] & PIECES.bM ) != 0 ) && ( brd_pieces[index+17] == PIECES.EMPTY ) ){b_losing++;break;}
                    // can black recapture square+9
                    if ( ( brd_pieces[index+13] & PIECES.bM ) != 0 )
                    can_recapture = 1;
                    else
                    if ( ( ( brd_pieces[index+4] & PIECES.bM ) != 0 )  && ( brd_pieces[index+14] == PIECES.EMPTY ) )
                    can_recapture = 1;
                    else
                        if ( ( brd_pieces[index+4] == PIECES.EMPTY ) && ( ( brd_pieces[index+14] & PIECES.bM ) != 0 ) )
                    can_recapture = 1;       
                    else{
                    b_losing++;break;
                            }   
                                                                                                                                } // (4) danger
                                                                                                                                
                    // incomplete dangers
                    if ( ( ( brd_pieces[index-5] & PIECES.bM ) != 0 ) && ( ( brd_pieces[index-10] & WHITE ) != 0 ) ){ break; } // (5)
                    if ( ( ( brd_pieces[index-4] & PIECES.bM ) != 0 ) && ( ( brd_pieces[index-8] & WHITE ) != 0 ) ){ break; } // (6)
                    // assert( is_square_safe^can_recapture == 1 );
                    b_free += is_square_safe;
                    b_exchanges += can_recapture;    
                            }while (0);
                                                        };
                                                                
                    if ( brd_pieces[index+4] == PIECES.EMPTY ){
                    do{
                    let is_square_safe = 1;
                    let can_recapture = 0;
                    if ( ( brd_pieces[index+8] & WHITE ) != 0 ){ // (1) danger
                    is_square_safe = 0;
                    // can white capture from square
                    if ( ( ( brd_pieces[index-4] & PIECES.bM ) != 0 ) && ( brd_pieces[index-8] == PIECES.EMPTY ) ){b_losing++; break;}
                    if ( ( ( brd_pieces[index+5] & PIECES.bM ) != 0 ) && ( brd_pieces[index+10] == PIECES.EMPTY ) ){b_losing++; break;}
                    if ( ( ( brd_pieces[index-5] & PIECES.bM ) != 0 ) && ( brd_pieces[index-10] == PIECES.EMPTY ) ){b_losing++; break;}
                    // can black recapture square
                    if ( ( brd_pieces[index-4] & PIECES.bM ) != 0 )
                    can_recapture = 1;          
                    else
                    if ( ( ( brd_pieces[index-5] & PIECES.bM ) != 0 )  && ( brd_pieces[index+5] == PIECES.EMPTY ) )
                    can_recapture = 1;
                    else
                    if ( ( brd_pieces[index-5] == PIECES.EMPTY ) && ( ( brd_pieces[index+5] & PIECES.bM ) != 0 ) )
                    can_recapture = 1;
                    else{
                    b_losing++;break;
                            }
                                                                            } // (1) danger
            
                    if ( ( ( brd_pieces[index+9] & WHITE ) != 0 ) && ( brd_pieces[index-1] == PIECES.EMPTY ) ){ // (2) danger
                    is_square_safe = 0;                         
                    // can white capture from (square-1)
                    if ( ( ( brd_pieces[index-5] & PIECES.bM ) != 0 ) && ( brd_pieces[index-9] == PIECES.EMPTY ) ){b_losing++; break;}
                    if ( ( ( brd_pieces[index-6] & PIECES.bM ) != 0 ) && ( brd_pieces[index-11] == PIECES.EMPTY ) ){b_losing++; break;}
                    if ( ( ( brd_pieces[index+3] & PIECES.bM ) != 0 ) && ( brd_pieces[index+7] == PIECES.EMPTY ) ){b_losing++; break;}
                    // can black recapture (square-1)
                    if ( ( brd_pieces[index-6] & PIECES.bM ) != 0 )
                    can_recapture = 1;          
                    else
                    if ( ( ( brd_pieces[index-5] & PIECES.bM ) != 0 )  && ( brd_pieces[index+3] == PIECES.EMPTY ) )
                    can_recapture = 1;
                    else
                    if ( ( brd_pieces[index-5] == PIECES.EMPTY ) && ( ( brd_pieces[index+3] & PIECES.bM ) != 0 ) )
                    can_recapture = 1;
                    else{
                    b_losing++;break;
                            }
                                                                                                                            } // (2) danger
                                                                    
                    if ( ( ( brd_pieces[index+5] & PIECES.bM ) != 0 ) && ( ( brd_pieces[index+10] & WHITE ) != 0 ) ){ // (3) danger
                    is_square_safe = 0;
                    // can white capture from square
                    if ( brd_pieces[index+8] == PIECES.EMPTY ) {b_losing++;break;}
                    if ( ( ( brd_pieces[index-5] & PIECES.bM ) != 0 ) && ( brd_pieces[index-10] == PIECES.EMPTY ) ) {b_losing++;break;}
                    if ( ( ( brd_pieces[index-4] & PIECES.bM ) != 0 ) && ( brd_pieces[index-8] == PIECES.EMPTY ) ){b_losing++;break;}
                    // can black recapture square
                    if ( brd_pieces[index-4] == PIECES.EMPTY )
                    can_recapture = 1;
                    else
                    if ( ( brd_pieces[index-5] & PIECES.bM ) != 0 )
                    can_recapture = 1;
                    else{
                    b_losing++;break;
                            }
                                                                                                                    } // (3) danger
                                                                                                                    
                    if ( ( brd_pieces[index+9] == PIECES.EMPTY ) && ( ( brd_pieces[index-1] & WHITE ) != 0 ) ){  // (4) danger
                    is_square_safe = 0;
                    // can white capture from square+9
                    if ( ( ( brd_pieces[index+5] & PIECES.bM ) != 0 ) && ( brd_pieces[index+1] == PIECES.EMPTY ) ){b_losing++;break;}
                    if ( ( ( brd_pieces[index+14] & PIECES.bM ) != 0 ) && ( brd_pieces[index+19] == PIECES.EMPTY ) ){b_losing++;break;}
                    if ( ( ( brd_pieces[index+13] & PIECES.bM ) != 0 ) && ( brd_pieces[index+17] == PIECES.EMPTY ) ){b_losing++;break;}
                    // can black recapture square+9
                    if ( ( brd_pieces[index+14] & PIECES.bM ) != 0 )
                    can_recapture = 1;
                    else
                    if ( ( ( brd_pieces[index+5] & PIECES.bM ) != 0 )  && ( brd_pieces[index+13] == PIECES.EMPTY ) )
                    can_recapture = 1;
                    else
                        if ( ( brd_pieces[index+5] == PIECES.EMPTY ) && ( ( brd_pieces[index+13] & PIECES.bM ) != 0 ) )
                    can_recapture = 1;       
                    else{
                    b_losing++;break;
                            }
                                        }
                    // incomplete dangers
                    if ( ( ( brd_pieces[index-4] & PIECES.bM ) != 0 ) && ( ( brd_pieces[index-8] & WHITE ) != 0 ) ){ break;} // (5)
                    if ( ( ( brd_pieces[index-5] & PIECES.bM ) != 0 ) && ( ( brd_pieces[index-10] & WHITE ) != 0 ) ){ break;} // (6)
                    // assert( is_square_safe^can_recapture == 1 );
                    b_free += is_square_safe;
                    b_exchanges += can_recapture;          
                        }while (0);
                                            };
            }
            else if (element == PIECES.wM) {
                if ( brd_pieces[index-5] == PIECES.EMPTY ){
                    do{
                let is_square_safe = 1;
                let can_recapture = 0;
                if ( ( brd_pieces[index-10] & PIECES.bM ) != 0 ){ // (1) danger
                is_square_safe = 0;
                // can black capture from square
                if ( ( ( brd_pieces[index+5] & WHITE ) != 0 ) && ( brd_pieces[index+10] == PIECES.EMPTY ) ){w_losing++; break;}
                if ( ( ( brd_pieces[index+4] & WHITE ) != 0 ) && ( brd_pieces[index+8] == PIECES.EMPTY ) ){w_losing++; break;}
                if ( ( ( brd_pieces[index-4] & WHITE ) != 0 ) && ( brd_pieces[index-8] == PIECES.EMPTY ) ){w_losing++; break;}
                // can white recapture square
                if ( ( brd_pieces[index+5] & WHITE ) != 0 )
                can_recapture = 1;
                else          	
                if ( ( ( brd_pieces[index+4] & WHITE ) != 0 ) && ( brd_pieces[index-4] == PIECES.EMPTY ) )
                can_recapture = 1;
                else
                if ( ( brd_pieces[index+4] == PIECES.EMPTY ) && ( ( brd_pieces[index-4] & WHITE ) != 0 ) )
                can_recapture = 1;
                else{
                w_losing++;break;
                        }
                                                                        } // (1) danger
                                                                            
                if ( ( brd_pieces[index-9] & PIECES.bM ) != 0 && ( brd_pieces[index-1] == PIECES.EMPTY ) ){ // (2) danger
                is_square_safe = 0;
                // can black capture from (square-1)
                if ( ( ( brd_pieces[index+3] & WHITE ) != 0 ) && ( brd_pieces[index+7] == PIECES.EMPTY ) ){w_losing++; break;}
                if ( ( ( brd_pieces[index+4] & WHITE ) != 0 ) && ( brd_pieces[index+9] == PIECES.EMPTY ) ){w_losing++; break;}
                if ( ( ( brd_pieces[index-6] & WHITE ) != 0 ) && ( brd_pieces[index-11] == PIECES.EMPTY ) ){w_losing++; break;}
                // can white recapture (square-1)
                if ( ( brd_pieces[index+3] & WHITE ) != 0 )
                can_recapture = 1;
                else
                if ( ( ( brd_pieces[index-6] & WHITE ) != 0 ) && ( brd_pieces[index+4] == PIECES.EMPTY ) )
                can_recapture = 1;
                else
                    if ( ( brd_pieces[index-6] == PIECES.EMPTY ) && ( ( brd_pieces[index+4] & WHITE ) !=0 ) )
                    can_recapture = 1;
                    else{
                    w_losing++;break;
                        }
                                                                                                                        } // (2) danger
                                                                                                                        
                if ( ( brd_pieces[index-4] & WHITE ) != 0 && ( brd_pieces[index-8] & PIECES.bM ) != 0 ){ // (3) danger
                is_square_safe = 0;
                // can black capture from square
                if ( brd_pieces[index-10] == PIECES.EMPTY ){w_losing++; break;}
                if ( ( ( brd_pieces[index+5] & WHITE ) != 0 ) && ( brd_pieces[index+10] == PIECES.EMPTY ) ){w_losing++; break;}
                if ( ( ( brd_pieces[index+4] & WHITE ) != 0 ) && ( brd_pieces[index+8] == PIECES.EMPTY ) ){w_losing++; break;}
                // can white recapture square
                if ( brd_pieces[index+5] == PIECES.EMPTY )
                can_recapture = 1;
                else
                if ( ( brd_pieces[index+4] & WHITE ) != 0 )
                can_recapture = 1;
                else{
                w_losing++;break;
                        }
                                                                                                                    } // (3) danger
                                                                                                                    
                if ( ( brd_pieces[index-9] == PIECES.EMPTY ) && ( brd_pieces[index-1] & PIECES.bM ) != 0 ){ // (4) danger
                is_square_safe = 0;
                // can black capture from square-9
                if ( ( ( brd_pieces[index-4] & WHITE ) != 0 ) && ( brd_pieces[index+1] == PIECES.EMPTY ) ){w_losing++;break;}
                if ( ( ( brd_pieces[index-14] & WHITE ) != 0 ) && ( brd_pieces[index-19] == PIECES.EMPTY ) ){w_losing++;break;}
                if ( ( ( brd_pieces[index-13] & WHITE ) != 0 ) && ( brd_pieces[index-17] == PIECES.EMPTY ) ){w_losing++;break;}
                // can white recapture square-9
                if ( ( brd_pieces[index-13] & WHITE ) != 0 )
                can_recapture = 1;
                else
                if ( ( ( brd_pieces[index-14] & WHITE ) != 0 ) && ( brd_pieces[index-4] == PIECES.EMPTY ) )
                can_recapture = 1;
                else
                    if ( ( brd_pieces[index-14] == PIECES.EMPTY ) && ( ( brd_pieces[index-4] & WHITE ) !=0 ) )
                    can_recapture = 1;
                    else{
                    w_losing++;break;
                        }
                                } // (4)
                    
                // incomplete                                                                                                                           
                if (( brd_pieces[index+5] & WHITE)!=0 && ( brd_pieces[index+10] & PIECES.bM)!=0){ break;} // (5)
                if (( brd_pieces[index+4] & WHITE)!=0 && ( brd_pieces[index+8] & PIECES.bM)!=0){ break;} // (6)
            
                // assert( is_square_safe^can_recapture == 1 );	
                w_free += is_square_safe;
                w_exchanges += can_recapture;
                }while (0);   
                        };
            
                if ( brd_pieces[index-4] == PIECES.EMPTY ){
                do{
                let is_square_safe = 1;
                let can_recapture = 0;
                if ( ( brd_pieces[index-8] & PIECES.bM ) != 0 ){ // (1) danger
                is_square_safe = 0;
                // can black capture from square
                if ( ( ( brd_pieces[index+4] & WHITE ) != 0 ) && ( brd_pieces[index+8] == PIECES.EMPTY ) ){w_losing++; break;}
                if ( ( ( brd_pieces[index+5] & WHITE ) != 0 ) && ( brd_pieces[index+10] == PIECES.EMPTY ) ){w_losing++; break;}
                if ( ( ( brd_pieces[index-5] & WHITE ) != 0 ) && ( brd_pieces[index-10] == PIECES.EMPTY ) ){w_losing++; break;}
                // can white recapture square
                if ( ( brd_pieces[index+4] & WHITE ) != 0 )
                can_recapture = 1;
                else
                if ( ( ( brd_pieces[index+5] & WHITE ) != 0 ) && ( brd_pieces[index-5] == PIECES.EMPTY ) )
                can_recapture = 1;
                else
                if ( ( brd_pieces[index+5] == PIECES.EMPTY ) && ( ( brd_pieces[index-5] & WHITE ) != 0 ) )
                can_recapture = 1;
                else{
                w_losing++;break;
                        }
                                                                        } // (1) danger
        
                if ( ( brd_pieces[index-9] & PIECES.bM ) != 0 && ( brd_pieces[index+1] == PIECES.EMPTY ) ){ // (2) danger
                is_square_safe = 0;
                // can black capture from (square+1)
                if ( ( ( brd_pieces[index+6] & WHITE ) != 0 ) && ( brd_pieces[index+11] == PIECES.EMPTY ) ){w_losing++; break;}
                if ( ( ( brd_pieces[index+5] & WHITE ) != 0 ) && ( brd_pieces[index+9] == PIECES.EMPTY ) ){w_losing++;break;}
                if ( ( ( brd_pieces[index-3] & WHITE ) != 0 ) && ( brd_pieces[index-7] == PIECES.EMPTY ) ){w_losing++; break;}
                // can white recapture (square+1)
                if ( ( ( brd_pieces[index+6] & WHITE ) != 0 ) )
                can_recapture = 1;
                else
                if ( ( ( brd_pieces[index-3] & WHITE ) != 0 ) && ( brd_pieces[index+5] == PIECES.EMPTY ) )
                can_recapture = 1;
                else
                if ( ( brd_pieces[index-3] == PIECES.EMPTY ) && ( ( brd_pieces[index+5] & WHITE ) != 0 ) )
                can_recapture = 1;
                else{
                w_losing++;break;
                    }
                                                                                                                        } // (2) danger
                                                                                                                        
                if ( ( brd_pieces[index-5] & WHITE ) != 0 && ( brd_pieces[index-10] & PIECES.bM ) != 0 ){ // (3) danger
                is_square_safe = 0;         	
                // can black capture from square
                if ( brd_pieces[index-8] == PIECES.EMPTY ){w_losing++; break;}
                if ( ( ( brd_pieces[index+5] & WHITE ) != 0 ) && ( brd_pieces[index+10] == PIECES.EMPTY ) ){w_losing++; break;}
                if ( ( ( brd_pieces[index+4] & WHITE ) != 0 ) && ( brd_pieces[index+8] == PIECES.EMPTY ) ){w_losing++; break;}
                // can white recapture square
                if ( brd_pieces[index+4] == PIECES.EMPTY )
                can_recapture = 1;
                else
                if ( ( brd_pieces[index+5] & WHITE ) != 0 )
                can_recapture = 1;
                else{
                w_losing++;break;
                        }       	
                                                                                                                                    } // (3) danger
                                                                                                                                    
                if ( ( brd_pieces[index-9] == PIECES.EMPTY ) && ( ( brd_pieces[index+1] & PIECES.bM ) != 0 ) ){ // (4) danger
                is_square_safe = 0;
                // can black capture from square-9
                if ( ( ( brd_pieces[index-14] & WHITE ) != 0 ) && ( brd_pieces[index-19] == PIECES.EMPTY ) ){w_losing++;break;}
                if ( ( ( brd_pieces[index-13] & WHITE ) != 0 ) && ( brd_pieces[index-17] == PIECES.EMPTY ) ){w_losing++;break;}
                if ( ( ( brd_pieces[index-5] & WHITE ) != 0 ) && ( brd_pieces[index-1] == PIECES.EMPTY ) ){w_losing++;break;}
                // can white recapture square-9
                if ( ( brd_pieces[index-14] & WHITE ) != 0 )
                can_recapture = 1;
                else
                if ( ( ( brd_pieces[index-13] & WHITE ) != 0 ) && ( brd_pieces[index-5] == PIECES.EMPTY ) )
                can_recapture = 1;
                else
                if ( ( brd_pieces[index-13] == PIECES.EMPTY ) && ( ( brd_pieces[index-5] & WHITE ) !=0 ) )
                can_recapture = 1;
                else{
                w_losing++;break;
                        }         	
                    } // (4)
                    
                // incomplete dangers
                if ( ( ( brd_pieces[index+4] & WHITE) !=0 ) && ( ( brd_pieces[index+8] & PIECES.bM ) !=0 ) ){ break;} // (5)
                if ( ( ( brd_pieces[index+5] & WHITE) !=0 ) && ( ( brd_pieces[index+10] & PIECES.bM ) !=0 ) ){ break;} // (6)
                // assert( is_square_safe^can_recapture == 1 );		
                w_free += is_square_safe;
                w_exchanges += can_recapture;
                    }while(0);
                    };
            }
        })
                        
    
    
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
        
        if ( b_free == 0 && b_exchanges == 0 ) eval -= 36;
        if ( b_free == 0 && b_exchanges == 1 ) eval -= 36;
            
        if ( w_free == 0 && w_exchanges == 0 ) eval += 36;
        if ( w_free == 0 && w_exchanges == 1 ) eval += 36;
    } // if ( (nbk == 0) && (nwk == 0) )
                
        // developed black's single corner
        if ( ( brd_pieces[5] == PIECES.EMPTY ) && ( brd_pieces[10] == PIECES.EMPTY ) ){
        opening += 20;
        if (( brd_pieces[14] != PIECES.wM ) && ( brd_pieces[15] != PIECES.wM ))
        endgame += 20;
                }
        // developed white's single corner
        if ( ( brd_pieces[40] == PIECES.EMPTY )  && ( brd_pieces[35] == PIECES.EMPTY ) ){
        opening -= 20;
        if (( brd_pieces[30] != PIECES.bM ) && ( brd_pieces[31] != PIECES.bM ))
        endgame -= 20;
                }
        // one pattern ( V. K. Adamovich , Genadij I. Xackevich , Viktor Litvinovich )
        if ( ( brd_pieces[15] == PIECES.bM ) && ( brd_pieces[30] == PIECES.wM ) ){
           if ( ( brd_pieces[16] == PIECES.bM ) && ( brd_pieces[21] == PIECES.bM ) ){
            if ( ( brd_pieces[24] == PIECES.wM ) && ( brd_pieces[29] == PIECES.wM ) ){
                if ( ( brd_pieces[20] == PIECES.EMPTY ) && ( brd_pieces[25] == PIECES.EMPTY ) ){
                    if ( brd_side == COLORS.BLACK )
                    if ((brd_pieces[23] != PIECES.wM) || (brd_pieces[19] != PIECES.bM)) eval += 8;
                    if ( brd_side == COLORS.WHITE )
                    if ((brd_pieces[22] != PIECES.bM) || (brd_pieces[26] != PIECES.wM)) eval -= 8;
                }
            }
           }
        }
        // parallel checkers
        if (( brd_pieces[8] == PIECES.bM ) && ( brd_pieces[16] == PIECES.bM ))
        if ( brd_pieces[12] + brd_pieces[7] + brd_pieces[20] == PIECES.EMPTY )
            endgame -= 24;
        if (( brd_pieces[13] == PIECES.bM ) && ( brd_pieces[21] == PIECES.bM ))
        if ( brd_pieces[12] + brd_pieces[17] + brd_pieces[25] == PIECES.EMPTY )
            endgame -= 24;
        if (( brd_pieces[37] == PIECES.wM ) && ( brd_pieces[29] == PIECES.wM ))
        if ( brd_pieces[38] + brd_pieces[33] + brd_pieces[25] == PIECES.EMPTY )
            endgame += 24;
        if (( brd_pieces[32] == PIECES.wM ) && ( brd_pieces[24] == PIECES.wM ))
        if ( brd_pieces[33] + brd_pieces[28] + brd_pieces[20] == PIECES.EMPTY )
            endgame += 24; 
    // passers on b6,d6,f6,h6
    if ( brd_pieces[28] == PIECES.bM ){ // b6 ?
    do{
    if ( ( brd_pieces[32] == PIECES.EMPTY ) && ( brd_pieces[37] == PIECES.EMPTY ) ){ endgame += 24;break;}
    if ( color != BLACK ) break;
    if (( brd_pieces[38] & WHITE ) != 0 ) break;
    if ( brd_pieces[33] != PIECES.EMPTY ) break;
    if ( ( ( brd_pieces[37] & WHITE ) != 0 ) && ( brd_pieces[29] == PIECES.EMPTY )) break;
    if ( ( ( brd_pieces[29] & WHITE ) != 0 ) && ( brd_pieces[37] == PIECES.EMPTY )) break;
    endgame += 12;
        }while(0);
                                            }
    
    if ( brd_pieces[29] == PIECES.bM ){ // d6 ?
    do{
    if ( color != BLACK ) break;
    if ( brd_pieces[34] != PIECES.EMPTY ) break;
    if ( ( brd_pieces[39] & WHITE ) != 0 ) break;
    if ( ( brd_pieces[38] == PIECES.EMPTY ) && ( ( brd_pieces[30] & WHITE ) != 0 ) ) break;
    if ( ( ( brd_pieces[38] & WHITE ) != 0 ) && ( brd_pieces[30] == PIECES.EMPTY ) ) break;	
    endgame += 12;
        }while(0);
    do{
    if ( color != BLACK ) break;
    if ( brd_pieces[33] != PIECES.EMPTY ) break;
    if ( ( brd_pieces[37] & WHITE ) != 0 ) break;
    if ( ( brd_pieces[38] == PIECES.EMPTY ) && ( ( brd_pieces[28] & WHITE ) != 0 ) ) break;
    if ( ( ( brd_pieces[38] & WHITE ) != 0 ) && ( brd_pieces[28] == PIECES.EMPTY ) ) break;	
    endgame += 12;
        }while(0);
                                            }
                                            
    if ( brd_pieces[30] == PIECES.bM ){ // f6 ?
    do{
    if ( color != BLACK ) break;
    if ( brd_pieces[35] != PIECES.EMPTY ) break;
    if ( ( brd_pieces[40] & WHITE ) != 0 ) break;
    if ( ( brd_pieces[39] == PIECES.EMPTY ) && ( ( brd_pieces[31] & WHITE ) != 0 ) ) break;
    if ( ( ( brd_pieces[39] & WHITE ) != 0 ) && ( brd_pieces[31] == PIECES.EMPTY ) ) break;
    endgame += 12;
        }while(0);
    do{
    if ( color != BLACK ) break;
    if ( brd_pieces[34] != PIECES.EMPTY ) break;
    if ( ( brd_pieces[38] & WHITE ) != 0 ) break;
    if ( ( brd_pieces[39] == PIECES.EMPTY ) && ( ( brd_pieces[29] & WHITE ) != 0 ) ) break;
    if ( ( ( brd_pieces[39] & WHITE ) != 0 ) && ( brd_pieces[29] == PIECES.EMPTY ) ) break;
    endgame += 12;
        }while(0);
                                                }
                                                
    if ( brd_pieces[31] == PIECES.bM ){ // h6 ?
    if ( is_wht_kng(b) == 0 ){
    if ( brd_pieces[39] == PIECES.EMPTY && brd_pieces[40] == PIECES.wM )
    endgame += 8;
    if ( brd_pieces[24] == PIECES.bM )  // h6 + c5
    endgame += 8;
    do{
    if ( color != BLACK ) break;
    if (( brd_pieces[39] & WHITE ) != 0 ) break;
    if ( brd_pieces[35] != PIECES.EMPTY ) break;
    if ( ( ( brd_pieces[30] & WHITE ) != 0 ) && ( brd_pieces[40] == PIECES.EMPTY ) ) break;
    if ( ( brd_pieces[30] == PIECES.EMPTY ) && ( ( brd_pieces[40] & WHITE ) != 0 ) ) break;
    endgame += 12;
        }while(0);
                                            }
                    }                                            
    // passers on a3,c3,e3,g3
    if ( brd_pieces[14] == PIECES.wM ){ // a3 ?
    if ( is_blk_kng(b) == 0 ){
    if ( brd_pieces[6] == PIECES.EMPTY && brd_pieces[5] == PIECES.bM )
    endgame -= 8;
    if ( brd_pieces[21] == PIECES.wM ) // a3 + f4
    endgame -= 8;
    do{
    if ( color != WHITE ) break;
    if (( brd_pieces[6] & BLACK) != 0) break;
    if ( brd_pieces[10] != PIECES.EMPTY ) break;
    if ( ( ( brd_pieces[5] & BLACK ) != 0 ) && ( brd_pieces[15] == PIECES.EMPTY ) ) break;
    if ( ( brd_pieces[5] == PIECES.EMPTY ) && ( ( brd_pieces[15] & BLACK) != 0 ) ) break;
    endgame -= 12;
        }while(0);
                                                }
                                                }
    
    if ( brd_pieces[15] == PIECES.wM ){ // c3 ?
    do{
    if ( color != WHITE ) break;
    if ( brd_pieces[10] != PIECES.EMPTY ) break;
    if ( ( brd_pieces[5] & BLACK ) != 0 ) break;
    if ( ( brd_pieces[6] == PIECES.EMPTY ) && ( ( brd_pieces[14] & BLACK ) != 0 ) ) break;
    if ( ( ( brd_pieces[6] & BLACK ) != 0 ) && ( brd_pieces[14] == PIECES.EMPTY ) ) break;
    endgame -= 12;
        }while(0);
    do{
    if ( color != WHITE ) break;
    if ( brd_pieces[11] != PIECES.EMPTY ) break;
    if ( ( brd_pieces[7] & BLACK ) != 0 ) break;
    if ( ( brd_pieces[6] == PIECES.EMPTY ) && ( ( brd_pieces[16] & BLACK ) != 0 ) ) break;
    if ( ( ( brd_pieces[6] & BLACK ) != 0 ) && ( brd_pieces[16] == PIECES.EMPTY ) ) break;
    endgame -= 12;
        }while(0);
                                                }
                                                
    if ( brd_pieces[16] == PIECES.wM ){ // e3 ?
    do{
    if ( color != WHITE ) break;
    if ( brd_pieces[11] != PIECES.EMPTY ) break;
    if ( ( brd_pieces[6] & BLACK ) != 0 ) break;
    if ( ( brd_pieces[7] == PIECES.EMPTY ) && ( ( brd_pieces[15] & BLACK ) != 0 ) ) break;
    if ( ( ( brd_pieces[7] & BLACK ) != 0 ) && ( brd_pieces[15] == PIECES.EMPTY ) ) break;
    endgame -= 12;
        }while(0);
    do{
    if ( color != WHITE ) break;
    if ( brd_pieces[12] != PIECES.EMPTY ) break;
    if ( ( brd_pieces[8] & BLACK ) != 0 ) break;
    if ( ( brd_pieces[7] == PIECES.EMPTY ) && ( ( brd_pieces[17] & BLACK ) != 0 ) ) break;
    if ( ( ( brd_pieces[7] & BLACK ) != 0 ) && ( brd_pieces[17] == PIECES.EMPTY ) ) break;
    endgame -= 12;
        }while(0);
                                                }
    
    if ( brd_pieces[17] == PIECES.wM ){ // g3 ?
    do{
    if ( ( brd_pieces[8] == PIECES.EMPTY ) && ( brd_pieces[13] == PIECES.EMPTY ) ){ endgame -= 24;break;}
    if ( color != WHITE ) break;
    if ( (brd_pieces[7] & BLACK) != 0 ) break;
    if ( brd_pieces[12] != PIECES.EMPTY ) break;   	
    if ( ( ( brd_pieces[8] & BLACK ) != 0 ) && ( brd_pieces[16] == PIECES.EMPTY ) ) break;
    if ( ( brd_pieces[8] == PIECES.EMPTY ) && ( ( brd_pieces[16] & BLACK ) != 0 ) ) break;
    endgame -= 12;
        }while(0);
                                                }
    // stroennost shashek  
    let shadow = 5; // bonus for stroennost
    // stroennost for black
    if ( (brd_pieces[16] & BLACK) != 0 )
    if ( (brd_pieces[11] & BLACK) != 0 )
    if ( (brd_pieces[6] & BLACK) != 0 )
    if ( brd_pieces[21] == PIECES.EMPTY )
        eval += shadow;
    if ( (brd_pieces[16] & BLACK) != 0 )
    if ( (brd_pieces[12] & BLACK) != 0 )
    if ( (brd_pieces[8] & BLACK) != 0 )
    if ( brd_pieces[20] == PIECES.EMPTY )
        eval += shadow;
    if ( (brd_pieces[20] & BLACK) != 0 )
    if ( (brd_pieces[15] & BLACK) != 0 )
    if ( (brd_pieces[10] & BLACK) != 0 )
    if ( brd_pieces[25] == PIECES.EMPTY )
        eval += shadow;
    if ( (brd_pieces[20] & BLACK) != 0 )
    if ( (brd_pieces[16] & BLACK) != 0 )
    if ( (brd_pieces[12] & BLACK) != 0 )
    if ( brd_pieces[24] == PIECES.EMPTY )
        eval += shadow;
    if ( (brd_pieces[25] & BLACK) != 0 )
    if ( (brd_pieces[20] & BLACK) != 0 )
    if ( (brd_pieces[15] & BLACK) != 0 )
    if ( brd_pieces[30] == PIECES.EMPTY )
        eval += shadow;
    
    // stroennost for white
    if ( (brd_pieces[29] & WHITE) != 0 )
    if ( (brd_pieces[34] & WHITE) != 0 )
    if ( (brd_pieces[39] & WHITE) != 0 )
    if ( brd_pieces[24] == PIECES.EMPTY )
        eval -= shadow;
    if ( (brd_pieces[29] & WHITE) != 0 )
    if ( (brd_pieces[33] & WHITE) != 0 )
    if ( (brd_pieces[37] & WHITE) != 0 )
    if ( brd_pieces[25] == PIECES.EMPTY )
        eval -= shadow;
    if ( (brd_pieces[25] & WHITE) != 0 )
    if ( (brd_pieces[30] & WHITE) != 0 )
    if ( (brd_pieces[35] & WHITE) != 0 )
    if ( brd_pieces[20] == PIECES.EMPTY )
        eval -= shadow;
    if ( (brd_pieces[25] & WHITE) != 0 )
    if ( (brd_pieces[29] & WHITE) != 0 )
    if ( (brd_pieces[33] & WHITE) != 0 )
    if ( brd_pieces[21] == PIECES.EMPTY )
        eval -= shadow;
    if ( (brd_pieces[20] & WHITE) != 0 )
    if ( (brd_pieces[25] & WHITE) != 0 )
    if ( (brd_pieces[30] & WHITE) != 0 )
    if ( brd_pieces[15] == PIECES.EMPTY )
        eval -= shadow;
    // end stroennost
    let attackers,defenders;
    if ( brd_pieces[24] == PIECES.bM ){ // brd_pieces[24] safety
        if ( brd_pieces[25] == PIECES.wM )
        eval -= 10;
        if (( brd_pieces[31] != PIECES.bM ) && ( brd_pieces[34] == PIECES.wM ) && ( brd_pieces[39] == PIECES.wM ))
        eval -= 10; // bad for brd_pieces[24]
        if ( ( brd_pieces[23] == PIECES.wM ) && ( brd_pieces[14] != PIECES.EMPTY ) && ( brd_pieces[15] == PIECES.EMPTY ) && ( brd_pieces[19] == PIECES.EMPTY ))   	
        eval -= 10; // bad for brd_pieces[24]
        attackers = defenders = 0;
        if ( brd_pieces[5] == PIECES.bM )
            defenders++;
        if ( brd_pieces[6] == PIECES.bM )
                defenders++;
        if ( brd_pieces[10] == PIECES.bM )
            defenders++;
        if ( brd_pieces[14] == PIECES.bM )
            defenders++;
        if ( brd_pieces[29] == PIECES.wM )
            attackers++;
        if ( brd_pieces[33] == PIECES.wM )
                attackers++;
        if ( brd_pieces[37] == PIECES.wM )
            attackers++;
        if ( brd_pieces[38] == PIECES.wM )
            attackers++;	   
        // must be defenders >= attackers
        if ( defenders < attackers )
            eval -= 20; 
                                }
                                                
    if ( brd_pieces[21] == PIECES.wM ){ // brd_pieces[21] safety
        if ( brd_pieces[20] == PIECES.bM )
            eval += 10;
        if ( ( brd_pieces[14] != PIECES.wM ) && ( brd_pieces[6] == PIECES.bM ) && ( brd_pieces[11] == PIECES.bM ))
        eval += 10; // bad for brd_pieces[21]
    if ( ( brd_pieces[22] == PIECES.bM ) && ( brd_pieces[31] != PIECES.EMPTY ) && ( brd_pieces[30] == PIECES.EMPTY ) && ( brd_pieces[26] == PIECES.EMPTY )) 
        eval += 10; // bad for brd_pieces[21]
        attackers = defenders = 0;
        if ( brd_pieces[39] == PIECES.wM )
            defenders++;
        if ( brd_pieces[40] == PIECES.wM )
                defenders++;
        if ( brd_pieces[35] == PIECES.wM )
                defenders++;
        if ( brd_pieces[31] == PIECES.wM )
                defenders++;
        if ( brd_pieces[16] == PIECES.bM )
                attackers++;
        if ( brd_pieces[12] == PIECES.bM )
                attackers++;
        if ( brd_pieces[8] == PIECES.bM )
                attackers++;
        if ( brd_pieces[7] == PIECES.bM )
                attackers++;
        // must be defenders >= attackers
        if ( defenders < attackers )
            eval += 20;
                                                    }                                     
                                                
    // blocked pieces in quadrants
    if ( ( brd_pieces[23] == PIECES.wM ) && ( brd_pieces[14] == PIECES.bM ) && ( brd_pieces[15] == PIECES.bM ) && ( brd_pieces[19] == PIECES.bM)){
    eval -= 40;
                }
    
    if (( brd_pieces[11] == PIECES.bM ) && ( brd_pieces[15] == PIECES.bM ) && ( brd_pieces[16] == PIECES.bM ) && ( brd_pieces[20] == PIECES.bM)){
    if (( brd_pieces[24] == PIECES.wM ) && ( brd_pieces[28] == PIECES.wM ) && ( brd_pieces[25] == PIECES.wM ) && ( brd_pieces[30] == PIECES.wM)){
    eval -= 40;
    if (( brd_pieces[6] == PIECES.bM ) && ( brd_pieces[10] == PIECES.EMPTY ) && ( brd_pieces[14] != PIECES.wM ))
    eval += 10;
    if (( brd_pieces[7] == PIECES.bM ) && ( brd_pieces[12] == PIECES.EMPTY ) && ( brd_pieces[17] != PIECES.wM ))
    eval += 10;
                }
                }
    
    if (( brd_pieces[12] == PIECES.bM ) && ( brd_pieces[16] == PIECES.bM ) && ( brd_pieces[17] == PIECES.bM ) && ( brd_pieces[21] == PIECES.bM)){
    if (( brd_pieces[22] == PIECES.wM ) && ( brd_pieces[26] == PIECES.wM ) && ( brd_pieces[31] == PIECES.wM )){
    eval -= 40;
    if ( brd_pieces[23] == PIECES.bM )
    eval += 5;
    if (( brd_pieces[8] == PIECES.bM ) && ( brd_pieces[13] == PIECES.EMPTY ))
    eval += 5;
            }
            }
    
    if (( brd_pieces[15] == PIECES.bM ) && ( brd_pieces[19] == PIECES.bM ) && ( brd_pieces[20] == PIECES.bM ) && ( brd_pieces[24] == PIECES.bM)){
    eval -= 40;
    if (( brd_pieces[10] == PIECES.bM ) && ( brd_pieces[14] == PIECES.EMPTY ))
    eval += 10;
    if (( brd_pieces[11] == PIECES.bM ) && ( brd_pieces[16] == PIECES.EMPTY ) && ( brd_pieces[21] != PIECES.wM ))
    eval += 10;
                }
    
    if (( brd_pieces[16] == PIECES.bM ) && ( brd_pieces[20] == PIECES.bM ) && ( brd_pieces[21] == PIECES.bM ) && ( brd_pieces[25] == PIECES.bM)){
    eval -= 40;
    if (( brd_pieces[11] == PIECES.bM ) && ( brd_pieces[15] == PIECES.EMPTY ) && ( brd_pieces[19] != PIECES.wM ))
    eval += 10;
    if (( brd_pieces[12] == PIECES.bM ) && ( brd_pieces[17] == PIECES.EMPTY ) && ( brd_pieces[22] != PIECES.wM ))
    eval += 10;
                                        }
        
    if ( ( brd_pieces[34] == PIECES.wM ) && ( brd_pieces[31] == PIECES.wM ) && ( brd_pieces[17] == PIECES.bM ) && ( brd_pieces[21] == PIECES.bM ) && ( brd_pieces[22] == PIECES.bM ) && ( brd_pieces[26] == PIECES.bM)){
    eval -= 40;
                }
    //*********************************** for white color
    if ( ( brd_pieces[22] == PIECES.bM ) && ( brd_pieces[30] == PIECES.wM ) && ( brd_pieces[31] == PIECES.wM ) && (brd_pieces[26] == PIECES.wM)){
    eval += 40;
                        }
                        
    if (( brd_pieces[33] == PIECES.wM ) && ( brd_pieces[28] == PIECES.wM ) && ( brd_pieces[29] == PIECES.wM ) && (brd_pieces[24] == PIECES.wM)){
    if (( brd_pieces[23] == PIECES.bM ) && ( brd_pieces[19] == PIECES.bM ) && ( brd_pieces[14] == PIECES.bM )){
    eval += 40;
    if ( brd_pieces[22] == PIECES.wM )
    eval -= 5;
    if (( brd_pieces[37] == PIECES.wM ) && ( brd_pieces[32] == PIECES.EMPTY ))
    eval -= 5;
                    }
                }
    
    if (( brd_pieces[34] == PIECES.wM ) && ( brd_pieces[29] == PIECES.wM ) && ( brd_pieces[30] == PIECES.wM ) && (brd_pieces[25] == PIECES.wM)){
    if (( brd_pieces[15] == PIECES.bM ) && ( brd_pieces[20] == PIECES.bM ) && ( brd_pieces[21] == PIECES.bM ) && ( brd_pieces[17] == PIECES.bM)){
    eval += 40;
    if (( brd_pieces[38] == PIECES.wM ) && ( brd_pieces[33] == PIECES.EMPTY ) && ( brd_pieces[28] != PIECES.bM  ))
    eval -= 10;
    if (( brd_pieces[39] == PIECES.wM ) && ( brd_pieces[35] == PIECES.EMPTY ) && ( brd_pieces[31] != PIECES.bM  ))
    eval -= 10;
                    }
                    }
    if ( ( brd_pieces[11] == PIECES.bM ) && ( brd_pieces[14] == PIECES.bM ) && ( brd_pieces[28] == PIECES.wM ) && ( brd_pieces[23] == PIECES.wM ) && ( brd_pieces[24] == PIECES.wM ) && (brd_pieces[19] == PIECES.wM)){
    eval += 40;
            }
    
    if (( brd_pieces[29] == PIECES.wM ) && ( brd_pieces[24] == PIECES.wM ) && ( brd_pieces[25] == PIECES.wM ) && (brd_pieces[20] == PIECES.wM)){
    eval += 40;
    if (( brd_pieces[33] == PIECES.wM ) && ( brd_pieces[28] == PIECES.EMPTY ) && ( brd_pieces[23] != PIECES.bM  ))
    eval -= 10;
    if (( brd_pieces[34] == PIECES.wM ) && ( brd_pieces[30] == PIECES.EMPTY ) && ( brd_pieces[26] != PIECES.bM  ))
    eval -= 10;
                                }   
    if (( brd_pieces[30] == PIECES.wM ) && ( brd_pieces[25] == PIECES.wM ) && ( brd_pieces[26] == PIECES.wM ) && (brd_pieces[21] == PIECES.wM)){
    eval += 40;
    if (( brd_pieces[34] == PIECES.wM ) && ( brd_pieces[29] == PIECES.EMPTY ) && ( brd_pieces[24] != PIECES.bM  ))
    eval -= 10;
    if (( brd_pieces[35] == PIECES.wM ) && ( brd_pieces[31] == PIECES.EMPTY ))
    eval -= 10;
                            }
            
        // phase mix
        // smooth transition between game phases
        eval += ((opening * phase + endgame * antiphase )/24);
        eval &= ~(GrainSize - 1);
    // negamax formulation requires this:
    eval = ( color == BLACK ) ? eval : -eval;
    EvalHash[(HASH_KEY & EC_MASK)] = (HASH_KEY & 0xffffffffffff0000) | ( eval & 0xffff);
    return eval;
}
