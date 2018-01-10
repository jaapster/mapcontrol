// @flow

import T from 'tesspathy';

type Contours = number[][];

const S = [T.PATH_START];
const A = [T.PATH_ANCHOR];

const prepare = (contours: Contours = []) => (
	contours.reduce(([a, b], contour) => ([
		a.concat(contour),
		b.concat(contour.map((e, i) => (i ? A : S)))
	]), [[], []])
);

export const triangulate = (contours: Contours) => {
	const [loc, lab] = prepare(contours);
	return T.triangulate(loc, lab);
};

export const triangulateLine = (contours: Contours, width: number) => {
	const [loc, lab] = prepare(contours);
	return T.triangulateLine(loc, lab, { width });
};
