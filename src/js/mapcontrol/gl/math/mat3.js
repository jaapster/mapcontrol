// @flow

import type { Mat3 } from '../type';

export const mat3 = {
	translation(x: number, y: number): Mat3 {
		return [
			1, 0, 0,
			0, 1, 0,
			x, y, 1
		];
	},

	rotation(rad: number): Mat3 {
		const c = Math.cos(rad);
		const s = Math.sin(rad);
		const t = -s;

		return [
			c, t, 0,
			s, c, 0,
			0, 0, 1
		];
	},

	scaling(x: number, y: number): Mat3 {
		return [
			x, 0, 0,
			0, y, 0,
			0, 0, 1
		];
	},

	identity(): Mat3 {
		return [
			1, 0, 0,
			0, 1, 0,
			0, 0, 1
		];
	}
};
