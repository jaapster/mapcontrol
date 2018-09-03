// @flow

import * as utils from './gl-utils';
import { mat3 } from './math/mat3';

// $FlowFixMe
import vsSrc from './shaders/vertex-shader.glsl';
// $FlowFixMe
import fsSrc from './shaders/fragment-shader.glsl';

import type { ProgramInfo, DrawInfo } from './type';

export class Renderer {
	_gl: WebGLRenderingContext;
	_info: ProgramInfo;

	static create(gl: WebGLRenderingContext): Renderer {
		return new Renderer(gl);
	}

	constructor(gl: WebGLRenderingContext) {
		this._gl = gl;
		this._info = utils.createProgramInfo(gl, [vsSrc, fsSrc]);

		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer());
		gl.useProgram(this._info.program);
		gl.enable(gl.DEPTH_TEST);

		utils.setAttributes(this._info.attributeSetters, {
			a_position: {
				buffer: gl.createBuffer(),
				numComponents: 2
			}
		});
	}

	draw({
		locations,
		indices,
		color,
		depth,
		offset,
		rotation,
		extent,
		size
	}: DrawInfo): void {
		const gl = this._gl;

		utils.setUniforms(this._info.uniformSetters, {
			u_size: size,
			u_color: color,
			u_depth: depth,
			u_offset: offset,
			u_extent: extent,
			u_matrix: mat3.rotation(rotation),
			u_resolution: [gl.canvas.width, gl.canvas.height]
		});

		gl.bufferData(gl.ARRAY_BUFFER, locations, gl.STATIC_DRAW);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
		gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
	}
}
