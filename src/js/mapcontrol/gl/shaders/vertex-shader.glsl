precision mediump float;

attribute vec2 a_position;
uniform float u_depth;
uniform vec2 u_resolution;
uniform vec2 u_offset;
uniform float u_extent;
uniform float u_size;
uniform mat3 u_matrix;

void main() {
	vec2 zeroToOne = (((a_position / u_extent) * u_size) + u_offset) / u_resolution;
	vec2 zeroToTwo = zeroToOne * 2.0;
	vec2 clipSpace = zeroToTwo - 1.0;
	vec2 flipped = clipSpace * vec2(1, -1);

	gl_Position = vec4(u_matrix * vec3(flipped, u_depth), 1);
}
