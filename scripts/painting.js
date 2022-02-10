/* --------------------------------------------------------------------------------------------------------------------- */
//|                                DISINI BUAT DRAWING MODE KAYAK FUNGSI2 ONCLICK, DLL                                    //
//|                                                                                                                       //
/* --------------------------------------------------------------------------------------------------------------------- */

// initialize shapes array. This array will hold all of our different shapes that we will draw in canvas
var shapes = [];

// initialize mouse coordinates
var mouseX = 0;
var mouseY = 0;

// current state
var current = {
  shape: Line,
  color: new Color(0, 0, 0),
  focus: -1, // index of shape that is currently being drawn
  dragging: false, // true if mouse is down
  origin_x: 0,
  origin_y: 0,
  polygon_coordinates: [],
};

console.log(current);

// function redrawCanvas() -> void
// Draws all of the shapes in the shapes array
function redrawCanvas() {
  // clear the canvas
  // gl.clearColor(0.95, 0.95, 0.95, 1);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // draw all of the shapes
  for (let shape of shapes) {
    console.log(shape);
    shape.draw();
  }
}

// init redrawCanvas at the first time
redrawCanvas();

// set the 'current' variable
setShape(document.getElementById("shape").value);
current.color = hexToColor(document.getElementById("color").value);

// looking for a mousedown
canvas.addEventListener("mousedown", function (e) {
  // console.log("down");
  current.dragging = true;
  recordMouse(e);
  current.origin_x = mouseX;
  current.origin_y = mouseY;
});

// looking for a mouseup
canvas.addEventListener("mouseup", function (e) {
  console.log("up");
  current.dragging = false;
  //checking if current.shape is polygon or not
  if (current.shape != Polygon) {
    shapes.push(
      new current.shape(
        current.origin_x,
        current.origin_y,
        mouseX,
        mouseY,
        current.color,
        false
      )
    );
    console.log(shapes);
  } else {
    //curr.shape == Polygon
    current.polygon_coordinates.push([]);
    shapes.push(
      new Polygon(
        current.origin_x,
        current.origin_y,
        mouseX,
        mouseY,
        current.color,
        current.polygon_coordinates.concat([mouseX, mouseY])
      )
    );
  }
  redrawCanvas();
  current.focus = shapes.length - 1;
});

// looking for a mousemove
canvas.addEventListener("mousemove", function (e) {
  if (current.dragging) {
    // record mouse position
    recordMouse(e);
    console.log(mouseX, mouseY);
    redrawCanvas();
    //checking if current.shape is polygon or not
    if (current.shape != Polygon) {
      new current.shape(
        current.origin_x,
        current.origin_y,
        mouseX,
        mouseY,
        current.color
      ).draw();
    } else {
      //curr.shape == Polygon
      new Polygon(
        current.origin_x,
        current.origin_y,
        mouseX,
        mouseY,
        current.color,
        current.polygon_coordinates.concat([mouseX, mouseY])
      ).draw();
    }
  }
});
