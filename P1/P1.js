/*jshint esversion: 6 */
// @ts-check

// these two things are the main UI code for the train
// students learned about them in last week's workbook

import { draggablePoints } from "./dragPoints.js";
import { RunCanvas } from "./runCanvas.js";

// this is a utility that adds a checkbox to the page 
// useful for turning features on and off
import { makeCheckbox } from "./inputHelpers.js";

/**
 * Have the array of control points for the track be a
 * "global" (to the module) variable
 *
 * Note: the control points are stored as Arrays of 2 numbers, rather than
 * as "objects" with an x,y. Because we require a Cardinal Spline (interpolating)
 * the track is defined by a list of points.
 *
 * things are set up with an initial track
 */
/** @type Array<number[]> */
let thePoints = [
  [125, 150],
  [150, 400],
  [450, 450],
  [400, 300],
  [500, 250],
  [300, 100],
];


/**
 * Helper function to get the four points for a segment
 *
 * @param {number} index the index of the segment
 * @returns {Array<number[]>} the four points for the segment
 */
function getFourPoints(index, pts = thePoints) {
  let n = pts.length;
  return [
    // For a loop, wrap the indices:
    pts[(index - 1 + n) % n], // Previous point (P0)
    pts[index], // Current point (P1)
    pts[(index + 1) % n], // Next point (P2)
    pts[(index + 2) % n] // Point after next (P3)
  ];
}

/**
 * Computes the two control points for a Catmull-Rom to Bezier conversion.
 *
 * Given four points P0, P1, P2, P3, returns:
 *   cp1 = P1 + (P2 - P0) / 6
 *   cp2 = P2 - (P3 - P1) / 6
 *
 * @param {number[]} P0 - The point before the current segment
 * @param {number[]} P1 - The start point of the segment
 * @param {number[]} P2 - The end point of the segment
 * @param {number[]} P3 - The point after the segment
 * @returns {Array<number[]>} An array containing cp1 and cp2
 */
function computeBezierControlPoints(P0, P1, P2, P3) {
  let cp1 = [P1[0] + (P2[0] - P0[0]) / 6, P1[1] + (P2[1] - P0[1]) / 6];
  let cp2 = [P2[0] - (P3[0] - P1[0]) / 6, P2[1] - (P3[1] - P1[1]) / 6];
  return [cp1, cp2];
}

/**
 * Helper function for linear interpolation
 * Got from WB05-07-descastlejau.js
 *
 * @param {number} u the interpolation parameter
 * @param {number[]} p1 the first point
 * @param {number[]} p2 the second point
 */
function lerp(u, p1, p2) {
  let u1 = 1 - u;
  return [u1 * p1[0] + u * p2[0], u1 * p1[1] + u * p2[1]];
}

/**
 * Helper function for De Castlejau algorithm for a cubic Bezier curve
 *
 * @param {number} u the interpolation parameter
 * @param {number[]} P1 the start point of the curve
 * @param {number[]} CP1 the first control point
 * @param {number[]} CP2 the second control point
 * @param {number[]} P2 the end point of the curve
 * @returns {Object} an object with the point on the curve and the tangent vector
 */
function deCastlejau(u, P1, CP1, CP2, P2) {
  // First level of interpolation
  let Q0 = lerp(u, P1, CP1);
  let Q1 = lerp(u, CP1, CP2);
  let Q2 = lerp(u, CP2, P2);

  // Second level of interpolation
  let R0 = lerp(u, Q0, Q1);
  let R1 = lerp(u, Q1, Q2);

  // Final interpolation gives the point on the curve
  let S = lerp(u, R0, R1);

  // Approximate tangent vector as 3*(R1 - R0)
  let dx = 3 * (R1[0] - R0[0]);
  let dy = 3 * (R1[1] - R0[1]);

  return {point: {x: S[0], y: S[1]}, tangent: {x: dx, y: dy}};
}

/**
 * Computes arc-length data for the entire track
 * Returns an object with:
 *   curveLengths: an array of each segment's length,
 *   cumulative: a cumulative (prefix sum) array (starting with 0),
 *   totalLength: the total track length
 * @param {number} steps - number of sample points per segment
 */
