// @flow

import bind from 'autobind-decorator';
import { EventEmitter } from './event-emitter';
import { Canvas } from './canvas';
import { Tile } from './tile';
import { Source } from './source';
import { Layer } from './layer';
import { hasId, makeCacheKey, isValidTilePosition, isSamePosition } from './fn';
import { DEFAULT_SIZE, CS_LIMIT, TILE_BUFFER } from './constants';

import type { Position2d, Position3d, Coordinate, SourceData, LayerData, MapProps } from './type';

const DIM = DEFAULT_SIZE;

export class Map extends EventEmitter {
	_container: ?HTMLElement;
	_canvas: Canvas;
	_sources: Array<Source>;
	_layers: Array<Layer>;
	_zoom: number;
	_offset: Coordinate;
	_cache: { [string]: Tile };
	_tiles: Array<Tile>;

	static create(props?: MapProps): Map {
		return new Map(props);
	}

	static EVENT = {
		UPDATE: 'update'
	};

	constructor(props?: MapProps = {}) {
		super();

		const { container, zoom, center } = props;

		this._canvas = Canvas.create({ width: 10, height: 10 });
		this._sources = [];
		this._layers = [];
		this._zoom = zoom || 1;
		this._offset = [0, 0];
		this._cache = {};
		this._tiles = [];

		if (container) {
			this._container = container;
			this._canvas.appendTo(container);
			this._canvas.fitParent();
		}

		this.center = center || [0, 0];
		this.zoom = zoom || 1;

		this._canvas.on(Canvas.EVENT.DRAG, (e) => {
			this._offset[0] += e.movement.x;
			this._offset[1] += e.movement.y;
			this._canvas.displace(e.movement.x, e.movement.y);
			this.render();
		});

		this._canvas.on(Canvas.EVENT.DBL_CLICK, (e) => {
			const { originalEvent: { clientX, clientY, shiftKey } } = e;

			if (!shiftKey) {
				this.zoomIn([clientX, clientY]);
			} else {
				this.zoomOut([clientX, clientY]);
			}
		});

		this._canvas.on(Canvas.EVENT.WHEEL, (e) => {
			const { direction, originalEvent: { clientX, clientY } } = e;

			if (direction < 0) {
				this.zoomIn([clientX, clientY]);
			} else {
				this.zoomOut([clientX, clientY]);
			}
		});

		// setInterval(this._flushTiles, 30000);

		window.map = this;
	}

	get container(): ?HTMLElement {
		return this._container;
	}

	get zoom(): number {
		return this._zoom;
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
		this._zoom = z;

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

	// return the wdith in pixels of one entire row of tiles on the current zoom level
	get pixelDimension(): number {
		return (2 ** this.zoom) * DIM;
	}

	// returns the number of cs units per map tile
	get unitsPerTile(): number {
		// twice the cs limit divided by the number of tiles on the current zoomlevel
		return (CS_LIMIT * 2) / (2 ** this.zoom);
	}

	// returns the number of cs units per screen pixel
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

	zoomIn(focus: ?Coordinate, amount: ?number) {
		if (!amount) {
			amount = 1;
		}

		const { width, height } = this._canvas.dimensions;
		const center = [width / 2, height / 2];

		if (!focus) {
			focus = center;
		}

		const [fx, fy] = focus;
		const [cx, cy] = center;
		const [dx, dy] = [cx - fx, cy - fy];

		this._zoom += amount;

		this._offset = [
			((this._offset[0] + dx) * (2 ** amount)) - dx,
			((this._offset[1] + dy) * (2 ** amount)) - dy
		];

		this.render();
	}

	zoomOut(focus: ?Coordinate, amount: ?number) {
		if (!amount) {
			amount = 1;
		}

		if (this._zoom - amount < 0) {
			return;
		}

		const { width, height } = this._canvas.dimensions;
		const center = [width / 2, height / 2];

		if (!focus) {
			focus = center;
		}

		const [fx, fy] = focus;
		const [cx, cy] = center;
		const [dx, dy] = [cx - fx, cy - fy];

		this._zoom -= amount;

		this._offset = [
			((this._offset[0] + dx) / (2 ** amount)) - dx,
			((this._offset[1] + dy) / (2 ** amount)) - dy
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
				id: props.id,
				source,
				type: props.type,
				styles: props.styles,
				onTileLoaded: this._renderTile
			});

			this._layers = this._layers.concat([layer]);

			Object
				.keys(this._cache)
				.forEach(key => this._cache[key].update(this._layers));
		}
	}

	tilePositions(): Array<Position3d> {
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

	render() {
		this._flushTiles();
		this.tilePositions().forEach(this._renderTile);
		this.trigger(Map.EVENT.UPDATE);
	}

	@bind
	_renderTile(pos: Position3d) {
		if (isValidTilePosition(pos)) {
			const key = makeCacheKey(pos);

			if (this._cache[key]) {
				const { x, y } = this.centerPixel;
				const xpos = (pos.x * DIM) + this._offset[0] + x;
				const ypos = (pos.y * DIM) + this._offset[1] + y;

				this._canvas.ctx.putImageData(this._cache[key].imageData, xpos, ypos);
			} else {
				this._cache[key] = Tile.create(pos, DIM, this._layers);
				this._cache[key].on(Tile.EVENT.UPDATE, this._renderTile);
			}
		}
	}

	@bind
	_flushTiles() {
		const positions = this.tilePositions();

		Object.keys(this._cache).forEach((key) => {
			const a = this._cache[key].pos;

			if (!positions.find(b => isSamePosition(a, b))) {
				this._cache[key].flush();
				this._cache[key].off(Tile.EVENT.UPDATE, this._renderTile);
				delete this._cache[key];
			}
		});
	}
}
