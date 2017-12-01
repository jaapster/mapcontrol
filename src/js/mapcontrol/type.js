
import type { VectorTile } from 'vector-tile';
import type { Source } from './source';

export type Coordinate = [number, number];

export type Position2d = {
	x: number,
	y: number
}

export type Position3d = {
	x: number,
	y: number,
	z: number
}

export type SourceProps = {
	id: string,
	type: string,
	tiles: string[]
}

export type LayerProps = {
	source: Source,
	type: string,
	size?: number,
	styles?: Array<Object>,
	onTileLoaded: Function
}

export type VectorTileMessage = {
	tile: VectorTile,
	pos: Position3d
}
export type SourceData = {
	id: string,
	type: string,
	tiles: string[]
}

export type LayerData = {
	id: string,
	type: string,
	source: string,
	styles?: Array<Object>
}

export type MapProps = {
	container?: HTMLElement,
	zoom?: number,
	center?: [number, number]
}