function computeArcLengths(steps) {
  let curveLengths = []; // Array to store the approximated arc lengths of each curve
  let totalLength = 0; // Total length of the track

  // Compute the arc length of each curve using Riemann sums of sample u points on the curve
  for (let i = 0; i < thePoints.length; i++) {
    let [p0, p1, p2, p3] = getFourPoints(i); // Get the four points for the current segment using my helper function
    let [cp1, cp2] = computeBezierControlPoints(p0, p1, p2, p3); // Compute the Bezier control points for this segment using my helper function
    let curveLength = 0; // Length of the current curve
    let lastPoint = deCastlejau(0, p1, cp1, cp2, p2).point; // Initialize last point to the start of the curve

    // Step through the curve to compute the total length of the curve
    for (let j = 1; j <= steps; j++) {
      let current = deCastlejau(j / steps, p1, cp1, cp2, p2); // use my helper function to get the point on the curve for current u step
      let currentPoint = current.point; 
      let dx = currentPoint.x - lastPoint.x; // Compute the change in x and y
      let dy = currentPoint.y - lastPoint.y;
      let stepLength = Math.sqrt(dx * dx + dy * dy); // Compute the length of the line segment between last step point and current step point
      curveLength += stepLength; // Add the length to the total length of this curve
      lastPoint = currentPoint; // Update the last point to the current point
    }
    curveLengths.push(curveLength); // Add the length of this curve to the array of curve lengths
    totalLength += curveLength; // Add the length of this curve to the total length of the track
  }
  
  // Create a cumulative sum array of the curve lengths
  let cumulativeLengths = [0]; // Initialize the cumulative lengths array with 0
  for (let i = 0; i < thePoints.length; i++) { // Loop through the curve lengths to compute the cumulative lengths
    cumulativeLengths.push(cumulativeLengths[i] + curveLengths[i]); // Add the current curve length to the previous cumulative length
  }
  return {curveLengths, cumulativeLengths, totalLength};
}

/**
 * Maps a slider value (or direct arc-length distance) to a segment index, local parameter u,
 * and returns the evaluated point and tangent using arc-length reparameterization
 * @param {number} value - the slider value (if isSlider is true) or the desired distance along the track.
 * @param {number} steps - number of sample points per segment
 * @param {boolean} [isSlider=true] - treat the value as a slider value if true, else as a direct arc-length distance.
 * @returns {Object} an object with curveIndex, u, point, and tangent.
 */
function mapToGlobalPoint(value, steps, isSlider = true) {
  let {curveLengths, cumulativeLengths, totalLength} = computeArcLengths(steps); // Compute the arc length data for the entire track using my helper function
  let desiredDistance; // Desired distance along the track
  if (isSlider) { // If the value is a slider value, convert it to an arc-length distance
    let fractionTotal = (value % thePoints.length) / thePoints.length; 
    desiredDistance = fractionTotal * totalLength;
  } else { // Else, use the value as the desired distance (for evenly spaced ties)
    desiredDistance = value % totalLength;
  }

  // Then, find the curve segment index and local parameter u for the desired distance
  let curveIndex = 0;
  for (let i = 0; i < thePoints.length; i++) {
    if (desiredDistance >= cumulativeLengths[i] && desiredDistance < cumulativeLengths[i + 1]) {
      curveIndex = i;
      break;
    }
  }
  // Now knowing what curve we are on, we can find the local parameter u
  let localDistance = desiredDistance - cumulativeLengths[curveIndex];
  let curveLength = curveLengths[curveIndex];
  let u;
  if (curveLength > 0) {
    u = localDistance / curveLength; // If curve length is greater than 0, compute u as the ratio of local distance to curve length
  } else {
    u = 0;
  }
  let [p0, p1, p2, p3] = getFourPoints(curveIndex); // Get the four points for the current segment using my helper function
  let [cp1, cp2] = computeBezierControlPoints(p0, p1, p2, p3); // Compute the Bezier control points for this segment using my helper function
  return {curveIndex, u, ...deCastlejau(u, p1, cp1, cp2, p2)}; // Return the curve index, u, point, and tangent using de Castlejau algorithm
}

