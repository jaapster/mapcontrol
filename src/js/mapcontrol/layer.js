// @flow

import bind from 'autobind-decorator';
import { Context2d } from './context-2d';
import { Source } from './source';
import { EventEmitter } from './event-emitter';
import { DEFAULT_SIZE } from './constants';
import { makeCacheKey } from './fn';
import { renderVectorData } from './render-vector-data';

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

		this._source.on(Source.EVENT.TILE, this._onVectorTile);

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
		const key = makeCacheKey(pos);
		this._cache[key] = tile;
		this.trigger(key);
	}

	_renderTile({ tile, pos }: VectorTileMessage, buffer: Context2d) {
		this._styles
			.forEach(s =>
				renderVectorData(tile.layers[s.layer], buffer, s, pos.z)
			);
	}

	render(pos: Position3d, ctx: Context2d) {
		const key = makeCacheKey(pos);

		if (this._cache[key]) {
			this._renderTile({ tile: this._cache[key], pos }, ctx);
		}
	}

	tile(pos: Position3d) {
		this._source.loadTile(pos);
	}
}
