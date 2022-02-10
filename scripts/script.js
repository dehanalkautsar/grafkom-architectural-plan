// console.log("Hello World");
"use strict";

function main() {
  // Get A WebGL context
  /** @type {HTMLCanvasElement} */
  var canvas = document.getElementById("canvas");
  var gl = canvas.getContext("webgl", { preserveDrawingBuffer: true });
  if (!gl) {
    console.log("Failed to get the rendering context for WebGL");
    return;
  }

  //if WebGL cant load the context
  if (!gl) {
    console.log(
      "WebGl not supported on this browser, trying to fall back on experimental WebGL"
    );
  }
  if (!gl) {
    console.log("your browser does not support WebGL");
  }

  //set up GLSL program
  var program = webglUtils.createProgramFromScripts(gl, [
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

  // look up where the vertex data needs to go.
  var positionLocation = gl.getAttribLocation(program, "a_position");
  // look up uniform locations
  var colorLocation = gl.getAttribLocation(program, "vertColor"); //it should be uniform but, hey somehow it is work?!?! x_x

  // Create a buffer to put positions in
  var positionBuffer = gl.createBuffer();
  // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  // put geometry data into buffer
  // setGeometry(gl);

  // create a buffer to put colors in
  var colorBuffer = gl.createBuffer();
  // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = colorBuffer)
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  // set the colors
  // setColors(gl);

  drawScene();

  function drawScene() {
    webglUtils.resizeCanvasToDisplaySize(gl.canvas);
    // tell WebGL how to convert from clip space to pixels
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    // Clear the canvas
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    // Tell it to use our program (pair of shaders)
    gl.useProgram(program);
    // Turn on the vertex attributes
    gl.enableVertexAttribArray(positionLocation);

    // Bind the position buffer.
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
    var size = 2; // 2 components per iteration (x, y)
    var type = gl.FLOAT; //types of element
    var normalize = gl.FALSE; // dont normalize the data
    var stride = 5 * Float32Array.BYTES_PER_ELEMENT; // Size of an individual vertex
    var offset = 0; // Offset from the beginning of a single vertex to this attribute
    gl.vertexAttribPointer(
      positionLocation,
      size,
      type,
      normalize,
      stride,
      offset
    );

    // Turn on the colors attribute
    gl.enableVertexAttribArray(colorLocation);
    // Bind the color buffer.
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    // Tell the color attribute how to get data out of colorBuffer (ARRAY_BUFFER)
    var size = 3; // 2 components per iteration (r, g, b)
    var type = gl.FLOAT; //types of element
    var normalize = gl.FALSE; // dont normalize the data
    var stride = 5 * Float32Array.BYTES_PER_ELEMENT; // Size of an individual vertex
    var offset = 2 * Float32Array.BYTES_PER_ELEMENT; // Offset from the beginning of a single vertex to this attribute
    gl.vertexAttribPointer(
      colorLocation,
      size,
      type,
      normalize,
      stride,
      offset
    );
  }
}

main();

/* --------------------------------------------------------------------------------------------------------------------- */
//|                                DISINI BUAT DRAWING MODE KAYAK FUNGSI2 ONCLICK, DLL                                    //
//|                                                                                                                       //
/* --------------------------------------------------------------------------------------------------------------------- */