/**
 * "Sample" the main curve at many small parameter increments (use Riemann sums)
 *  to build an array of many points along the track in order to offset the rails
 * @param {number} steps - the number of samples to take throughout the whole track
 * @returns {Array<Object>} an array of point objects with x, y, tx, ty properties to form dense polyline
 */
function sampleMainTrack(steps) {
  let result = []; // Array to store the sampled points
  let n = thePoints.length;
  // We'll param from 0..n in small increments
  let step = (n / steps); // Step size for sampling
  for (let u = 0; u <= n; u += step) { // Loop through the whole track to sample points
    let curveIndex = Math.floor(u); // Curve index + local u
    let localU = u - curveIndex; // Local u for the current segment
    curveIndex = curveIndex % n; // Wrap the curve index for a loop
    // Get the four points for this segment
    let [p0, p1, p2, p3] = getFourPoints(curveIndex); // Get the four points for the current segment using my helper function
    let [cp1, cp2] = computeBezierControlPoints(p0, p1, p2, p3); // Compute the Bezier control points for this segment using my helper function
    let info = deCastlejau(localU, p1, cp1, cp2, p2); // Use de Castlejau algorithm to get the point and tangent for current u
    result.push({x: info.point.x, y: info.point.y, tx: info.tangent.x, ty: info.tangent.y}); // push the point and tangent to result array
  }
  return result; // return all computed points
}

/**
 * Offset an array of sampled points by railOffset in the normal direction,
 * then treat them as control points for a cardinal (Catmull-Rom) spline
 * 
 * @param {Array<Object>} sampled - array of sampled points
 * @param {number} railOffset - the offset distance
 * @returns {Array<number[]>} an array of offset points
 */
function computeOffsetSplinePoints(sampled, railOffset) {
  let offsetPoints = [];
  // For each sample, offset by the normal of the local tangent
  for (let i = 0; i < sampled.length; i++) { // iterate over all sampled points
    let { x, y, tx, ty } = sampled[i]; // extract position (x, y) and tangent (tx, ty) from the current sample
    let mag = Math.sqrt(tx*tx + ty*ty); // calculate the magnitude of the tangent vector
    let nx = -ty / mag; // compute the x component of the normal vector by negating ty and dividing by magnitude
    let ny = tx / mag; // compute the y component of the normal vector by dividing tx by magnitude
    offsetPoints.push([x + railOffset*nx, y + railOffset*ny]); // offset the current point along the normal direction and add to offsetPoints array
  }
  return offsetPoints; // return the array of offset points
}

/**
 * Draw a cardinal (Catmull-Rom) spline from a set of points. One cardinal spline is 
 * the simple track, two constantly parallel splines are the rails for the advanced track.
 * We'll do a piecewise cubic Bezier for each pair of control points.
 * 
 * @param {CanvasRenderingContext2D} context - the 2D rendering context
 * @param {Array<number[]>} pts - the control points for the spline
 * @param {string} strokeStyle - the stroke style for the spline
 * @param {number} lineWidth - the line width for the spline
 */
function drawCardinalSpline(context, pts, strokeStyle, lineWidth) {
  // Set the stroke style and line width for the spline and begin path
  context.strokeStyle = strokeStyle;
  context.lineWidth = lineWidth;
  context.beginPath();
  
  // Loop through each control point to form spline segments
  for (let i = 0; i < pts.length; i++) {
    // Wrap indices to get four points for the current segment:
    // p0: previous point, p1: current point, p2: next point, p3: point after next
    let [p0, p1, p2, p3] = getFourPoints(i, pts);
    // Compute the two Bezier control points for this bezier segment from the four Catmull-Rom points
    let [cp1, cp2] = computeBezierControlPoints(p0, p1, p2, p3);
    if (i === 0) { // For the first segment, move to the starting control point
      context.moveTo(p1[0], p1[1]);
    }
    // Draw a cubic Bezier curve from p1 to p2 using the calculated control points
    context.bezierCurveTo(cp1[0], cp1[1], cp2[0], cp2[1], p2[0], p2[1]);
  }
  context.closePath();
  context.stroke();
}

