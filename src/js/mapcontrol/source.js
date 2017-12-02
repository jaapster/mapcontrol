// @flow

import bind from 'autobind-decorator';
import Protobuf from 'pbf';
import { VectorTile } from 'vector-tile';
import { EventEmitter } from './event-emitter';
import { makeCacheKey, makeUrl } from './fn';
import TileRequestWorker from './tile-request.worker';

import type { Position3d, SourceProps } from './type';

export class Source extends EventEmitter {
	_id: string;
	_cache: { [string]: any };
	_urls: string[];
	_urlIndex: number;
	_worker: TileRequestWorker;

	static create(props: SourceProps): Source {
		return new Source(props);
	}

	static EVENT = {
		TILE: 'tile'
	};

	constructor(props: SourceProps) {
		super();

		this._id = props.id;
		this._urls = props.tiles;
		this._cache = {};
		this._urlIndex = 0;
		this._worker = new TileRequestWorker();

		this._worker.onmessage = this._onWorkerMessage;
	}

	get id(): string {
		return this._id;
	}

	get server(): string {
		this._urlIndex += 1;

		if (this._urlIndex > this._urls.length - 1) {
			this._urlIndex = 0;
		}

		return this._urls[this._urlIndex];
	}

	@bind
	_onWorkerMessage({ data: { data, pos } }: Object) {
		const key = makeCacheKey(pos);

		this._cache[key] = new VectorTile(new Protobuf(data));

		this.trigger(Source.EVENT.TILE, { pos, tile: this._cache[key] });
	}

	loadTile(pos: Position3d): ?any {
		const key = makeCacheKey(pos);

		if (this._cache[key]) {
			this.trigger(Source.EVENT.TILE, { pos, tile: this._cache[key] });
		} else {
			this._worker.postMessage({ pos, url: makeUrl(this.server, pos) });
		}
	}
}
