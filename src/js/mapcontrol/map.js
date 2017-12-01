// @flow

import { Canvas } from './canvas';
import { Source } from './source';
import { Layer } from './layer';
import { hasId } from './fn';
import { DEFAULT_SIZE, CS_LIMIT, TILE_BUFFER } from './constants';

import type { Position2d, Position3d, Coordinate, SourceData, LayerData, MapProps } from './type';

const DIM = DEFAULT_SIZE;

export class Map {
	_container: ?HTMLElement;
	_canvas: Canvas;
	_sources: Array<Source>;
	_layers: Array<Layer>;
	_zoomLevel: number;
	_offset: [number, number];

	static create(props?: MapProps): Map {
		return new Map(props);
	}

	_offset = [0, 0];

	constructor(props?: MapProps = {}) {
		const { container, zoom, center } = props;

		this._canvas = Canvas.create({ width: 10, height: 10 });
		this._sources = [];
		this._layers = [];
		this._zoomLevel = zoom || 1;

		if (container) {
			this._container = container;
			this._canvas.appendTo(container);
			this._canvas.fitParent();
		}

		this.zoom = zoom || 1;
		this.center = center || [0, 0];

		this._canvas.on('drag', (e) => {
			this._offset[0] += e.movement.x;
			this._offset[1] += e.movement.y;
			this._canvas.displace(e.movement.x, e.movement.y);
			this.render();
		});

		this._canvas.on('dblclick', (e) => {
			const { originalEvent: { clientX, clientY, shiftKey } } = e;
			if (!shiftKey) {
				this.zoomIn([clientX, clientY]);
			} else {
				this.zoomOut([clientX, clientY]);
			}
		});

		window.map = this;
	}

	get container(): ?HTMLElement {
		return this._container;
	}

	get zoom(): number {
		return this._zoomLevel;
	}

	set zoom(z: number) {
		// store the current center coordinate
		const center = this.center;

		// normalize the center to the map origin
		this.center = [0, 0];

		// apply the pixel offset for the new zoom level
		this._offset = [
			(2 ** z) * -DIM,
			(2 ** z) * -DIM
		];

		// update the zoom level variable
		this._zoomLevel = z;

		// restire the map center
		this.center = center;
	}

	get basePosition(): Position3d {
		const { width, height } = this._canvas.dimensions;

		return {
			x: Math.floor(-(this._offset[0] + (width / 2)) / DIM),
			y: Math.floor(-(this._offset[1] + (height / 2)) / DIM),
			z: this.zoom
		};
	}

	get centerPixel(): Position2d {
		const { width, height } = this._canvas.dimensions;

		return { x: Math.floor(width / 2), y: Math.floor(height / 2) };
	}

	get tilePositions(): Array<Position3d> {
		const { x, y, z } = this.basePosition;
		const { width, height } = this._canvas.dimensions;
		const xpositions = Math.ceil(width / DIM) + TILE_BUFFER;
		const ypositions = Math.ceil(height / DIM) + TILE_BUFFER;
		const positions = [];

		for (let i = -TILE_BUFFER; i < xpositions; i += 1) {
			for (let j = -TILE_BUFFER; j < ypositions; j += 1) {
				positions.push({ x: x + i, y: y + j, z });
			}
		}

		return positions;
	}

	// return the wdith in pixels of one entire row of tiles on the current zoom level
	get pixelDimension(): number {
		return (2 ** this.zoom) * DIM;
	}

	get unitsPerTile(): number {
		// twice the cs limit divided by the number of tiles on the current zoomlevel
		return (CS_LIMIT * 2) / (2 ** this.zoom);
	}

	get unitsPerPixel(): number {
		// the number of units per tile divided by the tile size in pixels
		return this.unitsPerTile / DIM;
	}

	// returns the coordinate at the center of the map
	get center(): Coordinate {
		// half the width of a map tile row in pixels at the current zoom level
		const pixelDim = this.pixelDimension / 2;

		// the number of coordinate system units per pixel at the current zoom level
		const pixelUnit = this.unitsPerPixel;

		// translate the center in pixel space to cs units
		return [
			(-this._offset[0] - pixelDim) * pixelUnit,
			(-this._offset[1] - pixelDim) * pixelUnit
		];
	}

	set center([x, y]: [number, number]) {
		// half the width of a map tile row in pixels at the current zoom level
		const pixelDim = this.pixelDimension / 2;

		// the number of coordinate system units per pixel at the current zoom level
		const pixelUnit = this.unitsPerPixel;

		// the coordinate translated to pixel space
		const pixels = [
			x / pixelUnit,
			y / pixelUnit
		];

		// the offset needed to get the coordinate in the center of the map view
		this._offset = [
			-pixelDim - pixels[0],
			-pixelDim - pixels[1]
		];

		this.render();
	}

	reset() {
		this.zoom = 1;
		this.center = [0, 0];
	}

	zoomIn(focus: ?Coordinate) {
		const { width, height } = this._canvas.dimensions;
		const center = [width / 2, height / 2];

		if (!focus) {
			focus = center;
		}

		const [fx, fy] = focus;
		const [cx, cy] = center;
		const [dx, dy] = [cx - fx, cy - fy];

		this._zoomLevel += 1;

		this._offset = [
			((this._offset[0] + dx) * 2) - dx,
			((this._offset[1] + dy) * 2) - dy
		];

		this.render();
	}

	zoomOut(focus: ?Coordinate) {
		const { width, height } = this._canvas.dimensions;
		const center = [width / 2, height / 2];

		if (!focus) {
			focus = center;
		}

		const [fx, fy] = focus;
		const [cx, cy] = center;
		const [dx, dy] = [cx - fx, cy - fy];

		this._zoomLevel -= 1;

		this._offset = [
			((this._offset[0] + dx) / 2) - dx,
			((this._offset[1] + dy) / 2) - dy
		];

		this.render();
	}

	addSource(props: SourceData) {
		this._sources = this._sources.concat(Source.create({ ...props }));
	}

	getSource(id: string): ?Source {
		return this._sources.find(hasId(id));
	}

	addLayer(props: LayerData) {
		const source = this.getSource(props.source);

		if (source) {
			const layer = Layer.create({
				source,
				type: props.type,
				styles: props.styles,
				onTileLoaded: (pos: Position3d) => this._renderTile(pos)
			});

			layer.on('tile', this._renderTile.bind(this));

			this._layers = this._layers.concat(layer);
		}
	}

	render() {
		this.tilePositions.forEach((pos) => {
			this._renderTile(pos);
		});
	}

	_renderTile(pos: Position3d) {
		this._layers.forEach((layer) => {
			this._renderLayerTile(layer, pos);
		});
	}

	async _renderLayerTile(layer: Layer, pos: Position3d) {
		const imgData = layer.render(pos);

		if (imgData) {
			const { x, y } = this.centerPixel;
			const xpos = (pos.x * DIM) + this._offset[0] + x;
			const ypos = (pos.y * DIM) + this._offset[1] + y;
			this._canvas.ctx.putImageData(imgData, xpos, ypos);
		}
	}
}
