import { VectorTileFeature } from './vectortilefeature';

function processTag(tag, pbf) {
	switch (tag) {
		case 1: return pbf.readString();
		case 2: return pbf.readFloat();
		case 3: return pbf.readDouble();
		case 4: return pbf.readVarint64();
		case 5: return pbf.readVarint();
		case 6: return pbf.readSVarint();
		case 7: return pbf.readBoolean();
		default: return null;
	}
}

function readValueMessage(pbf) {
	let value = null;
	const end = pbf.readVarint() + pbf.pos;

	while (pbf.pos < end) {
		const tag = pbf.readVarint() >> 3;
		value = processTag(tag, pbf);
	}

	return value;
}

function readLayer(tag, layer, pbf) {
	if (tag === 15) layer.version = pbf.readVarint();
	else if (tag === 1) layer.name = pbf.readString();
	else if (tag === 5) layer.extent = pbf.readVarint();
	else if (tag === 2) layer._features.push(pbf.pos);
	else if (tag === 3) layer._keys.push(pbf.readString());
	else if (tag === 4) layer._values.push(readValueMessage(pbf));
}

export class VectorTileLayer {
	constructor(pbf, end) {
		this.version = 1;
		this.name = null;
		this.extent = 4096;
		this.length = 0;

		this._pbf = pbf;
		this._keys = [];
		this._values = [];
		this._features = [];

		pbf.readFields(readLayer, this, end);

		this.length = this._features.length;
	}

	feature(i) {
		if (i < 0 || i >= this._features.length) throw new Error('feature index out of bounds');

		this._pbf.pos = this._features[i];

		const end = this._pbf.readVarint() + this._pbf.pos;
		return new VectorTileFeature(this._pbf, end, this.extent, this._keys, this._values);
	}
}
