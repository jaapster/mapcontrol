// @flow

import type { VectorTileLayer } from 'vector-tile';

import { renderFill } from './render-fill';
import { renderLine } from './render-line';
import { renderCircle } from './render-circle';
import { renderText } from './render-text';
import { DEFAULT_SIZE } from '../constants';

import type { Context2d } from '../context-2d';

export function renderVectorData(layer: VectorTileLayer, ctx: Context2d, style: Object, zoom: number, size: number = DEFAULT_SIZE) {
	const { min, max } = style;

	if (layer && (!min || min <= zoom) && (!max || max >= zoom)) {
		if (style.type === 'text') {
			renderText(layer, ctx, style, size);
		} else if (style.type === 'fill') {
			renderFill(layer, ctx, style, size);
		} else if (style.type === 'line') {
			renderLine(layer, ctx, style, size);
		} else if (style.type === 'circle') {
			renderCircle(layer, ctx, style, size);
		}
	}
}
