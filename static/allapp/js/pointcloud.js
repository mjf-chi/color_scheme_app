var webgl2=function(colorset, rgb, curveset){
    var CANVAS=document.getElementById('canvas');

    CANVAS.width=window.innerWidth-50;
    CANVAS.height=window.innerHeight;

    var GL;
    try{
        GL = CANVAS.getContext("experimental-webgl", {antialias: true});
    } catch(e){
	alert("Your are not webgl compatible :(") ;
	return false;
    }

    colorArray = new Array();

    //console.log(colorset);
    //console.log(rgb);
    console.log(curveset);

    for(var j=0;j<rgb.length;j++){
	var nDiv = document.createElement('div');
	nDiv.id = 'color' + j;
	nDiv.className = 'rcolorBlock';
	var rval = rgb[j].fields.red;
	var gval = rgb[j].fields.green;
	var bval = rgb[j].fields.blue;

 	var bheight = (CANVAS.height/rgb.length) + 'px';

	nDiv.style.backgroundColor = 'rgb(' + [rval, gval, bval].join(',') + ')';
	nDiv.style.height = bheight;

	document.getElementById('rightcolorline').appendChild(nDiv);
    }

    var positionarray = new Array();

    for(var c=0;c<curveset.length;c++){
	var xpos = curveset[c].x;
	var ypos = curveset[c].y;
	var zpos = curveset[c].z;

	positionarray.push(new curvePoint(c, xpos, ypos, zpos));
    }

    for(var i=0;i<colorset.length;i++){
	colorArray.push(new createColor(i, colorset[i].hue, colorset[i].saturation, colorset[i].value));
    }

//    colorArray = sortByHue(colorArray);
    colorArray.sort(function(a,b){return a.hue-b.hue}); 
    console.log(colorArray);
//    console.log("colorArray length: " + colorArray.length);
/*===============================SHADER STUFF====================*/
    var vertices = [
	-1, -1, -1,
	1, -1, -1,

	-1,-1, -1,
	-1, -1, 1,

	-1, -1, -1,
	-1, 1, -1,

	-1, 1, -1, 
	-1, 1, 1,

	-1, 1, -1,
	1, 1, -1,

	1, -1, -1,
	1, 1, -1,

	-1, -1, 1,
	1, -1, 1,

	-1, 1, 1,
	1, 1, 1,

	-1, -1, 1,
	-1, 1, 1,

	1, -1, -1,
	1, -1, 1,

	1, 1, -1,
	1, 1, 1,

	1, -1, 1,
	1, 1, 1
    ]

    var numPoints = 24;

    if(colorArray.length > 0){

//    var newcolorset = splineCurve(colorArray);
    var newcolorset = curveset;

//    var slopeset = calcDerivCurve(colorArray);

    console.log("SLOPESET");
	
//    for(var i = 0; i<slopeset.length; i++){
//	console.log("t: " + slopeset[i].id + " | xslope: " + slopeset[i].hue + " | yslope: " + slopeset[i].saturation + " | zslope: " + slopeset[i].brightness);
//    }

    var lineindicies = new Array();
    var firstlineind = new Array();

    for(var i=0;i<colorArray.length;i++){
	var next = i+1;
	if(next < colorArray.length){
	    firstlineind.push(i);
	    firstlineind.push(next);
	}
    }

    for(var i=0;i<firstlineind.length;i++){
	var index = firstlineind[i];
	//console.log('index = '+index);
	var hue = (colorArray[index].hue)/180;
	var saturation = colorArray[firstlineind[i]].saturation*2;
	var brightness = colorArray[firstlineind[i]].brightness*2;

	hue -= 1;
	saturation -= 1;
	brightness -= 1;

//	vertices.push(hue);
//	vertices.push(brightness);
//	vertices.push(saturation);

	if(i==0 || i==firstlineind.length-1){
//	    console.log("first or last hue from color: " + hue);
	}
//	numPoints++;
    }

    for(var i=0;i<newcolorset.length;i++){
	var next = i+1;
	if(next < newcolorset.length){
	    lineindicies.push(i);
	    lineindicies.push(next);
	}
    }

    for(var i=0;i<lineindicies.length;i++){
        var hue = newcolorset[lineindicies[i]].x/180;
	var saturation = newcolorset[lineindicies[i]].y*2;
	var brightness = newcolorset[lineindicies[i]].z*2;

	hue -= 1;
//	console.log('hue: ' + hue);
	saturation -= 1;
//	console.log('saturation: ' + saturation);
	brightness -= 1;
//	console.log('brightness: ' + brightness);

	vertices.push(hue);
	vertices.push(brightness);
	vertices.push(saturation);

	if(i == 0 || i == lineindicies.length-1){
//	    console.log("first or last hue from curve: " + hue);
	}

	numPoints++;
    }
    }
    else{
    vertices = [
    	-0.9,0.5,-0.9,
	0.9,0.5,0.9,
	-0.25,0.0,0.0,
	0.0, 0.0, 0.0,
	0.6, 0.7, 0.0,
	0.5, -0.4, 0.0,
	];
    }

    var vertex_buffer = GL.createBuffer();

    GL.bindBuffer(GL.ARRAY_BUFFER, vertex_buffer);
    GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(vertices), GL.STATIC_DRAW);

    GL.bindBuffer(GL.ARRAY_BUFFER, null);

    var vertCode = 
	'attribute vec3 coordinates;'+
	'uniform mat4 Pmatrix;'+
	'uniform mat4 Vmatrix;'+
	'uniform mat4 Mmatrix;'+
	'void main(void){'+
	    ' gl_Position = Pmatrix*Vmatrix*Mmatrix*vec4(coordinates, 1.0);'+
	    'gl_PointSize = 10.0;}';

    var vertShader = GL.createShader(GL.VERTEX_SHADER);

    GL.shaderSource(vertShader, vertCode);
    GL.compileShader(vertShader);

    var fragCode = 'void main(void){'+
	' gl_FragColor = vec4(0.0, 0.0, 0.0, 0.1);'+
    '}';

    var fragShader = GL.createShader(GL.FRAGMENT_SHADER);

    GL.shaderSource(fragShader, fragCode);
    GL.compileShader(fragShader);

    var SHADER_PROGRAM = GL.createProgram();

    GL.attachShader(SHADER_PROGRAM, vertShader);
    GL.attachShader(SHADER_PROGRAM, fragShader);

    GL.linkProgram(SHADER_PROGRAM);

    var _Pmatrix = GL.getUniformLocation(SHADER_PROGRAM, "Pmatrix");
    var _Vmatrix = GL.getUniformLocation(SHADER_PROGRAM, "Vmatrix");
    var _Mmatrix = GL.getUniformLocation(SHADER_PROGRAM, "Mmatrix");
    GL.useProgram(SHADER_PROGRAM);

    GL.bindBuffer(GL.ARRAY_BUFFER, vertex_buffer);
 
    var coord = GL.getAttribLocation(SHADER_PROGRAM, "coordinates");
    
    GL.vertexAttribPointer(coord, 3, GL.FLOAT, false, 0, 0);

    GL.enableVertexAttribArray(coord);

    var PROJMATRIX = LIBS.get_projection(40, CANVAS.width/CANVAS.height, 1, 100);
    var MOVEMATRIX=LIBS.get_I4();
    var VIEWMATRIX=LIBS.get_I4();

    LIBS.translateZ(VIEWMATRIX, -4);

    GL.enable(GL.DEPTH_TEST);
    GL.depthFunc(GL.LEQUAL);

    GL.clearColor(0.5, 0.5, 0.5, 0.9);
    GL.clearDepth(1.0);
