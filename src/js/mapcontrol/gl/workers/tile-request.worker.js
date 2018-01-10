// @flow

import axios from 'axios';
import Protobuf from 'pbf';
import { VectorTile } from 'vector-tile';
import { triangulate, triangulateLine } from '../tessellate';
import styles from '../styles';

const template = 'https://a.tiles.mapbox.com/v4/mapbox.mapbox-terrain-v2,mapbox.mapbox-streets-v7/{z}/{x}/{y}.vector.pbf?access_token=pk.eyJ1IjoiamFhcGwiLCJhIjoiY2l0MTc3c2FxMDA4bDJ1bW51bmpxc2RjbiJ9.KVBQzk0n4K_elY2XJ1jSWQ';

function makeUrl([x, y, z]) {
	return template
		.replace('{x}', x.toString())
		.replace('{y}', y.toString())
		.replace('{z}', z.toString());
}

const layerToContoures = (layer, cls) => {
	let c = [];

	for (let i = 0; i < layer.length; i += 1) {
		const f = layer.feature(i);

		if (!cls || !cls.length || cls.includes(f.properties.class)) {
			c = c.concat(f.loadGeometry());
		}
	}

	return c;
};

onmessage = function onmessage(e) {
	const { pos } = e.data;
	const url = makeUrl(pos);
	const options = { responseType: 'arraybuffer' };

	axios.get(url, options).then((response) => {
		const data = {
			pos,
			layers: styles.reduce((acc, s) => {
				const l = (new VectorTile(new Protobuf(response.data))).layers[s.layer];

				if (l) {
					const contours = layerToContoures(l, s.subclass).map(c => c.map(p => [p.x, p.y]));

					const tri = s.type === 'fill'
						? triangulate(contours)
						: triangulateLine(contours, s.width);

					return acc.concat([{
						id: s.id,
						// vertices: tri,
						locations: tri ? new Float32Array(tri.triangleLocations) : [],
						indices: tri ? new Uint16Array(tri.triangleIndices) : [],
						color: s.color,
						depth: s.depth,
						pos
					}]);
				}

				return acc;
			}, [])
		};

		// $FlowFixMe
		postMessage({ data });

		// close();
	});
};
