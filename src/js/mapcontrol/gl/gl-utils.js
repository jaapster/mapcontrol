// @flow

import { error } from './log';

import type { Dictionary, ProgramInfo, Setters } from './type';

export function loadShader(
	gl: WebGLRenderingContext,
	shaderSource: string,
	shaderType: number,
	optErrorCallback: ?Function
): WebGLShader {
	const errFn = optErrorCallback || error;

	// Create the shader object
	const shader = gl.createShader(shaderType);

	// Load the shader source
	gl.shaderSource(shader, shaderSource);

	// Compile the shader
	gl.compileShader(shader);

	// Check the compile status
	const compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);

	if (!compiled) {
		// Something went wrong during compilation; get the error
		const lastError = gl.getShaderInfoLog(shader);
		errFn('*** Error compiling shader', shader, lastError);
		gl.deleteShader(shader);
		return null;
	}

	return shader;
}

export function createProgram(
	gl: WebGLRenderingContext,
	shaders: WebGLShader[],
	optAttributes: ?string[],
	optLocations: ?number[],
	optErrorCallback: ?Function
): WebGLProgram {
	const errFn = optErrorCallback || error;
	const program = gl.createProgram();

	shaders.forEach((shader) => {
		gl.attachShader(program, shader);
	});

	if (optAttributes) {
		optAttributes.forEach((attribute, ndx) => {
			gl.bindAttribLocation(
				program,
				optLocations ? optLocations[ndx] : ndx,
				attribute
			);
		});
	}

	gl.linkProgram(program);

	// Check the link status
	const linked = gl.getProgramParameter(program, gl.LINK_STATUS);

	if (!linked) {
		// something went wrong with the link
		const lastError = gl.getProgramInfoLog(program);
		errFn('Error in program linking', lastError);

		gl.deleteProgram(program);
		return null;
	}

	return program;
}

export function createProgramFromSources(
	gl: WebGLRenderingContext,
	shaderSources: string[],
	optAttributes: ?string[],
	optLocations: ?number[],
	optErrorCallback: ?Function
): WebGLProgram {
	const shaders = [];

	// assumed order is [vertextShaderSource, fragmentShaderSource];
	shaderSources.forEach((source, i) => {
		const type = i === 0 ? gl.VERTEX_SHADER : gl.FRAGMENT_SHADER;
		shaders.push(loadShader(gl, source, type, optErrorCallback));
	});

	return createProgram(gl, shaders, optAttributes, optLocations, optErrorCallback);
}

/**
 * Returns the corresponding bind point for a given sampler type
 */
export function getBindPointForSamplerType(
	gl: WebGLRenderingContext,
	type: number
): ?number {
	if (type === gl.SAMPLER_2D) {
		return gl.TEXTURE_2D;
	} else if (type === gl.SAMPLER_CUBE) {
		return gl.TEXTURE_CUBE_MAP;
	}

	return undefined;
}

