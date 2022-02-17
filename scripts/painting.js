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

// deleteShape is var for deleting when we want to redraw the transformation shape
var deleteShape = false;

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
canvas.addEventListener("mousedown", function (e) {
  if (current.mode == "Draw") {
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

// looking for a mouseup
canvas.addEventListener("mouseup", function (e) {
  if (current.mode == "Draw") {
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
        current.temp_vert = [mouseX, mouseY];
      }
    }

    redrawCanvas();
    console.log(shapes);
    current.focus = shapes.length - 1;
  }
});

// looking for a mousemove
canvas.addEventListener("mousemove", function (e) {
  if (current.mode == "Draw") {
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
// add event listener thingy
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
var idx_shape = -1;
canvas.addEventListener("mousedown", function (e) {
  if (current.mode == "Select") {
    current.dragging = true;
    recordMouse(e);
    // init min_dist as the distance between mouse and the shape
    var min_dist = Infinity;
    var temp_dist = Infinity;
    idx_shape = -1;
    // looping through all of the shapes, searching the closest shape
    for (shape in shapes) {
      idx_shape++;
      // first case: shape is Line
      // console.log(shapes[shape]);
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
        // set change_vertex to smallest distance
        if (
          Math.sqrt(
            (mouseX - shapes[shape].x1) ** 2 + (mouseY - shapes[shape].y1) ** 2
          ) == temp_dist
        ) {
          current.change_vertex = 0;
        } else {
          current.change_vertex = 1;
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
        // set change_vertex to smallest distance
        if (
          Math.sqrt(
            (mouseX - shapes[shape].x1) ** 2 + (mouseY - shapes[shape].y1) ** 2
          ) == temp_dist
        ) {
          current.change_vertex = 0;
        } else if (
          Math.sqrt(
            (mouseX - shapes[shape].x1) ** 2 +
              (mouseY -
                (shapes[shape].y1 - (shapes[shape].x2 - shapes[shape].x1))) **
                2
          ) == temp_dist
        ) {
          current.change_vertex = 1;
        } else if (
          Math.sqrt(
            (mouseX - shapes[shape].x2) ** 2 +
              (mouseY -
                (shapes[shape].y1 - (shapes[shape].x2 - shapes[shape].x1))) **
                2
          ) == temp_dist
        ) {
          current.change_vertex = 2;
        } else {
          current.change_vertex = 3;
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
        // set change_vertex to smallest distance
        if (
          Math.sqrt(
            (mouseX - shapes[shape].x1) ** 2 + (mouseY - shapes[shape].y1) ** 2
          ) == temp_dist
        ) {
          current.change_vertex = 0;
        } else if (
          Math.sqrt(
            (mouseX - shapes[shape].x1) ** 2 + (mouseY - shapes[shape].y2) ** 2
          ) == temp_dist
        ) {
          current.change_vertex = 1;
        } else if (
          Math.sqrt(
            (mouseX - shapes[shape].x2) ** 2 + (mouseY - shapes[shape].y2) ** 2
          ) == temp_dist
        ) {
          current.change_vertex = 2;
        } else {
          current.change_vertex = 3;
        }
      }
      // fourth case: shape is Polygon
      else {
        temp_dist = Infinity;
        for (let i = 0; i <= shapes[shape].points.length; i += 2) {
          temp_dist = Math.min(
            Math.sqrt(
              (mouseX - shapes[shape].points[i]) ** 2 +
                (mouseY - shapes[shape].points[i + 1]) ** 2
            ),
            temp_dist
          );
          if (
            temp_dist ==
            Math.sqrt(
              (mouseX - shapes[shape].points[i]) ** 2 +
                (mouseY - shapes[shape].points[i + 1]) ** 2
            )
          ) {
            current.change_vertex = i;
          }
        }
      }

      // if the distance is smaller than the min_dist, set the min_dist to the distance
      if (temp_dist < min_dist) {
        current.focus = idx_shape;
        min_dist = temp_dist;
      }
    }
    // the shape is selected
    // output is now current.focus is focus on that shape
    // deleteShape = true;
  }
});

// looking for a mousemove to draw over the shape that is selected to our focus when mousedown
var tempShape;
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

      // tempShape is a var that contains the shape that want to be removed

      // tempShape = shapes[current.focus];
      // deleteShape = false;

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
      // if the shape is Square
      else if (tempShape.name == "Square") {
        // set new anchor
        let new_anchor = tempShape.position[(current.change_vertex + 2) % 4];
        let dx, dy;

        // distance between new anchor and mouse
        dx = mouseX - new_anchor[0];
        dy = mouseY - new_anchor[1];
        // select the minimum value of dx and dy
        let d = Math.min(Math.abs(dx) + Math.abs(dy));
        // set dx and dy to become d
        if (dx > 0) {
          dx = d;
        } else {
          dx = -d;
        }

        if (dy > 0) {
          dy = d;
        } else {
          dy = -d;
        }

        if (current.change_vertex == -1) {
          tempShape.x2 = mouseX;
          tempShape.y2 = mouseY;
        } else if (current.change_vertex == 0) {
          //distance between new anchor (2) and mouse
          tempShape.x1 = tempShape.x1 - dx;
          tempShape.y1 = tempShape.y1 + dy;
          tempShape.x2 = mouseX;
          tempShape.y2 = mouseY;
          console.log(tempShape.x1, tempShape.y1, tempShape.x2, tempShape.y2);
          console.log("mas");
        } else if (current.change_vertex == 1) {
          // tempShape.x1 = mouseX;
          // tempShape.y1 = mouseY - (tempShape.x2 - tempShape.x1);
          tempShape.x2 = mouseX;
          tempShape.y2 = mouseY;
        } else if (current.change_vertex == 2) {
          // tempShape.x2 = mouseX;
          // tempShape.y1 = mouseY - (tempShape.x2 - tempShape.x1);
          tempShape.x2 = mouseX;
          tempShape.y2 = mouseY;
        } else {
          tempShape.x2 = mouseX;
          tempShape.y2 = mouseY;
        }
        new Square(
          tempShape.x1,
          tempShape.y1,
          tempShape.x2,
          tempShape.y2,
          false
        ).draw();
        current.change_vertex = -1;
      }
      // if the shape is Rectangle
      else if (tempShape.name == "Rectangle") {
        if (current.change_vertex == 0) {
          // tempShape.x1 = mouseX;
          // tempShape.y1 = mouseY;
          tempShape.x2 = mouseX;
          tempShape.y2 = mouseY;
        } else if (current.change_vertex == 1) {
          tempShape.y1 = mouseY;
        } else if (current.change_vertex == 2) {
          tempShape.x2 = mouseX;
          tempShape.y2 = mouseY;
        } else {
          tempShape.x1 = mouseX;
          tempShape.y2 = mouseY;
        }
        new Rectangle(
          tempShape.x1,
          tempShape.y1,
          tempShape.x2,
          tempShape.y2,
          false
        ).draw();
      }
      // if the shape is Polygon
      else if (tempShape == Polygon) {
        tempShape.points[current.change_vertex] = mouseX;
        tempShape.points[current.change_vertex + 1] = mouseY;
        new tempShape.draw();
      }
    }
  }
});

// // mouseup
canvas.addEventListener("mouseup", function (e) {
  if (current.mode == "Select") {
    current.dragging = false;
    //     //checking if current.shape is polygon or not
    //     if (current.shape != Polygon) {
    //       shapes.push(
    //         new current.shape(
    //           current.origin_x,
    //           current.origin_y,
    //           mouseX,
    //           mouseY,
    //           current.color,
    //           false
    //         )
    //       );
    //     } else {
    //       //curr.shape == Polygon
    //       current.polygon_mode = false;
    //       // check if mouse is close to origin x & y
    //       if (
    //         mouseX < current.origin_x + 0.1 &&
    //         mouseX > current.origin_x - 0.1 &&
    //         mouseY < current.origin_y + 0.1 &&
    //         mouseY > current.origin_y - 0.1
    //       ) {
    //         // delete line according to polygon_coordinates
    //         for (let i = 0; i < (current.polygon_coordinates.length - 2) / 2; i++) {
    //           shapes.pop();
    //         }
    //         // add polygon to shapes
    //         shapes.push(
    //           new Polygon(
    //             current.origin_x,
    //             current.origin_y,
    //             mouseX,
    //             mouseY,
    //             current.color,
    //             current.polygon_coordinates
    //           )
    //         );
    //         // clean up polygon_coordinates
    //         current.polygon_coordinates = [];
    //       } else {
    //         current.polygon_mode = true;
    //         current.polygon_coordinates = current.polygon_coordinates.concat([
    //           mouseX,
    //           mouseY,
    //         ]);
    //         //push line (for temporary display)
    //         shapes.push(
    //           new Line(
    //             current.temp_vert[0],
    //             current.temp_vert[1],
    //             mouseX,
    //             mouseY,
    //             current.color,
    //             false
    //           )
    //         );
    //         current.temp_vert = [mouseX, mouseY];
    //       }
    //     }
    //     redrawCanvas();
    //     console.log(shapes);
    //     current.focus = shapes.length - 1;
  }
});

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Batas work in progress
