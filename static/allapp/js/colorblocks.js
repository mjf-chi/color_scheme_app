function colorBlockSizing(){
    if(document.getElementsByClassName('colorSchemeBlock').length > 0){
	var schemeblocks = document.getElementsByClassName('colorSchemeBlock');

	var elwidth = schemeblocks[0].offsetWidth;

	for(var i=0; i<schemeblocks.length; i++){
	    childrennodes = schemeblocks[i].getElementsByClassName('colorBlock');
	    for(var j=0; j<childrennodes.length; j++){
		nodewidth = elwidth/childrennodes.length;
		childrennodes[j].style.width = nodewidth + 'px';
	    }
	}
    }
}
