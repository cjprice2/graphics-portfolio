// Fragment Shader for Animated Boost Panel

precision highp float;

// Varying UV from vertex shader
varying vec2 v_uv;

// Uniform for time-based animation
uniform float u_time;

// Constants for animation and appearance
const float speed = 1.5; // Speed of the animation
const float bandWidth = 0.5; // Width of the moving band
const float shapeDepth = 0.5; // How deep the '^^' shape is
const float edgeSoftness = 0.1; // Adjust softness as needed
const vec3 baseColor = vec3(1.0, 0.2, 0.0); // Dark orangish base color
const vec3 bandColor = vec3(0.9, 0.9, 0.0); // Yellowish band color

void main() {
  // Calculate a triangle wave factor with peaks at y=0.25 and y=0.75
  // fract(v_uv.y * 2.0 + 0.5) creates two sawtooth waves from 0 to 1
  // * 2.0 - 1.0 maps this to -1 to 1
  // abs(...) creates the triangle shape
  float triangleFactor = abs(fract(v_uv.y * 2.0 + 0.5) * 2.0 - 1.0);

  // Calculate the shape offset based on the triangle wave factor
  float shape_offset = triangleFactor * shapeDepth;

  // Calculate a value that cycles from 0 to 1 based on time, U coordinate, and shape offset
  // Adding the offset makes the pattern appear further along (advance faster) at the peaks
  float pattern = fract(v_uv.x + shape_offset + u_time * speed);

  // Define the center of the band (adjust if needed, 0.5 means centered in the 0-1 range)
  float bandCenter = 0.5; // Center of the band's appearance within the pattern cycle

  // Calculate the distance from the pattern value to the band center, handling wrap-around
  float dist = abs(pattern - bandCenter);
  // Handle wrap-around distance (e.g., distance between 0.1 and 0.9 is 0.2, not 0.8)
  dist = min(dist, 1.0 - dist);

  // Calculate the half-width of the band including softness
  float halfWidth = bandWidth / 2.0;
  float softHalfWidth = halfWidth + edgeSoftness;

  // Use smoothstep based on distance from the center
  // Ramp down from 1 to 0 as distance increases from halfWidth to softHalfWidth
  float inBand = 1.0 - smoothstep(halfWidth - edgeSoftness, halfWidth + edgeSoftness, dist);

  // Mix between base color and band color
  vec3 finalColor = mix(baseColor, bandColor, inBand);

  // Set the final fragment color
  gl_FragColor = vec4(finalColor, 1.0);
}
