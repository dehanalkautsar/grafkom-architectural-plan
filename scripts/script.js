// console.log("Hello World");
// "use strict";

// get canvas from html
var canvas = document.getElementById("canvas");
var gl = canvas.getContext("webgl", { preserveDrawingBuffer: true });
if (!gl) {
  console.log("Failed to get the rendering context for WebGL");
}

//if WebGL cant load the context
if (!gl) {
  console.log(
    "WebGl not supported on this browser, trying to fall back on experimental WebGL"
  );
  gl = canvas.getContext("experimental-webgl");
}
if (!gl) {
  alert("your browser does not support WebGL");
}

var program;

function initWebGL() {
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(0.95, 0.95, 0.95, 1);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  //set up GLSL program
  program = webglUtils.createProgramFromScripts(gl, [
    "vertex-shader-2d",
    "fragment-shader-2d",
  ]);

  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error("ERROR linking program!", gl.getProgramInfoLog(program));
    return;
  }

  gl.validateProgram(program);
  if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
    console.error("ERROR validating program!", gl.getProgramInfoLog(program));
    return;
  } else {
    console.log("all good until validating program");
  }
}

initWebGL();

//create buffer
var vertexBufferObject = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferObject);

//get attribute location
var positionAttribLocation = gl.getAttribLocation(program, "vertPosition");
var colorAttribLocation = gl.getAttribLocation(program, "vertColor");

//tell WebGL how to read the buffer
gl.vertexAttribPointer(
  positionAttribLocation, //location
  2, //size
  gl.FLOAT, //type
  gl.FALSE, //normalize
  5 * Float32Array.BYTES_PER_ELEMENT, //stride
  0 //offset
);

gl.vertexAttribPointer(
  colorAttribLocation,
  3,
  gl.FLOAT,
  gl.FALSE,
  5 * Float32Array.BYTES_PER_ELEMENT,
  2 * Float32Array.BYTES_PER_ELEMENT
);

gl.enableVertexAttribArray(positionAttribLocation);
gl.enableVertexAttribArray(colorAttribLocation);

gl.useProgram(program);
