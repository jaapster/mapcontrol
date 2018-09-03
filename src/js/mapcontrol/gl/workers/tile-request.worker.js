// @flow

import axios from 'axios';
import ProtoBuf from 'pbf';
import { VectorTile } from './vectortile/vectortile';
import { triangulate, triangulateLine } from '../tessellate';
import styles from '../styles';

import type { VectorTileLayer } from './vectortile/vectortilelayer';

declare var self: DedicatedWorkerGlobalScope;

const token = 'pk.eyJ1IjoiamFhcGwiLCJhIjoiY2l0MTc3c2FxMDA4bDJ1bW51bmpxc2RjbiJ9.KVBQzk0n4K_elY2XJ1jSWQ';
const template = `https://a.tiles.mapbox.com/v4/mapbox.mapbox-terrain-v2,mapbox.mapbox-streets-v7/{z}/{x}/{y}.vector.pbf?access_token=${token}`;

const makeUrl = ([x, y, z]) => (
	template.replace('{x}', x).replace('{y}', y).replace('{z}', z)
);

const layerToContours = (layer: VectorTileLayer, classes: Array<string>) => {
	let c = [];

	for (let i = 0; i < layer.length; i += 1) {
		const f = layer.feature(i);

		if (!classes || !classes.length || classes.includes(f.properties.class)) {
			c = c.concat(f.loadGeometry());
		}
	}

	return c;
};

// $FlowFixMe
self.onmessage = function onmessage(e: { data: Object }) {
	const { pos } = e.data;
	const url = makeUrl(pos);
	const options = { responseType: 'arraybuffer' };

	axios.get(url, options).then((response) => {
		const data = {
			pos,
			layers: styles.reduce((acc, s) => {
				const vt = new VectorTile(new ProtoBuf(response.data));
				const l = vt.layers[s.layer];

				if (l) {
					const contours = layerToContours(l, s.subclass);

					const tri = s.type === 'fill'
						? triangulate(contours)
						: triangulateLine(contours, s.width);

					return acc.concat([{
						id: s.id,
						locations: new Float32Array(tri ? tri.triangleLocations : []),
						indices: new Uint16Array(tri ? tri.triangleIndices : []),
						color: s.color,
						depth: s.depth,
						pos
					}]);
				}

				return acc;
			}, [])
		};

		self.postMessage({ data });
	});
};
