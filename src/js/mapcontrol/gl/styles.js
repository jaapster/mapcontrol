import type { Vec4 } from '../../mapcontrol/gl/type';

const rgbToDec = (r: number, g: number, b: number): Vec4 => (
	[r / 255, g / 255, b / 255, 1]
);

export default [
	{
		type: 'fill',
		id: 'water',
		layer: 'water',
		subclass: [],
		color: rgbToDec(108, 167, 238),
		depth: 0.2
	},
	{
		type: 'fill',
		id: 'parks',
		layer: 'landuse',
		subclass: ['park'],
		color: rgbToDec(181, 229, 162),
		depth: 0.3
	},
	{
		type: 'fill',
		id: 'schools',
		layer: 'landuse',
		subclass: ['school'],
		color: rgbToDec(229, 221, 186),
		depth: 0.4
	},
	{
		type: 'fill',
		id: 'crop',
		layer: 'landcover',
		subclass: ['crop'],
		color: rgbToDec(238, 228, 218),
		depth: 0.5
	},
	{
		type: 'line',
		id: 'road-casing',
		layer: 'road',
		subclass: ['motorway', 'trunk'],
		color: rgbToDec(255, 255, 255),
		depth: 0.11,
		width: 40
	},
	{
		type: 'line',
		id: 'road',
		layer: 'road',
		subclass: ['motorway', 'trunk'],
		color: rgbToDec(255, 200, 0),
		depth: 0.1,
		width: 20
	},
	// {
	// 	type: 'line',
	// 	id: 'road',
	// 	layer: 'road',
	// 	subclass: ['primary'],
	// 	color: rgbToDec(255, 200, 0),
	// 	depth: 0.011,
	// 	width: 6
	// },
	// {
	// 	type: 'line',
	// 	id: 'road',
	// 	layer: 'road',
	// 	subclass: ['secondary', 'tertiary'],
	// 	color: rgbToDec(255, 200, 0),
	// 	depth: 0.03,
	// 	width: 4
	// },
	{
		type: 'fill',
		id: 'building',
		layer: 'building',
		subclass: [],
		color: rgbToDec(209, 201, 166),
		depth: 0.03,
		width: 4
	}
];
