// @flow

import axios from 'axios';
import Protobuf from 'pbf';
import { VectorTile } from 'vector-tile';
import { makeCacheKey } from './fn';

export type SourceType = 'raster';

export type SourceProps = {
	id: string,
	type: SourceType,
	tiles: string[]
}

function makeUrl(template: string, x: number, y: number, z: number): string {
	return template
		.replace('{x}', x.toString())
		.replace('{y}', y.toString())
		.replace('{z}', z.toString());
}

export class Source {
	_id: string;
	_type: SourceType;
	_cache: { [string]: any };
	_servers: string[];
	_serverIndex: number;

	static create(props: SourceProps): Source {
		return new Source(props);
	}

	constructor(props: SourceProps) {
		this._id = props.id;
		this._type = props.type;
		this._servers = props.tiles;
		this._cache = {};
		this._serverIndex = 0;
	}

	get currentServer(): string {
		this._serverIndex += 1;

		if (this._serverIndex > this._servers.length - 1) {
			this._serverIndex = 0;
		}

		return this._servers[this._serverIndex];
	}

	async getTile(x: number, y: number, z: number): Promise<any> {
		const key = makeCacheKey(x, y, z);

		if (!this._cache[key]) {
			if (this._type === 'raster') {
				const img = new Image();

				img.crossOrigin = 'Anonymous';
				img.src = makeUrl(this.currentServer, x, y, z);

				this._cache[key] = await new Promise((resolve) => {
					img.onload = () => resolve(img);
				});
			} else if (this._type === 'vector') {
				const pbf = await axios.get(makeUrl(this.currentServer, x, y, z), {
					responseType: 'arraybuffer'
				});

				this._cache[key] = new VectorTile(new Protobuf(pbf.data));
			}
		}

		return this._cache[key];
	}

	hasTile(x: number, y: number, z: number): boolean {
		return !!this._cache[makeCacheKey(x, y, z)];
	}

	get id(): string {
		return this._id;
	}
}
