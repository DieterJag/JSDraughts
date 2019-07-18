function ThreeFoldRep() {
	var i = 0, r = 0;
	for (i = 0; i < brd_hisPly; ++i)	{
	    if (brd_history[i].posKey == brd_posKey) {
		    r++;
		}
	}
	return r;
}