//    GL.enable(GL.DEPTH_TEST);
//    GL.depthFunc(GL.LEQUAL);

    var time_old=0;
    var animate=function(time){
	var dt=time-time_old;
 	LIBS.rotateY(MOVEMATRIX, dt*0.0001);
	time_old=time;

        GL.clear(GL.COLOR_BUFFER_BIT);
        GL.viewport(0,0,CANVAS.width,CANVAS.height);

 	GL.uniformMatrix4fv(_Pmatrix, false, PROJMATRIX);
	GL.uniformMatrix4fv(_Vmatrix, false, VIEWMATRIX);
	GL.uniformMatrix4fv(_Mmatrix, false, MOVEMATRIX);

        GL.drawArrays(GL.LINES,0,numPoints);

	GL.flush();

	window.requestAnimationFrame(animate);
    };

    animate(0);
};

var increaseRate = 0.020;

/*
function splineCurve(points){
    var curveColors = new Array();    

//    console.log("Points length: " + points.length);
//    console.log("First hue: " + points[0].hue);

    var t = 0.000;
    var fixed = 0.000;

    while(fixed <= 1.000){
//	console.log("T: " + t);

	var newhue = 0;
	var newsat = 0;
	var newbrt = 0;

	var n = points.length-1;

	for(var i = 0; i<=n; i++){

	    for(var c = 0;c<3; c++){
		var nfac = factorial(n);
		var ifac = factorial(i);
		var nifac = (n-i);
		nifac = factorial(nifac);
		var bio = nfac/(ifac*nifac);
		switch(c){
		    case 0:
		  	newhue += bio*(Math.pow((1-t),(n-i))*Math.pow(t,i))*points[i].hue;
			break;
		    case 1:
			newsat += bio*(Math.pow((1-t),(n-i))*Math.pow(t,i))*points[i].saturation;
			break;
		    case 2:
			newbrt += bio*(Math.pow((1-t),(n-i))*Math.pow(t,i))*points[i].brightness;
			break;
		}
	    }
	}

	curveColors.push(new createColor(t, newhue, newsat, newbrt));	
	console.log('y: ' + newsat + ', x: ' + newhue + ', z: ' + newbrt + ', time: ' + t);

	t += increaseRate;
	fixed = t.toFixed(3);
    }

    return curveColors;
}
*/

