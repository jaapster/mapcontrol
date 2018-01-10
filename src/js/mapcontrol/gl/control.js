// @flow
import { Renderer } from './renderer';
import { Draggable } from './draggable';
import { vec2 } from './math/vec2';
import TileRequestWorker from './workers/tile-request.worker';

import type { Vec2 } from './type';

const SIZE = 512;
const FULL_ROTATION = Math.PI * 2;

const makeKey = ([x, y, z]) => `${x}_${y}_${z}`;

const findTiles = (offset, depth) => {
	const [x, y] = [
		Math.floor(Math.abs(offset[0]) / SIZE),
		Math.floor(Math.abs(offset[1]) / SIZE)
	];
	return [
		[x + 0, y + 0, depth],
		[x + 1, y + 0, depth],
		[x + 2, y + 0, depth],
		[x + 0, y + 1, depth],
		[x + 1, y + 1, depth],
		[x + 2, y + 1, depth],
		[x + 0, y + 2, depth],
		[x + 1, y + 2, depth],
		[x + 2, y + 2, depth]
	];
};

const same = (a, b) => a[0] === b[0] && a[1] === b[1];

export class Control {
	_rotation: number;
	_detailLevel: number;
	_offset: Vec2;

	constructor(canvas: HTMLCanvasElement) {
		if (canvas) {
			const gl: ?WebGLRenderingContext = canvas.getContext('webgl');

			if (gl) {
				gl.canvas.style.background = 'rgb(239, 233, 225)';

				const renderer = new Renderer(gl);
				this._rotation = 0;

				// startposition for testing
				this._detailLevel = 11;
				const max = 2 ** this._detailLevel;
				// const offset = [1024 * -SIZE, 674 * -SIZE];
				this._offset = [(max / 2) * -SIZE, (max / 3) * -SIZE];

				let tiles = [];

				const renderTileLayer = (l) => {
					if (l.locations.length) {
						renderer.draw({
							locations: l.locations,
							indices: l.indices,
							color: l.color,
							depth: l.depth,
							offset: vec2.add(this._offset, vec2.mult(l.pos, SIZE)),
							rotation: this._rotation,
							extent: 4096,
							size: SIZE
						});
					}
				};

				const renderTile = (t) => {
					t.layers.forEach(renderTileLayer);
				};

				const renderTiles = () => {
					gl.clear(gl.COLOR_BUFFER_BIT);
					tiles.forEach(renderTile);
				};

				const loading = {};

				const loadTile = async (pos) => {
					if (!tiles.find(b => same(b.pos, pos))) {
						const key = makeKey(pos);

						if (!loading[key]) {
							loading[key] = true;

							// $FlowFixMe
							const worker = new TileRequestWorker();

							worker.onmessage = (m) => {
								tiles = tiles.concat(m.data.data);
								renderTiles();
								loading[key] = false;
							};

							worker.postMessage({ pos });
						}
					}
				};

				const draggable = new Draggable(canvas);

				draggable.on('drag', (d) => {
					if (!d.alt) {
						const ox = Math.floor(this._offset[0] / SIZE);
						const oy = Math.floor(this._offset[1] / SIZE);
						const nx = Math.floor((this._offset[0] + d.x) / SIZE);
						const ny = Math.floor((this._offset[1] + d.y) / SIZE);

						if (ox !== nx || oy !== ny) {
							const p = findTiles([this._offset[0] + d.x, this._offset[1] + d.y], this._detailLevel);
							tiles = tiles.filter(a => p.find(b => same(a.pos, b)));
							p.forEach(loadTile);
						}

						const r = vec2.rotate(d.vec, -this.rotation);

						this._offset[0] += r[0];
						this._offset[1] += r[1];
					} else {
						this.rotation = this.rotation - (d.x / 100);
					}

					renderTiles();
				});

				draggable.on('wheel', (e) => {
					if (e.deltaY < 0) {
						this._detailLevel += 1;
						this._offset = vec2.mult(this._offset, 2);
					} else {
						this._detailLevel -= 1;
						this._offset = vec2.div(this._offset, 2);
					}

					tiles = [];
					const p = findTiles(this._offset, this._detailLevel);
					p.forEach(loadTile);
				});

				const startPos = findTiles(this._offset, this._detailLevel);
				startPos.forEach(loadTile);
			}
		}
	}

	set rotation(value: number) {
		this._rotation = value;

		if (this._rotation < 0) {
			this._rotation += FULL_ROTATION;
		} else if (this._rotation > FULL_ROTATION) {
			this._rotation -= FULL_ROTATION;
		}
	}

	get rotation(): number {
		return this._rotation;
	}
}
