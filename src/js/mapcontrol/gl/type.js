

export type Dictionary<T> = { [string]: T };

export type Setters = Dictionary<Function>;

export type ProgramInfo = {
	program: WebGLProgram,
	uniformSetters: Setters,
	attributeSetters: Setters
}

export type Point2 = { x: number, y: number };
export type Point3 = { x: number, y: number, z: number };

export type Vec2 = [number, number];
export type Vec3 = [number, number, number];
export type Vec4 = [number, number, number, number];

export type Mat3 = [
	number, number, number,
	number, number, number,
	number, number, number
];

export type Tessalation = {
	triangleLocations: Array<number>,
	triangleIndices: Array<number>
};

export type DrawInfo = {
	locations: Float32Array,
	indices: Uint16Array,
	color: Vec4,
	offset: Vec2,
	depth: number,
	rotation: number,
	extent: number,
	size: number
}
