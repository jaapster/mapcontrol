// @flow

import type { VectorTileLayer } from 'vector-tile';
import type { Context2d } from './context-2d';

import { translate } from './translate';
import { DEFAULT_SIZE } from './constants';

export function renderCircle(layer: VectorTileLayer, ctx: Context2d, style: Object) {
	ctx.beginPath();

	const r = style.paint.radius;

	for (let i = 0; i < layer.length; i += 1) {
		const feature = layer.feature(i);

		if (!style.class || feature.properties.class === style.class) {
			const geo = feature.loadGeometry();

			geo.forEach((subgeo) => {
				const { x, y } = translate(feature.extent, DEFAULT_SIZE)(subgeo[0]);

				ctx.moveTo(x + r, y);
				ctx.arc(x, y, r, 0, 2 * Math.PI, false);
			});
		}
	}

	if (style.paint.fillColor) {
		ctx.fillStyle = style.paint.fillColor;
		ctx.fill();
	}

	if (style.paint.strokeColor) {
		ctx.strokeStyle = style.paint.strokeColor;
		ctx.lineWidth = style.paint.strokeWidth || 1;
		ctx.stroke();
	}
}
