precision highp float;
varying vec2 vUv;
uniform float time;
uniform vec2 resolution; 

float wave(vec2 p) 
{
    float v = sin(p.x + sin(p.y) + sin(p.y * .43));
    return v * v;
}
const mat2 rot = mat2(.5, .86, -.86, .5);
float map(vec2 p) 
{
    float v = 0.;
    v += wave(p);
    p.x += 0.1;
    p *= rot;
    v += wave(p);
    p.x += 0.1 * .17;
    p *= rot;
    v += wave(p);
    v = abs(1.5 - v);
    return v;
}
void main(void) 
{
    vec2 uv = (vUv.xy * 2. - resolution.xy) / min(resolution.x, resolution.y);
    vec2 p = normalize(vec3(uv.xy, 2.3)).xy * 19.;
    p.y += time * 2.;
    float v = map(p);
    float vs = smoothstep(0.1, 0.4, v); 

    // Define colors
    vec3 green = vec3(0.0, 1.0, 0.0);
    vec3 black = vec3(0.0, 0.0, 0.0);

    // Interpolate between green and black based on the value of vs
    vec3 finalColor = mix(green, black, vs);

    // Assign the mixed color
    gl_FragColor = vec4(finalColor, 1.0);
}

