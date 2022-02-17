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

// idx_shape is a var that contains the index of the shape that is currently selected (that will be edited)
var idx_shape = -1;

// current state
var current = {
  shape: Line,
  color: new Color(0, 0, 0),
  focus: -1, // index of shape that is currently being drawn
  dragging: false, // true if mouse is down
  origin_x: 0,
  origin_y: 0,
  polygon_mode: false, // true if polygon mode is on. Polygon mode is a special mode that allows the user to draw a polygon
  polygon_coordinates: [], // array of points that make up the polygon
  temp_vert: [],
  mode: "Draw", // draw, select
  change_vertex: 0, //the vertex that we want to transform
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
setMode(document.getElementById("mode").value);
current.color = hexToColor(document.getElementById("color").value);

// looking for a mousedown
// this function will be called when the mouse is pressed down and mode is draw
canvas.addEventListener("mousedown", function (e) {
  if (current.mode == "Draw") {
    // get color from the color picker
    current.color = hexToColor(document.getElementById("color").value);
    // set dragging to true
    current.dragging = true;
    // record mouse coordinates
    recordMouse(e);
    // if shape is not polygon, then just create a new shape
    if (current.shape != Polygon || current.polygon_mode == false) {
      current.origin_x = mouseX;
      current.origin_y = mouseY;
    }
    //
    // but if we want to draw a polygon, then we need to create a new polygon
    //
    // check if polygon_mode is inactive before
    if (!current.polygon_mode) {
      // check if shape == polygon
      if (current.shape == Polygon) {
        current.polygon_mode = true;
        // concat first coordinate to polygon_coordinates
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
        // draw a line to make a polygon easier to see by user
        new Line(
          current.temp_vert[0],
          current.temp_vert[1],
          mouseX,
          mouseY,
          current.color
        ).draw();
      }
    }
  }
});

// looking for a mouseup\
// this function will be called when the mouse is released and mode is draw
canvas.addEventListener("mouseup", function (e) {
  if (current.mode == "Draw") {
    // set dragging to false
    current.dragging = false;
    //checking if current.shape is polygon or not. if not, then create a new shape
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
      // if current.shape is polygon
      //curr.shape == Polygon
      current.polygon_mode = false;
      // check if mouse is close to origin x & y
      if (
        mouseX < current.origin_x + 0.1 &&
        mouseX > current.origin_x - 0.1 &&
        mouseY < current.origin_y + 0.1 &&
        mouseY > current.origin_y - 0.1
      ) {
        // delete line according to polygon_coordinates
        for (let i = 0; i < (current.polygon_coordinates.length - 2) / 2; i++) {
          shapes.pop();
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
        // if mouse is not close to origin x & y
        // we will add the last coordinate to polygon_coordinates
        current.polygon_mode = true;
        current.polygon_coordinates = current.polygon_coordinates.concat([
          mouseX,
          mouseY,
        ]);

        //push line (for temporary display)
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
        // this temp_vert will be the x1 and x2 for next vertex in polygon
        current.temp_vert = [mouseX, mouseY];
      }
    }

    redrawCanvas();
    console.log(shapes);
    current.focus = shapes.length - 1;
  }
});

// looking for a mousemove
// this function will be called when the mouse is moved and mode is draw
canvas.addEventListener("mousemove", function (e) {
  if (current.mode == "Draw") {
    // if dragging is true, then draw a new shape (but not push to shapes array)
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
      }
    }
  }
});

//
// add event listener thingy for tools
//

document.getElementById("mode").addEventListener("click", function (e) {
  mode = document.getElementById("mode").value;
  setMode(mode);
});

