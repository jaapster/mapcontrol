// @flow

import type { Position2d } from './type';

export const translate = (extent: number, dim: number) => ({ x, y }: Position2d) => ({
	x: ((x / extent) * dim),
	y: ((y / extent) * dim)
});
