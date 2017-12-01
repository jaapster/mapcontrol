// @flow

import Protobuf from 'pbf';
import { VectorTile } from 'vector-tile';
import { EventEmitter } from './event-emitter';
import { makeCacheKey, makeUrl } from './fn';
import TileRequestWorker from './tile-request.worker';

import type { Position3d, SourceProps } from './type';

export class Source extends EventEmitter {
	_id: string;
	_type: string;
	_cache: { [string]: any };
	_servers: string[];
	_serverIndex: number;
	_worker: TileRequestWorker;

	static create(props: SourceProps): Source {
		return new Source(props);
	}

	constructor(props: SourceProps) {
		super();

		this._id = props.id;
		this._type = props.type;
		this._servers = props.tiles;
		this._cache = {};
		this._serverIndex = 0;
		this._worker = new TileRequestWorker();

		this._worker.onmessage = this._onWorkerMessage.bind(this);
	}

	get id(): string {
		return this._id;
	}

	get currentServer(): string {
		this._serverIndex += 1;

		if (this._serverIndex > this._servers.length - 1) {
			this._serverIndex = 0;
		}

		return this._servers[this._serverIndex];
	}

	_onWorkerMessage({ data: { data, pos } }: Object) {
		const key = makeCacheKey(pos);

		this._cache[key] = new VectorTile(new Protobuf(data));
		this.trigger('vector-tile', { pos, tile: this._cache[key] });
	}

	async getTile(pos: Position3d): ?any {
		const key = makeCacheKey(pos);

		if (this._cache[key]) {
			return this._cache[key];
		}

		this._worker.postMessage({
			pos,
			url: makeUrl(this.currentServer, pos)
		});

		return null;
	}
}
