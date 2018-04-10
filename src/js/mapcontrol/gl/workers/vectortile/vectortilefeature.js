
function readTag(pbf, feature) {
	const end = pbf.readVarint() + pbf.pos;

	while (pbf.pos < end) {
		const key = feature._keys[pbf.readVarint()];
		feature.properties[key] = feature._values[pbf.readVarint()];
	}
}

function readFeature(tag, feature, pbf) {
	if (tag === 1) feature.id = pbf.readVarint();
	else if (tag === 2) readTag(pbf, feature);
	else if (tag === 3) feature.type = pbf.readVarint();
	else if (tag === 4) feature._geometry = pbf.pos;
}

function signedArea(ring): number {
	return ring.reduce((acc, c, i, l) => {
		const j = i === 0 ? l.length - 1 : i - 1;
		return acc + ((ring[j][0] - ring[i][0]) * (ring[i][1] + ring[j][1]));
	}, 0);
}

// classifies an array of rings into polygons with outer rings and holes
function classifyRings(rings) {
	const len = rings.length;

	if (len <= 1) return [rings];

	const polygons = [];

	let polygon;
	let ccw;

	for (let i = 0; i < len; i++) {
		const area = signedArea(rings[i]);
		if (area !== 0) {
			if (ccw === undefined) ccw = area < 0;

			if (ccw === (area < 0)) {
				if (polygon) polygons.push(polygon);
				polygon = [rings[i]];
			} else if (polygon) {
				polygon.push(rings[i]);
			}
		}
	}
	if (polygon) polygons.push(polygon);

	return polygons;
}

export class VectorTileFeature {
	static types = ['Unknown', 'Point', 'LineString', 'Polygon'];

	constructor(pbf, end, extent, keys, values) {
		this.properties = {};
		this.extent = extent;
		this.type = 0;

		this._pbf = pbf;
		this._geometry = -1;
		this._keys = keys;
		this._values = values;

		pbf.readFields(readFeature, this, end);
	}

	loadGeometry() {
		const pbf = this._pbf;
		pbf.pos = this._geometry;

		const end = pbf.readVarint() + pbf.pos;
		const lines = [];

		let cmd = 1;
		let length = 0;
		let x = 0;
		let y = 0;
		let line;

		while (pbf.pos < end) {
			if (!length) {
				const cmdLen = pbf.readVarint();
				cmd = cmdLen & 0x7;
				length = cmdLen >> 3;
			}

			length--;

			if (cmd === 1 || cmd === 2) {
				x += pbf.readSVarint();
				y += pbf.readSVarint();

				if (cmd === 1) {
					// moveTo
					if (line) lines.push(line);
					line = [];
				}

				line.push([x, y]);
			} else if (cmd === 7) {
				// Workaround for https://github.com/mapbox/mapnik-vector-tile/issues/90
				if (line) {
					// closePolygon
					line.push([...line[0]]);
				}
			} else {
				throw new Error(`unknown command ${cmd}`);
			}
		}

		if (line) lines.push(line);

		return lines;
	}

	bbox() {
		const pbf = this._pbf;
		pbf.pos = this._geometry;

		const end = pbf.readVarint() + pbf.pos;

		let	cmd = 1;
		let	length = 0;
		let	x = 0;
		let	y = 0;
		let	x1 = Infinity;
		let	x2 = -Infinity;
		let	y1 = Infinity;
		let	y2 = -Infinity;

		while (pbf.pos < end) {
			if (!length) {
				const cmdLen = pbf.readVarint();
				cmd = cmdLen & 0x7;
				length = cmdLen >> 3;
			}

			length--;

			if (cmd === 1 || cmd === 2) {
				x += pbf.readSVarint();
				y += pbf.readSVarint();
				if (x < x1) x1 = x;
				if (x > x2) x2 = x;
				if (y < y1) y1 = y;
				if (y > y2) y2 = y;
			} else if (cmd !== 7) {
				throw new Error(`unknown command ${cmd}`);
			}
		}

		return [x1, y1, x2, y2];
	}

	toGeoJSON(x: number, y: number, z: number) {
		const size = this.extent * (2 ** z);
		const x0 = this.extent * x;
		const y0 = this.extent * y;
		const type = VectorTileFeature.types[this.type];

		function proj(line) {
			if (!Array.isArray(line[0])) {
				const y2 = 180 - (((line[0][1] + y0) * 360) / size);

				return [
					(((line[0][0] + x0) * 360) / size) - 180,
					((360 / Math.PI) * Math.atan(Math.exp((y2 * Math.PI) / 180))) - 90
				];
			}

			return line.map(proj);
		}

		let coords = this.loadGeometry();

		if (type === 1) {
			coords = proj(coords.map(([p]) => p));
		} else if (type === 2) {
			coords = proj(coords);
		} else if (type === 3) {
			coords = proj(classifyRings(coords));
		}

		const isMulti = coords.length > 1;

		const result = {
			type: 'Feature',
			geometry: {
				type: isMulti ? `Multi${type}` : type,
				coordinates: isMulti ? coords : coords[0]
			},
			properties: this.properties
		};

		if ('id' in this) {
			result.id = this.id;
		}

		return result;
	}
}
