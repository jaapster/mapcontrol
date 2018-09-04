// @flow

import T from 'tesspathy';

import type { Tessellation, Contours } from '../types/type';

const S = [T.PATH_START];
const A = [T.PATH_ANCHOR];

const prepare = (c: Contours = []) => c.reduce(([a, b], contour) => ([
	a.concat(contour),
	b.concat(contour.map((e, i) => (i ? A : S)))
]), [[], []]);

export const triangulate = (c: Contours): Tessellation => {
	const [loc, lab] = prepare(c);

	return T.triangulate(loc, lab);
};

export const triangulateLine = (c: Contours, width: number): Tessellation => {
	const [loc, lab] = prepare(c);
	return T.triangulateLine(loc, lab, { width });
};
