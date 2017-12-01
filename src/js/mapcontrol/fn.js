import type { Position3d } from './type';

export const hasId = id => obj => obj.id === id;

export function makeCacheKey({ x, y, z }: Position3d) {
	return `${x}_${y}_${z}`;
}

export function makeUrl(template: string, { x, y, z }: Position3d): string {
	return template
		.replace('{x}', x.toString())
		.replace('{y}', y.toString())
		.replace('{z}', z.toString());
}

export function isValidTilePosition({ x, y, z }: Position3d): boolean {
	const tileNum = 2 ** z;
	return x >= 0 && y >= 0 && x < tileNum && y < tileNum;
}