function calcDerivCurve(points){
    var derivValues = new Array();

    var t = 0.000;
    var fixed = 0.000;

    while(fixed < 1.000){
	var slopex = 0.000;
	var slopey = 0.000;
	var slopez = 0.000;

	var n = points.length-1;
	
	for(var i = 0; i<n; i++){
	    for(var c = 0; c<3; c++){
		var nfac = factorial(n);
		var ifac = factorial(i);
		var nifac = (n-i);
		nifac = factorial(nifac);
		var bio = nfac/(ifac*nifac);
		switch(c){
		    case 0:
			slopex += bio*(Math.pow(t,i)*(Math.pow((1-t),(n-i)))*(n*(points[i+1].hue-points[i].hue)));
			break;
		    case 1:
			slopey += bio*(Math.pow(t,i)*(Math.pow((1-t),(n-i)))*(n*(points[i+1].saturation-points[i].saturation)));
			break;
		    case 2:
			slopez += bio*(Math.pow(t,i)*(Math.pow((1-t),(n-i)))*(n*(points[i+1].brightness-points[i].brightness)));
			break;
		}
	    }
	}

	derivValues.push(new createColor(t, slopex, slopey, slopez));

	t += increaseRate;
	fixed = t.toFixed(3);
    }	    

    return derivValues;
}

function mapCoords(h, s, v){
    var x = h/360;
    var y = b * 2;
    var z = s * 2;
}

function curvePoint(id, x, y, z){
    this.x = x;
    this.y = y;
    this.z = z;
    this.id = id;
}

function createColor(id,h,s,v){	
    this.hue = h;
    this.saturation = s;
    this.brightness = v;
    this.id = id;
}

function sortByHue(colors){
    var sorted = new Array();

    var lowest = 1000.00;

    for(var j=0;j<colors.length;j++){
        for(var i=0;i<colors.length;i++){
	    if(colors[i].hue < lowest){
	        lowest = colors[i].hue;
	    }
         }	

        for(var i=0;i<colors.length;i++){
	    if(colors[i].hue == lowest){
		sorted.push(colors[i]);
		colors.splice(i, 1);
		break;
	    }
	}
	
	lowest = 1000.00;
    }

    console.log("SORTED: " + sorted);
    return sorted;
}


function factorial(num){
    if(num < 0){
	return -1;
    }
    else if(num == 0){
	return 1;
    }
    
    var tmp = num;

    while(num -- > 2){
	tmp *= num;
    }

    return tmp;
}
