uniform float uTime;
uniform float uSpeed;
uniform float uTravelLength;

attribute vec3 aOffset;
attribute vec2 aMetrics;
#include <getDistortion_vertex>

void main() {
    vec3 transformed = position.xyz;
    float radius = aMetrics.r;
    float len = aMetrics.g;

    transformed.xy *= radius;
    transformed.z *= len;

    float zOffset = uTime * uSpeed + aOffset.z;
    zOffset =  len - mod(zOffset, uTravelLength);

    // transformed.z += zOffset;
    transformed.z = transformed.z + zOffset;
    transformed.xy += aOffset.xy;

    float progress = abs(transformed.z / uTravelLength);
    transformed.xyz += getDistortion(progress);

    vec4 modelViewPosition = modelViewMatrix * vec4(transformed, 1.0);
    gl_Position = projectionMatrix * modelViewPosition; 
}