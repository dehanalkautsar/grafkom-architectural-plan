/* --------------------------------------------------------------------------------------------------------------------- */
//|                                DISINI BUAT DRAWING MODE KAYAK FUNGSI2 ONCLICK, DLL                                    //
//|                                                                                                                       //
/* --------------------------------------------------------------------------------------------------------------------- */
var gl = canvas.getContext("webgl", { preserveDrawingBuffer: true });
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
  polygon_mode: false,
  polygon_coordinates: [],
  temp_vert: [],
};

// function redrawCanvas() -> void
// Draws all of the shapes in the shapes array
function redrawCanvas() {
  // clear the canvas
  gl.clearColor(0.95, 0.95, 0.95, 1);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // draw all of the shapes
  for (let shape of shapes) {
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
  current.color = hexToColor(document.getElementById("color").value);
  current.dragging = true;
  recordMouse(e);
  if (current.shape != Polygon || current.polygon_mode == false) {
    current.origin_x = mouseX;
    current.origin_y = mouseY;
  }
  // check if polygon_mode is inactive before
  if (!current.polygon_mode) {
    // check if shape == polygon
    if (current.shape == Polygon) {
      current.polygon_mode = true;
      current.polygon_coordinates = current.polygon_coordinates.concat([
        current.origin_x,
        current.origin_y,
      ]);
      current.temp_vert = [mouseX, mouseY];
    }
  } else {
    // if polygon_mode is active
    // check if shape == polygon
    if (current.shape == Polygon) {
      redrawCanvas();
      new Line(
        current.temp_vert[0],
        current.temp_vert[1],
        mouseX,
        mouseY,
        current.color
      ).draw();
    }
  }
});

// looking for a mouseup
canvas.addEventListener("mouseup", function (e) {
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
  } else {
    //curr.shape == Polygon
    current.polygon_mode = false;
    // check if mouse is close to origin x & y
    console.log(current.origin_x, current.origin_y);
    if (
      mouseX < current.origin_x + 0.1 &&
      mouseX > current.origin_x - 0.1 &&
      mouseY < current.origin_y + 0.1 &&
      mouseY > current.origin_y - 0.1
    ) {
      console.log(current.polygon_coordinates);
      // delete line according to polygon_coordinates
      console.log(current.polygon_coordinates);
      for (let i = 0; i < (current.polygon_coordinates.length - 2) / 2; i++) {
        shapes.pop();
        console.log("pop");
      }
      // add polygon to shapes
      shapes.push(
        new Polygon(
          current.origin_x,
          current.origin_y,
          mouseX,
          mouseY,
          current.color,
          current.polygon_coordinates
        )
      );
      // clean up polygon_coordinates
      current.polygon_coordinates = [];
    } else {
      current.polygon_mode = true;
      current.polygon_coordinates = current.polygon_coordinates.concat([
        mouseX,
        mouseY,
      ]);

      //push line (buat nampilin sementara)
      shapes.push(
        new Line(
          current.temp_vert[0],
          current.temp_vert[1],
          mouseX,
          mouseY,
          current.color,
          false
        )
      );
      console.log(current.temp_vert[0], current.temp_vert[1], mouseX, mouseY);
      current.temp_vert = [mouseX, mouseY];
    }
  }

  console.log(shapes.length);
  redrawCanvas();
  current.focus = shapes.length - 1;
});

// looking for a mousemove
canvas.addEventListener("mousemove", function (e) {
  if (current.dragging) {
    // record mouse position
    recordMouse(e);
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
      if (current.polygon_mode) {
        new Line(
          current.temp_vert[0],
          current.temp_vert[1],
          mouseX,
          mouseY,
          current.color
        ).draw();
      }

      // new Polygon(
      //   current.origin_x,
      //   current.origin_y,
      //   mouseX,
      //   mouseY,
      //   current.color,
      //   current.polygon_coordinates.concat([mouseX, mouseY])
      // ).draw();
    }
  }
});

document.getElementById("shape").addEventListener("click", function (e) {
  shape = document.getElementById("shape").value;
  setShape(shape);
});
// Pop last shape
document.getElementById("delLast").addEventListener("click", function (e) {
  shapes.pop();
  current.focus = shapes.length - 1;
  current.draw_mode = false;
  redrawCanvas();
});
