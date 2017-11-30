// @flow

import { Context2d } from './context-2d';
import { DEFAULT_SIZE } from './constants';
import { makeCacheKey, isValidTilePosition } from './fn';
import { renderVectorData } from './render-vector-data';

import type { Source } from './source';
import type { Position3d } from './type';

export type LayerProps = {
	source: Source,
	type: string,
	size?: number,
	styles?: Array<Object>
}

export class Layer {
	_source: Source;
	_type: string;
	_buffer: Context2d;
	_size: number;
	_cache: { [string]: ?ImageData };
	_styles: Array<Object>;

	static create(props: LayerProps) {
		return new Layer(props);
	}

	constructor(props: LayerProps) {
		this._source = props.source;
		this._type = props.type;
		this._buffer = Context2d.create();
		this._size = props.size || DEFAULT_SIZE;
		this._styles = props.styles || [];
		this._cache = {};
	}

	get type(): string {
		return this._type;
	}

	async render(pos: Position3d) {
		const { x, y, z } = pos;
		const key = makeCacheKey(x, y, z);

		if (!this._cache[key]) {
			const buffer = Context2d.create();

			// check if the tile position exists at the detail level ...
			if (isValidTilePosition(pos)) {
				if (this._type === 'raster') {
					buffer.drawImage(await this._source.getTile(x, y, z), 0, 0);
				} else if (this._styles.length) {
					const vectorTile = await this._source.getTile(x, y, z);
					this._styles.forEach((style) => {
						renderVectorData(vectorTile.layers[style.layer], buffer, style);
					});
				}
			}

			this._cache[key] = buffer.getImageData(0, 0, this._size, this._size);
		}

		return this._cache[key];
	}
}
