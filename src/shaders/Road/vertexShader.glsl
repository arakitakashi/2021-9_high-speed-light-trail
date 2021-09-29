uniform float uTravelLength;
#include <getDistortion_vertex>

void main() {
    vec3 transformed = position.xyz;

    float progress = (transformed.y + uTravelLength / 2.) / uTravelLength;
    vec3 distortion = getDistortion(progress);
    transformed.x += distortion.x;
    transformed.z += distortion.y;

    vec4 modelViewPosition = modelViewMatrix * vec4(transformed.xyz, 1.0);
    gl_Position = projectionMatrix * modelViewPosition; 
}