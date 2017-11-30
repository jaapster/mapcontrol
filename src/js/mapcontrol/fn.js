import type { Position3d } from './type';

export const hasId = id => obj => obj.id === id;

export function makeCacheKey(x: number, y: number, z: number) {
	return `${x}_${y}_${z}`;
}

export function isValidTilePosition({ x, y, z }: Position3d): boolean {
	const tileNum = 2 ** z;
	return x >= 0 && y >= 0 && x < tileNum && y < tileNum;
}
