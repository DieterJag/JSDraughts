function AddGUIPiece(sq,pce) {	
	var rank = RanksBrd[sq];
	var file = FilesBrd[sq];
	var rankName = "rank" + (rank + 1);	
	var fileName = "file" + (file + 1);	
	pieceFileName = "image/" + SideChar[PieceCol[pce]] + PceChar[pce].toLowerCase() + ".png";
	imageString = "<image src=\"" + pieceFileName + "\" class=\"Piece clickElement " + rankName + " " + fileName + "\"/>";
	console.log("add on " + imageString);
	$("#Board").append(imageString);
}
