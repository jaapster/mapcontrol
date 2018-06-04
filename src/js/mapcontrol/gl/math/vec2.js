// @flow

import type { Vec2 } from '../type';

export const vec2 = {
	rotate([x, y]: Vec2, rad: number): Vec2 {
		return [
			(x * Math.cos(rad)) - (y * Math.sin(rad)),
			(x * Math.sin(rad)) + (y * Math.cos(rad))
		];
	},

	mult([x, y]: Vec2, f: Vec2 | number): Vec2 {
		if (typeof f === 'number') {
			return [
				x * f,
				y * f
			];
		}

		return [
			x * f[0],
			y * f[1]
		];
	},

	div([x, y]: Vec2, f: Vec2 | number): Vec2 {
		if (typeof f === 'number') {
			return [
				x / f,
				y / f
			];
		}

		return [
			x / f[0],
			y / f[1]
		];
	},

	add([x, y]: Vec2, f: Vec2 | number): Vec2 {
		if (typeof f === 'number') {
			return [
				x / f,
				y / f
			];
		}

		return [
			x + f[0],
			y + f[1]
		];
	},

	sub([x, y]: Vec2, f: Vec2 | number): Vec2 {
		if (typeof f === 'number') {
			return [
				x / f,
				y / f
			];
		}

		return [
			x - f[0],
			y - f[1]
		];
	}
};
