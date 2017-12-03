/* eslint-disable */
import axios from 'axios';
import Protobuf from 'pbf';
import { VectorTile } from 'vector-tile';

onmessage = function(e) {
	const { pos, url } = e.data;

	axios.get(url, {
		responseType: 'arraybuffer'
	}).then((response) => {
		postMessage({
			pos,
			data: response.data
		});
	});
}
