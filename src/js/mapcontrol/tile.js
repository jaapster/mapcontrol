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
		this._ctx = Context2d.create();
		this._imgData = this._ctx.getImageData(0, 0, size, size);

		this.update(layers);
	}

	get pos(): Position3d {
		return this._pos;
	}

	get imageData(): ?ImageData {
		return this._imgData;
	}

	update(layers: Layer[]) {
		this._layers = layers;

		const key = makeCacheKey(this._pos);

		this._layers.forEach((layer) => {
			layer.on(key, this._renderLayers);
			layer.tile(this._pos);
		});
	}

	@bind
	_renderLayers() {
		this._ctx.clearRect(0, 0, this._size, this._size);

		this._layers.forEach(layer => layer.render(this._pos, this._ctx));
		this._imgData = this._ctx.getImageData(0, 0, this._size, this._size);

		this.trigger(Tile.EVENT.UPDATE);
	}
}
