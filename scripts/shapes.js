// color classes: (r, g, b)
class Color {
  constructor(r, g, b) {
    this.r = r;
    this.g = g;
    this.b = b;
  }
}

// shape superclass
class Shape {
  constructor(x1, y1, x2, y2, color, name, filled, extraparameter = false) {
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
    this.color = color;
    this.name = name;
    this.filled = filled;
  }

  // materialized function
  materialized(points, gl_shape) {
    // init array of vertices
    var vertices = [];
    // push every point that created on the canvas
    for (let point of points) {
      vertices.push(
        point[0],
        point[1],
        this.color.r,
        this.color.g,
        this.color.b
      );
    }
    // buffer the data
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    // draw the geometry
    var vertexCount = points.length;
    gl.drawArrays(gl_shape, 0, vertexCount);
  }
}

// line class
class Line extends Shape {
  constructor(x1, y1, x2, y2, color, filled, dummy) {
    super(x1, y1, x2, y2, color, "Line", false);
  }
  // draw method
  draw() {
    let x1 = this.x1;
    let y1 = this.y1;
    let x2 = this.x2;
    let y2 = this.y2;
    this.materialized(
      [
        [x1, y1],
        [x2, y2],
      ],
      gl.LINE_STRIP
    );
  }
}

// square class
class Square extends Shape {
  constructor(x1, y1, x2, y2, color, filled) {
    super(x1, y1, x2, y2, color, "Square");
    this.position = [];
    this.filled = filled;
  }
  // draw method
  draw() {
    let x1 = this.x1;
    let y1 = this.y1;
    let x2 = this.x2;
    let y2 = this.y2;

    // find the difference between x1 and x2
    let dx = x2 - x1;
    let dy = y2 - y1;
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

    // set the position of the square
    this.position = [
      [x1, y1],
      [x1, y1 + dy],
      [x1 + dx, y1 + dy],
      [x1 + dx, y1],
    ];

    this.materialized(
      this.position,
      this.filled ? gl.TRIANGLE_FAN : gl.LINE_LOOP
    );
  }
}

// rectangle class
class Rectangle extends Shape {
  constructor(x1, y1, x2, y2, color, filled) {
    super(x1, y1, x2, y2, color, "Rectangle");
    this.filled = filled;
  }
  // draw method
  draw() {
    let x1 = this.x1;
    let y1 = this.y1;
    let x2 = this.x2;
    let y2 = this.y2;

    this.position = [
      [x1, y1],
      [x1, y2],
      [x2, y2],
      [x2, y1],
    ];

    this.materialized(
      this.position,
      this.filled ? gl.TRIANGLE_FAN : gl.LINE_LOOP
    );
  }
}

// polygon class
class Polygon extends Shape {
  constructor(x1, y1, x2, y2, color, points, filled) {
    super(x1, y1, 0, 0, color, "Polygon");
    this.points = points;
    this.filled = filled;
  }
  // draw method
  draw() {
    // init array of vertices that will be used to draw the polygon
    var poly_vertices = [];
    for (let i = 0; i < this.points.length; i += 2) {
      poly_vertices.push([this.points[i], this.points[i + 1]]);
    }
    this.materialized(
      poly_vertices,
      this.filled ? gl.TRIANGLE_FAN : gl.LINE_LOOP
    );
  }
}
