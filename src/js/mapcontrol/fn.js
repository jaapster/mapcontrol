// @flow

import type { Position3d } from './type';

export const hasId = (id: string) => (obj: Object) => obj.id === id;

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

export function isSamePosition(a: Position3d, b: Position3d) {
	return a.x === b.x && a.y === b.y && a.z === b.z;
}

export function debounce(f: Function, interval: number, immediate: ?boolean) {
	let timeout;
	return (...args: any) => {
		const later = () => {
			timeout = null;
			if (!immediate) {
				f(...args);
			}
		};

		const callNow = immediate && !timeout;

		clearTimeout(timeout);

		timeout = setTimeout(later, interval);

		if (callNow) {
			f(...args);
		}
	};
}

export function throttle(f: Function, interval: number) {
	let timeout;
	return (...args: any) => {
		if (!timeout) {
			console.log('execute'); // todo: remove
			f(...args);
			timeout = setTimeout(() => {
				timeout = null;
			}, interval);
		}
	}
}
