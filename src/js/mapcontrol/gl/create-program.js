// @flow

import { createShader } from './create-shader';

// Initialize a shader program, so WebGL knows how to draw our data
export function createProgram(gl: WebGLRenderingContext, vertexShaderSrc: string, fragmentShaderSrc: string): WebGLProgram {
	const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSrc);
	const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSrc);

	const program = gl.createProgram();

	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);
	gl.linkProgram(program);

	const success = gl.getProgramParameter(program, gl.LINK_STATUS);

	if (success) {
		return program;
	}

	console.warn(gl.getProgramInfoLog(program));

	return null;
}
