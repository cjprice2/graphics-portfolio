// Basic Vertex Shader for Boost Panel

// Attributes from geometry (Provided by Three.js)
// attribute vec3 position;
// attribute vec2 uv;

// Uniforms from Three.js (Provided by Three.js)
// uniform mat4 modelViewMatrix;
// uniform mat4 projectionMatrix;

// Varying to pass UV to fragment shader
varying vec2 v_uv;

void main() {
  // Pass UV coordinates to the fragment shader
  v_uv = uv; // Use the built-in 'uv' attribute

  // Calculate final position using built-in variables
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
