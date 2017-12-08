// @flow

export type BufferData = {
	position: WebGLBuffer
}

// Initialize the buffers we'll need. For this demo, we just
// have one object -- a simple two-dimensional square.
export function initArrayBuffer(gl: WebGLRenderingContext, positions: Array<number>): BufferData {
	// Create a buffer for the positions.
	const positionBuffer = gl.createBuffer();

	// Select the positionBuffer as the one to apply buffer
	// operations to from here out.
	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

	// Now pass the list of positions into WebGL to build the
	// shape. We do this by creating a Float32Array from the
	// JavaScript array, then use it to fill the current buffer.
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

	return {
		position: positionBuffer
	};
}