/**
 * Draw function - this is the meat of the operation
 *
 * It's the main thing that needs to be changed
 *
 * @param {HTMLCanvasElement} canvas
 * @param {Number} sliderValue - the slider value
 */
function draw(canvas, sliderValue) {
  let context = canvas.getContext("2d");
  if (context === null)
    throw new Error("2D Rendering context is null");

  // clear the screen
  context.clearRect(0, 0, canvas.width, canvas.height);

  // draw the control points
  thePoints.forEach(function(pt) {
    context.beginPath();
    context.arc(pt[0], pt[1], 5, 0, Math.PI * 2);
    context.closePath();
    context.fill();
  });

  //////////// Draw the track! ////////////

  // If the "simple track" checkbox is checked, draw the track as a single cardinal cubic spline converted to a series of Bezier curves 
  let simpleTrackCheckbox = /** @type {HTMLInputElement} */ (document.getElementById("check-simple-track"));
  if (simpleTrackCheckbox && simpleTrackCheckbox.checked) {
    // Draw the main track only
    drawCardinalSpline(context, thePoints, "black", 3);
  } else { // Else draw railroad with parallel rails and perpendicular rail ties
    // 1) Sample the main curve to get a dense polyline
    let steps = 100; // lower this if performance is slow
    let samples = sampleMainTrack(steps);

    // 2) Offset each sample for rail 1 and rail 2
    let offset1 = computeOffsetSplinePoints(samples, +10); 
    let offset2 = computeOffsetSplinePoints(samples, -10);

    // 3) Draw these sets of offset points as cardinal splines
    drawCardinalSpline(context, offset1, "black", 3);
    drawCardinalSpline(context, offset2, "black", 3);

    // 4) Draw rail ties at arc-length intervals on the main track
    let arcData = computeArcLengths(steps); // Compute the arc length data for the entire track using my helper function
    let tieSpacing = 30; // distance between the ties
    context.strokeStyle = "brown";
    context.lineWidth = 4;
    for (let d = 0; d < arcData.totalLength; d += tieSpacing) { // Loop through the arc length of the track to draw the rail ties
      let info = mapToGlobalPoint(d, steps, false); // Map the distance to a global point using my helper function
      let pt = info.point; // Get the point at this distance
      let tangent = info.tangent; // Get the tangent vector at this point
      let mag = Math.sqrt(tangent.x * tangent.x + tangent.y * tangent.y); // Compute the magnitude of the tangent vector
      let nx = -tangent.y / mag; // Compute the normal vector
      let ny = tangent.x / mag;  
      let tieWidth = 20; // distance between the rails
      let tieStart = {x: pt.x + nx*(tieWidth/2), y: pt.y + ny*(tieWidth/2)}; // Compute the start and end points of the tie
      let tieEnd = {x: pt.x - nx*(tieWidth/2), y: pt.y - ny*(tieWidth/2)};
      context.beginPath();
      context.moveTo(tieStart.x, tieStart.y); // Move to tie location and draw the tie as a line segment
      context.lineTo(tieEnd.x, tieEnd.y);
      context.stroke();
    }
}


  /////////////// Compute the train position ///////////////

  let arcLengthCheckbox = /** @type {HTMLInputElement} */ (document.getElementById("check-arc-length"));

  // Variables for the curve index and interpolation parameter u
  let curveIndex;
  let u;

  if (arcLengthCheckbox && !arcLengthCheckbox.checked) { // If arc length checkbox not checked, use linear interpolation
    curveIndex = Math.floor(sliderValue);
    u = sliderValue - curveIndex;
  } else { // Else use arc length parameterization
    let steps = 1000; // Number of sample points per segment
    let mapping = mapToGlobalPoint(sliderValue, steps, true); // Map the slider value to a global point using my helper function
    curveIndex = mapping.curveIndex;
    u = mapping.u;  
  }

  
  let [p0, p1, p2, p3] = getFourPoints(curveIndex);
  let [cp1, cp2] = computeBezierControlPoints(p0, p1, p2, p3);
  let {point, tangent} = deCastlejau(u, p1, cp1, cp2, p2);
  let angle = Math.atan2(tangent.y, tangent.x); // Compute the angle of the tangent vector using arctangent2

  /////////////// Draw the train! ///////////////
  
  context.save();
  context.translate(point.x, point.y); // Translate to the train position
  context.rotate(angle); // Rotate to the angle of the tangent vector
  
  // Draw the light beam coming out from the front (fades out)
  context.save(); 
  let beamGradient = context.createLinearGradient(10, -8, 60, -20); // Create a gradient for the light beam (Got help from ChatGPT for this)
  beamGradient.addColorStop(0, "rgba(255, 255, 0, 1)");
  beamGradient.addColorStop(1, "rgba(255, 255, 0, 0)");
  context.fillStyle = beamGradient;
  context.beginPath();

  // Draw the light beam thingy lol
  context.moveTo(10, -2);
  context.lineTo(50, -25);
  context.lineTo(50, 25);
  context.lineTo(10, 2);
  context.closePath();
  context.fill();
  context.restore();

  // Draw the main body of the train!
  context.fillStyle = "black";
  context.beginPath();
  // Start at the back left corner (flat side at the rear)
  context.moveTo(-30, -10);
  // Draw to the front left corner
  context.lineTo(10, -10);
  // Draw a curved front with an arc (centered at (10,0), radius 10)
  context.arc(10, 0, 10, -Math.PI / 2, Math.PI / 2, false);
  // Draw to the right front corner
  context.lineTo(10, 10);
  // Draw along the bottom back to complete the shape
  context.lineTo(-30, 10);
  context.closePath();
  context.fill();
  context.restore();
}

