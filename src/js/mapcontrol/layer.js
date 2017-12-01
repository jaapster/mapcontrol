// @flow

import { Context2d } from './context-2d';
import { EventEmitter } from './event-emitter';
import { DEFAULT_SIZE } from './constants';
import { makeCacheKey, isValidTilePosition } from './fn';
import { renderVectorData } from './render-vector-data';

import type { Source } from './source';
import type { Position3d, LayerProps, VectorTileMessage } from './type';

export class Layer extends EventEmitter {
	_source: Source;
	_type: string;
	_size: number;
	_cache: { [string]: ?ImageData };
	_styles: Array<Object>;

	static create(props: LayerProps) {
		return new Layer(props);
	}

	constructor(props: LayerProps) {
		super();

		this._source = props.source;
		this._type = props.type;
		this._size = props.size || DEFAULT_SIZE;
		this._styles = props.styles || [];
		this._cache = {};

		this._source.on('vector-tile', this._onVectorTileMessage.bind(this));
	}

	get type(): string {
		return this._type;
	}

	_onVectorTileMessage({ tile, pos }: VectorTileMessage) {
		const buffer = Context2d.create();

		this._styles.forEach(s => renderVectorData(tile.layers[s.layer], buffer, s));
		this._cache[makeCacheKey(pos)] = buffer.getImageData(0, 0, this._size, this._size);

		this.trigger('tile', pos);
	}

	render(pos: Position3d): ?ImageData {
		const key = makeCacheKey(pos);

		if (this._cache[key]) {
			return this._cache[key];
		} else if (isValidTilePosition(pos) && this._styles.length) {
			this._source.getTile(pos);
		}

		return null;
	}
}