document.getElementById("shape").addEventListener("click", function (e) {
  shape = document.getElementById("shape").value;
  setShape(shape);
  // reset polygon things
  if (shape != Polygon) {
    current.polygon_mode = false;
    current.polygon_coordinates = [];
  }
});
// Pop last shape
document.getElementById("delLast").addEventListener("click", function (e) {
  shapes.pop();
  current.focus = shapes.length - 1;
  current.draw_mode = false;
  redrawCanvas();
});

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/*                                                                                                                  */
/*                                                  SELECT MODE                                                     */
/*                                                                                                                  */
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// looking for a mousedown in canvas to select nearest shape
// set the current.focus to the index of the nearest shape
canvas.addEventListener("mousedown", function (e) {
  if (current.mode == "Select") {
    current.dragging = true;
    recordMouse(e);
    // init min_dist as the distance between mouse and the shape
    var min_dist = Infinity;
    var temp_dist = Infinity;
    idx_shape = -1;
    // temp_idx is the index that contain the temporary index of the closest vertex
    var temp_idx = -1;
    // looping through all of the shapes, searching the closest shape
    for (shape in shapes) {
      idx_shape++;
      // first case: shape is Line
      if (shapes[shape].name == "Line") {
        // get the distance between mouse and the shape using pythagoeran theorem
        temp_dist = Math.min(
          Math.sqrt(
            (mouseX - shapes[shape].x1) ** 2 + (mouseY - shapes[shape].y1) ** 2
          ),
          Math.sqrt(
            (mouseX - shapes[shape].x2) ** 2 + (mouseY - shapes[shape].y2) ** 2
          )
        );
        // set temp_idx to smallest distance
        if (
          Math.sqrt(
            (mouseX - shapes[shape].x1) ** 2 + (mouseY - shapes[shape].y1) ** 2
          ) == temp_dist
        ) {
          temp_idx = 0;
        } else {
          temp_idx = 1;
        }
      }
      // second case: shape is Square
      else if (shapes[shape].name == "Square") {
        // get the distance between mouse and the shape using pythagoeran theorem
        temp_dist = Math.min(
          Math.sqrt(
            (mouseX - shapes[shape].x1) ** 2 + (mouseY - shapes[shape].y1) ** 2
          ),
          Math.sqrt(
            (mouseX - shapes[shape].x1) ** 2 +
              (mouseY -
                (shapes[shape].y1 - (shapes[shape].x2 - shapes[shape].x1))) **
                2
          ), //y1 - (x2 - x1)
          Math.sqrt(
            (mouseX - shapes[shape].x2) ** 2 +
              (mouseY -
                (shapes[shape].y1 - (shapes[shape].x2 - shapes[shape].x1))) **
                2
          ), //y1 - (x2 - x1)
          Math.sqrt(
            (mouseX - shapes[shape].x2) ** 2 + (mouseY - shapes[shape].y1) ** 2
          )
        );
        // set temp_idx to smallest distance
        if (
          Math.sqrt(
            (mouseX - shapes[shape].x1) ** 2 + (mouseY - shapes[shape].y1) ** 2
          ) == temp_dist
        ) {
          temp_idx = 0;
        } else if (
          Math.sqrt(
            (mouseX - shapes[shape].x1) ** 2 +
              (mouseY -
                (shapes[shape].y1 - (shapes[shape].x2 - shapes[shape].x1))) **
                2
          ) == temp_dist
        ) {
          temp_idx = 1;
        } else if (
          Math.sqrt(
            (mouseX - shapes[shape].x2) ** 2 +
              (mouseY -
                (shapes[shape].y1 - (shapes[shape].x2 - shapes[shape].x1))) **
                2
          ) == temp_dist
        ) {
          temp_idx = 2;
        } else {
          temp_idx = 3;
        }
      }
      // third case: shape is Rectangle
      else if (shapes[shape].name == "Rectangle") {
        temp_dist = Math.min(
          Math.sqrt(
            (mouseX - shapes[shape].x1) ** 2 + (mouseY - shapes[shape].y2) ** 2
          ),
          Math.sqrt(
            (mouseX - shapes[shape].x1) ** 2 + (mouseY - shapes[shape].y1) ** 2
          ),
          Math.sqrt(
            (mouseX - shapes[shape].x2) ** 2 + (mouseY - shapes[shape].y2) ** 2
          ),
          Math.sqrt(
            (mouseX - shapes[shape].x2) ** 2 + (mouseY - shapes[shape].y1) ** 2
          )
        );
        // set temp_idx to smallest distance
        if (
          Math.sqrt(
            (mouseX - shapes[shape].x1) ** 2 + (mouseY - shapes[shape].y1) ** 2
          ) == temp_dist
        ) {
          temp_idx = 0;
        } else if (
          Math.sqrt(
            (mouseX - shapes[shape].x1) ** 2 + (mouseY - shapes[shape].y2) ** 2
          ) == temp_dist
        ) {
          temp_idx = 1;
        } else if (
          Math.sqrt(
            (mouseX - shapes[shape].x2) ** 2 + (mouseY - shapes[shape].y2) ** 2
          ) == temp_dist
        ) {
          temp_idx = 2;
        } else {
          temp_idx = 3;
        }
      }
      // fourth case: shape is Polygon
      else {
        temp_dist = Infinity;
        for (let i = 0; i < shapes[shape].points.length; i += 2) {
          temp_dist = Math.min(
            Math.sqrt(
              (mouseX - shapes[shape].points[i]) ** 2 +
                (mouseY - shapes[shape].points[i + 1]) ** 2
            ),
            temp_dist
          );
        }
        for (let i = 0; i < shapes[shape].points.length; i += 2) {
          // console.log(i);
          if (
            temp_dist ==
            Math.sqrt(
              (mouseX - shapes[shape].points[i]) ** 2 +
                (mouseY - shapes[shape].points[i + 1]) ** 2
            )
          ) {
            temp_idx = i;
          }
        }
      }

      // if the distance is smaller than the min_dist, set the min_dist to the distance
      // and set the focus to the shape that we selected
      // also set the change_vertex to the index of the closest vertex
      if (temp_dist < min_dist) {
        current.focus = idx_shape;
        min_dist = temp_dist;
        current.change_vertex = temp_idx;
      }
    }
    // the shape is selected
    // output is now current.focus is focus on that shape
  }
});

