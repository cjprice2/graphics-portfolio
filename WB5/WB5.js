// @ts-check
export {};  // null statement to tell VSCode we're doing a module

// draw a picture using curves!

let canvas = document.getElementById("canvas1");
if (!(canvas instanceof HTMLCanvasElement))
    throw new Error("Canvas is not HTML Element");
let context = canvas.getContext("2d");
if (!context) 
    throw new Error("Context is null");

// Draw sunset background
let gradient = context.createLinearGradient(0, 0, 0, 250);
gradient.addColorStop(0, "#002266"); // dark blue
gradient.addColorStop(1, "#FF9933"); // light orangish yellowish
context.fillStyle = gradient;
context.fillRect(0, 0, 400, 400);

// Draw sun!!!!!
context.save();
// Create a radial gradient; got help from ChatGPT
let gradient2 = context.createRadialGradient(200, 170, 0, 200, 170, 100);
gradient2.addColorStop(0, "#FF9933");
gradient2.addColorStop(0.75, "#FF9933AA");
gradient2.addColorStop(1, "#FFCC3300");
context.fillStyle = gradient2;
context.beginPath();
context.arc(200, 170, 120, 0, 2 * Math.PI);
context.fill();
context.closePath();
context.restore();


// Draw water waves yuh
context.save();
context.globalAlpha = 1; // fully opaque
context.fillStyle = "#224499"
context.beginPath();
context.moveTo(0, 200);
// G(1) continuity between these two curves (lets use the second and third curves as an example)
// Curve 2 slope at end: 3((100, 200) - (90, 190)) = (30, 30)
// Curve 3 slope at start: 3((120, 220) - (100, 200)) = (60, 60)
// These curves are parallel at the join point, so they have the same slope, so G(1) continuity, but not the same magnitude, so not C(1) continuity
for (let i = 0; i < 4; i++) {
    context.bezierCurveTo(20 + 100 * i, 220, 80 + 100 * i, 170, 20 + 100 * i, 170);
    context.bezierCurveTo(40 + 100 * i, 130, 90 + 100 * i, 190, 100 + 100 * i, 200);
}
context.lineTo(400, 300);
context.lineTo(0, 300);
context.closePath();
context.fill();
context.restore();

// Draw sand beneath the water in positioning, above in layering
context.fillStyle = "#FFCC99"; // sandy color
context.beginPath();
context.moveTo(0, 250);
// C(1) continuity between curves (lets use the first and second curves as an example)
// Curve 1 slope at end: 3((60, 260) - (40, 260)) = (60, 0)
// Curve 2 slope at start: 3((80, 260) - (60, 260)) = (60, 0)
// Because the slopes are the same magnitude and direction at the join point, they have C(1) continuity
context.bezierCurveTo(20, 250, 40, 260, 60, 260);
context.bezierCurveTo(80, 260, 100, 250, 120, 250);
context.bezierCurveTo(140, 250, 160, 260, 180, 260);
context.bezierCurveTo(200, 260, 220, 250, 240, 250);
context.bezierCurveTo(260, 250, 280, 260, 300, 260);
context.bezierCurveTo(320, 260, 340, 250, 360, 250);
context.bezierCurveTo(380, 250, 400, 260, 420, 260);

context.lineTo(400, 400);
context.lineTo(0, 400);
context.closePath();
context.fill();
