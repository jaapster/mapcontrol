import mat4 from 'gl-mat4';
import { createProgram } from './create-program';
import { initArrayBuffer } from './init-array-buffer';

import vertexShaderSource from './shaders/vertex-shader.glsl';
import fragmentShaderSource from './shaders/fragment-shader.glsl';

function radians(degrees: number): number {
	return degrees * (Math.PI / 180);
}

function drawScene(gl, programInfo, buffers) {
	// Clear to black, fully opaque
	gl.clearColor(0.0, 0.0, 0.0, 1.0);

	// Clear everything
	gl.clearDepth(1.0);

	// Enable depth testing
	gl.enable(gl.DEPTH_TEST);

	// Near things obscure far things
	gl.depthFunc(gl.LEQUAL);

	// Clear the canvas before we start drawing on it.
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	// Create a perspective matrix, a special matrix that is
	// used to simulate the distortion of perspective in a camera.
	// Our field of view is 45 degrees, with a width/height
	// ratio that matches the display size of the canvas
	// and we only want to see objects between 0.1 units
	// and 100 units away from the camera.
	const fieldOfView = radians(45);
	const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
	const zNear = 0.1;
	const zFar = 100.0;
	const projectionMatrix = mat4.create();

	// note: glmatrix.js always has the first argument
	// as the destination to receive the result.
	mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);

	// Set the drawing position to the "identity" point, which is
	// the center of the scene.
	const modelViewMatrix = mat4.create();

	// Now move the drawing position a bit to where we want to
	// start drawing the square.
	const destinationMatrix = modelViewMatrix;
	const sourceMatrix = modelViewMatrix;
	const translationAmount = [-0.0, 0.0, -6.0];

	mat4.translate(destinationMatrix, sourceMatrix, translationAmount);

	// Tell WebGL how to pull out the positions from the position
	// buffer into the vertexPosition attribute.
	const numComponents = 2;
	const type = gl.FLOAT;
	const normalize = false;
	const stride = 0;
	const offsetA = 0;

	gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
	gl.vertexAttribPointer(
		programInfo.attribLocations.vertexPosition,
		numComponents,
		type,
		normalize,
		stride,
		offsetA
	);
	gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);

	// Tell WebGL to use our program when drawing
	gl.useProgram(programInfo.program);

	// Set the shader uniforms
	gl.uniformMatrix4fv(
		programInfo.uniformLocations.projectionMatrix,
		false,
		projectionMatrix
	);

	gl.uniformMatrix4fv(
		programInfo.uniformLocations.modelViewMatrix,
		false,
		modelViewMatrix
	);

	const offsetB = 0;
	const vertexCount = 4;

	gl.drawArrays(gl.TRIANGLE_STRIP, offsetB, vertexCount);
}

function main(canvas) {
	// const canvas = document.querySelector('#glcanvas');
	const gl = canvas.getContext('webgl');

	// If we don't have a GL context, give up now

	if (!gl) {
		console.warn('Unable to initialize WebGL.');
		return;
	}
	// Initialize a shader program; this is where all the lighting
	// for the vertices and so forth is established.
	const shaderProgram = createProgram(gl, vertexShaderSource, fragmentShaderSource);

	// Collect all the info needed to use the shader program.
	// Look up which attribute our shader program is using
	// for aVertexPosition and look up uniform locations.
	const programInfo = {
		program: shaderProgram,
		attribLocations: {
			vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition')
		},
		uniformLocations: {
			projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
			modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix')
		}
	};

	const positions = [
		1.0, 0.0,
		-1.0, 1.0,
		1.0, -1.0,
		-1.0, -1.0
	];

	// Here's where we call the routine that builds all the
	// objects we'll be drawing.
	const buffers = initArrayBuffer(gl, positions);

	// Draw the scene
	drawScene(gl, programInfo, buffers);
}

export default {
	main
};
