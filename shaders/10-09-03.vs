/*
 * Simple Shader
 * The student should make this more interesting, but the interesting parts
 * might be the fragment shader.
  */

/* pass interpolated variables to the fragment */
varying vec2 v_uv;
uniform sampler2D colormap;
uniform float u_displacementScale; // Uniform to control displacement amount
varying vec3 v_normal; // Varying for view space normal

/* the vertex shader just passes stuff to the fragment shader after doing the
 * appropriate transformations of the vertex information
 */
void main() {
    vec4 texColor = texture2D(colormap, uv); // Get the full RGBA color from the texture
    // Calculate luminance (brightness) using standard weights: https://stackoverflow.com/questions/596216/formula-to-determine-perceived-brightness-of-rgb-color
    float brightness = dot(texColor.rgb, vec3(0.2126, 0.7152, 0.0722));
    float height = brightness; // Use brightness as the height value

    // alter the position by raising it by the height
    // we know the direction from the normal (which should be a unit vector)
    vec3 pos = position + height*normal * u_displacementScale;
    
    // Calculate view space normal and pass it
    v_normal = normalize(normalMatrix * normal);

    // pass the texture coordinate to the fragment
    v_uv = uv;

    // the main output of the shader (the vertex position)
    gl_Position = projectionMatrix * modelViewMatrix * vec4( pos, 1.0 );
}