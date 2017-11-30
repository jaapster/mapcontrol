// @flow

import type { VectorTileLayer } from 'vector-tile';
import type { Context2d } from './context-2d';

import { translate } from './translate';

export function renderFill(layer: VectorTileLayer, ctx: Context2d, style: Object) {
	ctx.fillStyle = style.paint.color;

	ctx.beginPath();

	for (let featureIndex = 0; featureIndex < layer.length; featureIndex += 1) {
		const feature = layer.feature(featureIndex);

		if (!style.class || feature.properties.class === style.class) {
			const geo = feature.loadGeometry();

			geo.forEach((subgeo) => {
				subgeo
					.map(translate(feature.extent, 256))
					.forEach(({ x, y }, pointIndex) => {
						if (!pointIndex) {
							ctx.moveTo(x, y);
						} else {
							ctx.lineTo(x, y);
						}
					});
			});
		}
	}

	ctx.fill();
}