export function createUniformSetters(
	gl: WebGLRenderingContext,
	program: WebGLProgram
): { [string]: Function } {
	let textureUnit = 0;

	/**
	* Creates a setter for a uniform of the given program with it's
	* location embedded in the setter.
	*/
	function createUniformSetter(
		prog: WebGLProgram,
		uniformInfo: Object
	): ?Function {
		const location = gl.getUniformLocation(prog, uniformInfo.name);
		const { type } = uniformInfo;

		// Check if this uniform is an array
		const isArray = (uniformInfo.size > 1 && uniformInfo.name.substr(-3) === '[0]');

		if (type === gl.FLOAT && isArray) {
			return v => gl.uniform1fv(location, v);
		}
		if (type === gl.FLOAT) {
			return v => gl.uniform1f(location, v);
		}
		if (type === gl.FLOAT_VEC2) {
			return v => gl.uniform2fv(location, v);
		}
		if (type === gl.FLOAT_VEC3) {
			return v => gl.uniform3fv(location, v);
		}
		if (type === gl.FLOAT_VEC4) {
			return v => gl.uniform4fv(location, v);
		}
		if (type === gl.INT && isArray) {
			return v => gl.uniform1iv(location, v);
		}
		if (type === gl.INT) {
			return v => gl.uniform1i(location, v);
		}
		if (type === gl.INT_VEC2) {
			return v => gl.uniform2iv(location, v);
		}
		if (type === gl.INT_VEC3) {
			return v => gl.uniform3iv(location, v);
		}
		if (type === gl.INT_VEC4) {
			return v => gl.uniform4iv(location, v);
		}
		if (type === gl.BOOL) {
			return v => gl.uniform1iv(location, v);
		}
		if (type === gl.BOOL_VEC2) {
			return v => gl.uniform2iv(location, v);
		}
		if (type === gl.BOOL_VEC3) {
			return v => gl.uniform3iv(location, v);
		}
		if (type === gl.BOOL_VEC4) {
			return v => gl.uniform4iv(location, v);
		}
		if (type === gl.FLOAT_MAT2) {
			return v => gl.uniformMatrix2fv(location, false, v);
		}
		if (type === gl.FLOAT_MAT3) {
			return v => gl.uniformMatrix3fv(location, false, v);
		}
		if (type === gl.FLOAT_MAT4) {
			return v => gl.uniformMatrix4fv(location, false, v);
		}
		if ((type === gl.SAMPLER_2D || type === gl.SAMPLER_CUBE) && isArray) {
			const _bindPoint = getBindPointForSamplerType(gl, type);

			const units = [];

			for (let i = 0; i < uniformInfo.size; ++i) {
				units.push(textureUnit++);
			}

			if (_bindPoint) {
				return ((bindPoint, _units) => (
					(textures) => {
						gl.uniform1iv(location, _units);
						textures.forEach((texture, index) => {
							gl.activeTexture(gl.TEXTURE0 + _units[index]);
							gl.bindTexture(bindPoint, texture);
						});
					}
				))(_bindPoint, units);
			}

			error('bind point undefined');
		}
		if (type === gl.SAMPLER_2D || type === gl.SAMPLER_CUBE) {
			const _bindPoint = getBindPointForSamplerType(gl, type);

			if (_bindPoint) {
				return ((bindPoint, unit) => (
					(texture) => {
						gl.uniform1i(location, unit);
						gl.activeTexture(gl.TEXTURE0 + unit);
						gl.bindTexture(bindPoint, texture);
					}
				))(_bindPoint, textureUnit++);
			}

			error('bind point undefined');
		}

		error(`unknown type: 0x${type.toString(16)}`);

		return null;
	}

	const uniformSetters = {};
	const numUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);

	for (let i = 0; i < numUniforms; ++i) {
		const uniformInfo = gl.getActiveUniform(program, i);
		if (!uniformInfo) {
			break;
		}
		let { name } = uniformInfo;
		// remove the array suffix.
		if (name.substr(-3) === '[0]') {
			name = name.substr(0, name.length - 3);
		}

		uniformSetters[name] = createUniformSetter(program, uniformInfo);
	}
	return uniformSetters;
}

export function setUniforms(setters: Setters, values: Dictionary<any>) {
	setters = setters.uniformSetters || setters;
	Object.keys(values).forEach((name) => {
		const setter = setters[name];
		if (setter) {
			setter(values[name]);
		}
	});
}

export function createAttributeSetters(gl: WebGLRenderingContext, program: WebGLProgram) {
	const attributeSetters = {};

	const createAttributeSetter = index => (
		(b) => {
			gl.bindBuffer(gl.ARRAY_BUFFER, b.buffer);
			gl.enableVertexAttribArray(index);
			gl.vertexAttribPointer(index, b.numComponents || b.size, b.type || gl.FLOAT, b.normalize || false, b.stride || 0, b.offset || 0);
		}
	);

	const numAttributes = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);

	for (let i = 0; i < numAttributes; ++i) {
		const attributeInfo = gl.getActiveAttrib(program, i);
		if (!attributeInfo) {
			break;
		}
		const index = gl.getAttribLocation(program, attributeInfo.name);
		attributeSetters[attributeInfo.name] = createAttributeSetter(index);
	}

	return attributeSetters;
}

export function setAttributes(setters: Setters, values: Dictionary<any>) {
	setters = setters.attribSetters || setters;
	Object.keys(values).forEach((name) => {
		const setter = setters[name];
		if (setter) {
			setter(values[name]);
		}
	});
}

export function createProgramInfo(
	gl: WebGLRenderingContext,
	shaderSources: string[],
	optAttributes: ?string[],
	optLocations: ?number[],
	optErrorCallback: ?Function
): ProgramInfo {
	const program = createProgramFromSources(gl, shaderSources, optAttributes, optLocations, optErrorCallback);

	if (!program) {
		throw new Error('Unable to create WebGLProgram');
	}

	return {
		program,
		uniformSetters: createUniformSetters(gl, program),
		attributeSetters: createAttributeSetters(gl, program)
	};
}
