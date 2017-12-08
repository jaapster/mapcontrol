// @flow

import type { VectorTileLayer } from 'vector-tile';
import type { Context2d } from '../context-2d';

import { translate } from '../translate';
import { DEFAULT_SIZE } from '../constants';

export function renderText(layer: VectorTileLayer, ctx: Context2d, style: Object, size: number = DEFAULT_SIZE) {
	ctx.fillStyle = style.paint.color;
	ctx.font = style.paint.font || '12px sans-serif';
	ctx.textAlign = style.paint.align || 'center';

	const [offsetX, offsetY] = style.paint.offset || [0, 0];

	for (let i = 0; i < layer.length; i += 1) {
		const feature = layer.feature(i);

		if (!style.class || feature.properties.class === style.class) {
			const geo = feature.loadGeometry();

			geo.forEach((subgeo) => {
				ctx.shadowColor = 'black';
				ctx.strokeStyle = 'black';
				ctx.shadowBlur = 5;
				ctx.lineWidth = 2;
				const { x, y } = translate(feature.extent, size)(subgeo[0]);
				ctx.strokeText(feature.properties.name, x + offsetX, y + offsetY);
				ctx.fillText(feature.properties.name, x + offsetX, y + offsetY);
			});
		}
	}

	ctx.shadowBlur = 0;
}
