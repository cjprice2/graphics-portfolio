/* Procedural shading example */
/* the student should make this more interesting */

/* pass interpolated variables to from the vertex */
varying vec2 v_uv;
varying vec3 v_normal;
uniform sampler2D colormap;

// Light properties in view space
const vec3 lightDir = normalize(vec3(0, 0, 1)); // towards the camera
const float ambient = 0.3; // How much ambient light

void main()
{
    vec4 texture_sample = texture2D(colormap, v_uv);
    vec3 texture_color = texture_sample.rgb; // Use the color from the texture

    // Lighting calculation
    vec3 nhat = normalize(v_normal); // Renormalize the normal since it was interpolated
    float diffuse_factor = max(dot(nhat, lightDir), 0.0); // Calculate diffuse lighting factor
    // Combine color and lighting
    vec3 final_color = texture_color * diffuse_factor + texture_color * ambient;
    // Set the fragment color
    final_color = clamp(final_color, 0.0, 1.0); // Ensure color is in [0,1] range
    gl_FragColor = vec4(final_color, texture_sample.a); // Use the alpha from the texture
}
