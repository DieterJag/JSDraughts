function PrMove(move, captures = undefined) {

	let MvStr;
	
	let ff = FilesBrd[FROMSQ(move)];
	let rf = RanksBrd[FROMSQ(move)];
	let ft = FilesBrd[TOSQ(move)];
	let rt = RanksBrd[TOSQ(move)];
	
	MvStr = String.fromCharCode('a'.charCodeAt() + ff) + String.fromCharCode('1'.charCodeAt() + rf) + 
				String.fromCharCode('a'.charCodeAt() + ft) + String.fromCharCode('1'.charCodeAt() + rt)
				
    let capture = CAPTURED(move);
    if (capture) {
        MvStr += " captured: ";
        let cap_bit = 1;
        let bit = 1;
        for(let i = 0; i < BRD_CAPTURE_SQ_NUM; i++) {
            if (captures & bit) {
                // let index = brd_capture_to_pieces[i];
                if (kings & cap_bit) MvStr += "K";
                cap_bit <<= 1;
            }
            bit <<= 1;
        }
    }  
                
	return MvStr;
}
