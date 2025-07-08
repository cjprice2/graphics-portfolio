/**
* Example Vertex Shader
* Sets the position of the vertex by setting gl_Position
*/

// Set the precision for data types used in this shader
precision highp float;
precision highp int;

// Default THREE.js uniforms are provided automatically
// uniform mat4 modelMatrix; 
// uniform mat4 modelViewMatrix;
// uniform mat4 projectionMatrix;
// uniform mat3 normalMatrix;

// Default uniforms provided by ShaderFrog

// Default THREE.js attributes are provided automatically
// attribute vec3 position;
// attribute vec3 normal;
// attribute vec2 uv;

// Examples of variables passed from vertex to fragment shader
varying vec3 vNormal; // Will be view-space normal
varying vec2 vUv;
varying vec3 vWorldPosition; // World-space position

void main() {

    // Pass UV coordinates
    vUv = uv;

    // Calculate view-space normal
    vNormal = normalize( normalMatrix * normal );

    // Calculate world-space position
    vec4 worldPosition = modelMatrix * vec4( position, 1.0 );
    vWorldPosition = worldPosition.xyz;

    // Calculate clip-space position
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

}