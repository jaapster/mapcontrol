// @flow

import React from 'react';
import { MapControl } from './cp-map-control';

const styles = [
	{
		type: 'fill',
		layer: 'water',
		color: '#888',
		paint: {
			color: '#888'
		}
	}, {
		type: 'fill',
		layer: 'landcover',
		paint: {
			color: '#333'
		}
	},
	{
		type: 'line',
		layer: 'transportation',
		paint: {
			color: '#666'
		}
	},
	{
		type: 'line',
		layer: 'transportation',
		class: 'motorway',
		paint: {
			color: '#000',
			width: 4
		}
	}, {
		type: 'line',
		layer: 'transportation',
		class: 'motorway',
		paint: {
			color: '#cc0',
			width: 2
		}
	}, {
		type: 'line',
		layer: 'transportation',
		class: 'primary',
		paint: {
			color: '#990'
		}
	}, {
		type: 'line',
		layer: 'transportation',
		class: 'secondary',
		paint: {
			color: '#770'
		}
	}, {
		type: 'text',
		layer: 'place',
		class: 'city',
		paint: {
			color: '#fff',
			offset: [0, 25]
		}
	}, {
		type: 'circle',
		layer: 'place',
		class: 'city',
		paint: {
			radius: 6,
			fillColor: '#f00',
			strokeColor: '#fff',
			strokeWidth: 2
		}
	}
];

const CENTER = {
	CAMBRIDGE: [13070.73183676511, -6834081.824921023],
	OXFORD: [-140376.60244572588, -6755389.904301435],
	BERLIN: [1491439.2959003558, -6894161.329153172],
	HONGKONG: [12696725.457365744, -2559188.1440159804]
};

const vectorSourceId = 'vectorSource';

const sources = [
	{
		id: vectorSourceId,
		type: 'vector',
		tiles: [
			'http://localhost:32779/data/v3/{z}/{x}/{y}.pbf'
		]
	}
];

const layers = [
	{
		source: vectorSourceId,
		type: 'vector',
		styles
	}
];

export function App() {
	return (
		<MapControl
			sources={sources}
			layers={layers}
			zoom={11}
			center={CENTER.HONGKONG}
		/>
	);
}