// looking for a mousemove to draw over the shape that is selected to our focus when mousedown
canvas.addEventListener("mousemove", function (e) {
  if (current.mode == "Select") {
    if (current.dragging) {
      // record mouse position
      recordMouse(e);
      redrawCanvas();

      // if selected shape is -1 (not select any kind of shape), just break this function
      if (idx_shape == -1) {
        return;
      }

      // if the shape is Line
      if (shapes[current.focus].name == "Line") {
        if (current.change_vertex == 0) {
          shapes[current.focus].x1 = mouseX;
          shapes[current.focus].y1 = mouseY;
        } else {
          shapes[current.focus].x2 = mouseX;
          shapes[current.focus].y2 = mouseY;
        }
        redrawCanvas();
      }
      // if the shape is Square or Rectangle
      else if (
        shapes[current.focus].name == "Square" ||
        shapes[current.focus].name == "Rectangle"
      ) {
        if (current.change_vertex == -1) {
          shapes[current.focus].x2 = mouseX;
          shapes[current.focus].y2 = mouseY;
        } else {
          shapes[current.focus].x1 =
            shapes[current.focus].position[(current.change_vertex + 2) % 4][0];
          shapes[current.focus].y1 =
            shapes[current.focus].position[(current.change_vertex + 2) % 4][1];
          shapes[current.focus].x2 = mouseX;
          shapes[current.focus].y2 = mouseY;
        }
        current.change_vertex = -1;
      }
      // if the shape is Polygon
      else if (shapes[current.focus].name == "Polygon") {
        shapes[current.focus].points[current.change_vertex] = mouseX;
        shapes[current.focus].points[current.change_vertex + 1] = mouseY;
      }
    }
  }
});

// // mouseup
canvas.addEventListener("mouseup", function (e) {
  if (current.mode == "Select") {
    current.dragging = false;
  }
});
