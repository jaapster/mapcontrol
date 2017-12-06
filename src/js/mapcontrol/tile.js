// @flow

import bind from 'autobind-decorator';
import { EventEmitter } from './event-emitter';
import { Context2d } from './context-2d';
import { Layer } from './layer';
import { makeCacheKey } from './fn';

import type { Position3d } from './type';

export class Tile extends EventEmitter {
	_pos: Position3d;
	_ctx: Context2d;
	_layers: Array<Layer>;
	_imgData: ?ImageData;
	_size: number;
	_cache: { [string]: any };

	static EVENT = {
		UPDATE: 'update'
	};

	static create(pos: Position3d, size: number, layers: Layer[]) {
		return new Tile(pos, size, layers);
	}

	constructor(pos: Position3d, size: number, layers: Layer[]) {
		super();

		this._pos = pos;
		this._size = size;
		this._imgData = null;
		this._cache = {};

		this.update(layers);
	}

	get pos(): Position3d {
		return this._pos;
	}

	get imageData(): ?ImageData {
		if (this._imgData) {
			return this._imgData;
		} else if (this._ready) {
			this._layers.forEach(l => l.tile(this._pos));
		}

		return null;
	}

	flush() {
		this._imgData = null;
		this._cache = {};
		const key = makeCacheKey(this._pos);
		this._layers.forEach(l => l.off(key, this._renderLayers));
	}

	update(layers: Layer[]) {
		this._layers = layers;
		this._ready = false;

		const key = makeCacheKey(this._pos);

		this._layers.forEach((l) => {
			l.on(key, this._renderLayers);
			l.tile(this._pos);
		});
	}

	@bind
	_renderLayers(tile: any) {
		// TODO: store most recent tile for each layer and use those
		this._ready = true;
		const ctx = Context2d.create();

		ctx.fillRect(0, 0, this._size, this._size);

		this._layers.forEach(l => l.render(this._pos, ctx, tile));
		this._imgData = ctx.getImageData(0, 0, this._size, this._size);

		this.trigger(Tile.EVENT.UPDATE, this._pos);
	}
}
