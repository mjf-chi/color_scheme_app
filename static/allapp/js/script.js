var webgl1=function(){
    var CANVAS=document.getElementById('canvas');

    CANVAS.width=window.innerWidth;
    CANVAS.height=window.innerHeight;

    var GL;
    try{
        GL = CANVAS.getContext("experimental-webgl", {antialias: true});
    } catch(e){
	alert("Your are not webgl compatible :(") ;
	return false;
    }

    console.log(GL.VERTEX_SHADER);

/*===============================SHADER STUFF====================*/

    var shader_vertex_source="attribute vec3 position; uniform mat4 Pmatrix; uniform mat4 Mmatrix; uniform mat4 Vmatrix; attribute vec3 color; varying vec3 vColor; void main(void) {gl_Position = Pmatrix*Vmatrix*Mmatrix*vec4(position, 1.); vColor=color;}";

    var shader_fragment_source="precision mediump float; varying vec3 vColor; void main(void){gl_FragColor = vec4(vColor, 1.);}";

    var get_shader=function(source, type, typeString){
	var shader = GL.createShader(type);
	GL.shaderSource(shader, source);
	GL.compileShader(shader);
	if (!GL.getShaderParameter(shader, GL.COMPILE_STATUS)){
	    alert("ERROR IN "+typeString+ " SHADER : " + GL.getShaderInfoLog(shader));
	    return false;
	}
	return shader;
    };

    var shader_vertex=get_shader(shader_vertex_source, GL.VERTEX_SHADER, "VERTEX");
    var shader_fragment=get_shader(shader_fragment_source, GL.FRAGMENT_SHADER, "FRAGMENT");       
 
    var SHADER_PROGRAM=GL.createProgram();
    GL.attachShader(SHADER_PROGRAM, shader_vertex);
    GL.attachShader(SHADER_PROGRAM, shader_fragment);

    GL.linkProgram(SHADER_PROGRAM);

    var _Pmatrix = GL.getUniformLocation(SHADER_PROGRAM, "Pmatrix");
    var _Mmatrix = GL.getUniformLocation(SHADER_PROGRAM, "Mmatrix");
    var _Vmatrix = GL.getUniformLocation(SHADER_PROGRAM, "Vmatrix");
    var _color = GL.getAttribLocation(SHADER_PROGRAM, "color");
    var _position = GL.getAttribLocation(SHADER_PROGRAM, "position");

    GL.enableVertexAttribArray(_color);
    GL.enableVertexAttribArray(_position);

    GL.useProgram(SHADER_PROGRAM);

/*
    var refresh_fragmentShader=function(){
	console.log("REFRESHING SHADER");
	var shader_fragment = GL.createShader(GL.FRAGMENT_SHADER);
	GL.shaderSource(shader_fragment, shader_fragment_source);
	GL.compileShader(shader_fragment);
	if(GL.getShaderParameter(shader_fragment, GL.COMPILE_STATUS)){
	    SHADER_PROGRAM=GL.createProgram();

	    console.log("SHADER_PROGRAM SUCCESSFUL")
	    GL.attachShader(SHADER_PROGRAM, shader_vertex);
	    GL.attachShader(SHADER_PROGRAM, shader_fragment);

	    GL.linkProgram(SHADER_PROGRAM);

	    _color = GL.getAttribLocation(SHADER_PROGRAM, "color");
	    _position = GL.getAttribLocation(SHADER_PROGRAM, "position");

	    GL.enableVertexAttribArray(_color);
	    GL.enableVertexAttribArray(_position);

	    GL.useProgram(SHADER_PROGRAM);
	}
    };

    refresh_fragmentShader();
*/
/*================TRIANGLE STUFF=================*/

    var cube_vertex=[
	-1,-1,-1,
	0,0,0,
	1,-1,-1,
	1,0,0,
	1,1,-1,
	1,1,0,
	-1,1,-1,
	0,1,0,
	-1,-1,1,
	0,0,1,
	1,-1,1,
	1,0,1,
	1,1,1,
	1,1,1,
	-1,1,1,
	0,1,1
    ];

    var CUBE_VERTEX = GL.createBuffer ();
    GL.bindBuffer(GL.ARRAY_BUFFER, CUBE_VERTEX);
    GL.bufferData(GL.ARRAY_BUFFER,
    	new Float32Array(cube_vertex),
    	GL.STATIC_DRAW);

    var cube_faces = [
	0,1,2,
	0,2,3,

	4,5,6,
	4,6,7,

	0,3,7,
	0,4,7,
	
	1,2,6,
	1,5,6,

	2,3,6,
	3,7,6,

	0,1,5,
	0,4,5
	];
    var CUBE_FACES = GL.createBuffer ();
    GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, CUBE_FACES);
    GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, 
    	new Uint16Array(cube_faces),
    	GL.STATIC_DRAW);

    var PROJMATRIX=LIBS.get_projection(40, CANVAS.width/CANVAS.height, 1, 100);
    var MOVEMATRIX=LIBS.get_I4();
    var VIEWMATRIX=LIBS.get_I4();

    LIBS.translateZ(VIEWMATRIX, -5);

    GL.clearColor(0.0, 0.0, 0.0, 0.0);

    GL.enable(GL.DEPTH_TEST);
    GL.depthFunc(GL.LEQUAL);

    GL.clearDepth(1.0);
    var time_old=0;

    var updatingtime=0;

    var moveX = 0;
    var moveY = 0;

    var animate=function(time){
	var dAngle=0.001*(time-time_old);
//	LIBS.rotateZ(MOVEMATRIX, dAngle);
	LIBS.rotateY(MOVEMATRIX, dAngle);
//	LIBS.rotateX(MOVEMATRIX, dAngle);
	time_old=time;

	GL.viewport(0.0, 0.0, CANVAS.width, CANVAS.height);
	GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);
	
	GL.uniformMatrix4fv(_Pmatrix, false, PROJMATRIX);
	GL.uniformMatrix4fv(_Mmatrix, false, MOVEMATRIX); 
	GL.uniformMatrix4fv(_Vmatrix, false, VIEWMATRIX);

	GL.bindBuffer(GL.ARRAY_BUFFER, CUBE_VERTEX);

	GL.vertexAttribPointer(_position, 3, GL.FLOAT, false,4*(3+3), 0);
	GL.vertexAttribPointer(_color, 3, GL.FLOAT, false, 4*(3+3),3*4);

	GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, CUBE_FACES);
	GL.drawElements(GL.TRIANGLES, 6*2*3, GL.UNSIGNED_SHORT, 0);

	GL.flush();

	window.requestAnimationFrame(animate);
    };

    animate(0);
};