/**
 * Initialization code - sets up the UI and start the train
 */
let canvas = /** @type {HTMLCanvasElement} */ (document.getElementById("canvas1"));
canvas.style.background = "#ffffff";
let context = canvas.getContext("2d");

// we need the slider for the draw function, but we need the draw function
// to create the slider - so create a variable and we'll change it later
let slider; // = undefined;

// note: we wrap the draw call so we can pass the right arguments
function wrapDraw() {
    // do modular arithmetic since the end of the track should be the beginning
    draw(canvas, Number(slider.value) % thePoints.length);
}
// create a UI
let runcanvas = new RunCanvas(canvas, wrapDraw);
// now we can connect the draw function correctly
slider = runcanvas.range;

// note: if you add these features, uncomment the lines for the checkboxes
// in your code, you can test if the checkbox is checked by something like:
// document.getElementById("check-simple-track").checked
// in your drawing code
// WARNING: makeCheckbox adds a "check-" to the id of the checkboxes
//
// lines to uncomment to make checkboxes
// Place the checkboxes inside the RunCanvas controls bar so they stay centered under the canvas
makeCheckbox("simple-track", runcanvas.controlsDiv);
makeCheckbox("arc-length", runcanvas.controlsDiv).checked = true;
//makeCheckbox("bspline");

// helper function - set the slider to have max = # of control points
function setNumPoints() {
    runcanvas.setupSlider(0, thePoints.length, 0.05);
}

setNumPoints();
runcanvas.setValue(0);

// add the point dragging UI
draggablePoints(canvas, thePoints, wrapDraw, 10, setNumPoints);

// Simple track checkbox event listener
let simpleTrackCheckbox = document.getElementById("check-simple-track");
if (simpleTrackCheckbox) {
  simpleTrackCheckbox.addEventListener("change", wrapDraw);
}

// Arc length checkbox event listener
let arcLengthCheckbox = document.getElementById("check-arc-length");
if (arcLengthCheckbox) {
  arcLengthCheckbox.addEventListener("change", wrapDraw);
}