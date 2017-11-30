// @flow

import type { Position2d } from './type';

export const translate = (extent: number, dim: number) => ({ x, y }: Position2d) => ({
	x: ((x / extent) * dim) + 0.5,
	y: ((y / extent) * dim) + 0.5
});
