// @flow

import bind from 'autobind-decorator';
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
	_empty: ?ImageData;

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

		this._source.on('vector-tile', this._onVectorTile);

		const buffer = Context2d.create();

		buffer.fillStyle = '#000';
		buffer.fillRect(0, 0, this._size, this._size);

		this._empty = buffer.getImageData(0, 0, this._size, this._size);
	}

	get type(): string {
		return this._type;
	}

	@bind
	_onVectorTile({ tile, pos }: VectorTileMessage) {
		this._renderTile({ tile, pos });
		this.trigger('tile', pos);
	}

	_renderTile({ tile, pos }: VectorTileMessage) {
		const buffer = Context2d.create();
		const key = makeCacheKey(pos);

		this._styles
			.forEach(s =>
				renderVectorData(tile.layers[s.layer], buffer, s, pos.z)
			);

		this._cache[key] = buffer.getImageData(0, 0, this._size, this._size);
	}

	render(pos: Position3d): ?ImageData {
		const key = makeCacheKey(pos);

		if (this._cache[key]) {
			return this._cache[key];
		}

		if (pos.z > 14) {
			console.log('overzoom!'); // todo: remove
			return null;
		}

		if (pos.z < 0) {
			console.log('underzoom!'); // todo: remove
			return null;
		}

		if (isValidTilePosition(pos) && this._styles.length) {
			const tile = this._source.getTile(pos);

			if (tile) {
				this._renderTile({ tile, pos });
				return this._cache[key];
			}
		}

		return null;
	}
}
