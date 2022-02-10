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
  constructor(x1, y1, x2, y2, color) {
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
    this.color = color;
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
    var vertexCount = Math.floor(points.length);
    gl.drawArrays(gl_shape, 0, vertexCount);
  }
}

// line class
class Line extends Shape {
  constructor(x1, y1, x2, y2, color) {
    super(x1, y1, x2, y2, color);
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
  constructor(x1, y1, x2, y2, color) {
    super(x1, y1, x2, y2, color);
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
        [x1, y1 - (x2 - x1)],
        [x2, y1 - (x2 - x1)],
        [x2, y1],
      ],
      gl.LINE_LOOP
    );
  }
}

// rectangle class
class Rectangle extends Shape {
  constructor(x1, y1, x2, y2, color) {
    super(x1, y1, x2, y2, color);
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
        [x1, y2],
        [x2, y2],
        [x2, y1],
      ],
      gl.LINE_LOOP
    );
  }
}

// polygon class
class Polygon extends Shape {
  constructor(x1, y1, x2, y2, color, points) {
    super(x1, y1, 0, 0, color);
    this.points = points;
  }
  // draw method
  draw() {
    poly_vertices = [[this.x1, this.y1]];
    for (let point of this.points) {
      poly_vertices.push([point[0], point[1]]);
    }
    this.materialized(poly_vertices, gl.LINE_LOOP);
  }
}
