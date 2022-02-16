// helper tools

// recordMouse(event) -> void
// record mouse coordinates
function recordMouse(event) {
  mouseX = (event.offsetX / canvas.clientWidth) * 2 - 1;
  mouseY = (1 - event.offsetY / canvas.clientHeight) * 2 - 1;
}

// hexToColor: string -> color
function hexToColor(hex) {
  var c;
  if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
    c = hex.substring(1).split("");
    if (c.length == 3) {
      c = [c[0], c[0], c[1], c[1], c[2], c[2]];
    }
    c = "0x" + c.join("");
    return new Color(
      ((c >> 16) & 255) / 255.0,
      ((c >> 8) & 255) / 255.0,
      (c & 255) / 255.0
    );
  }
  throw new Error("Bad Hex");
}

// Upon an unrecognized shape, draw a line for some reason
function setShape(shape) {
  current.shape =
    shape == "Line"
      ? Line
      : shape == "Square"
      ? Square
      : shape == "Rectangle"
      ? Rectangle
      : shape == "Polygon"
      ? Polygon
      : (console.log("NO SUCH SHAPE"), Line);
}

function setMode(mode) {
  current.mode =
    mode == "Draw"
      ? "Draw"
      : mode == "Select"
      ? "Select"
      : (console.log("NO SUCH MODE"), "Draw");
}
