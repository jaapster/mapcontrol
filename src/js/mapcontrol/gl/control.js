// @flow

import { Renderer } from './renderer';
import { Draggable } from './draggable';
import { vec2 } from './math/vec2';

import TileRequestWorker from './workers/tile-request.worker';

import type { Vec2 } from './types/type';

const SIZE = 512;
const FULL_ROTATION = Math.PI * 2;

const makeKey = ([x, y, z]) => `${x}_${y}_${z}`;

const findTiles = (offset, depth, box = { width: 2048, height: 1024 }) => {
	const { width, height } = box;

	const numHorizontal = Math.ceil(width / SIZE) + 1;
	const numVertical = Math.ceil(height / SIZE) + 1;

	const [x, y] = [
		Math.floor(Math.abs(offset[0]) / SIZE),
		Math.floor(Math.abs(offset[1]) / SIZE)
	];

	const t = [];

	for (let i = 0; i < numVertical; i += 1) {
		for (let j = 0; j < numHorizontal; j += 1) {
			t.push([x + j, y + i, depth]);
		}
	}

	return t;
};

const same = (a, b) => a[0] === b[0] && a[1] === b[1];

const updateOffset = (offset, referencePoint, factor) => (
	vec2.add(vec2.mult(vec2.mult(referencePoint, (2 ** factor)), -1), vec2.add(referencePoint, offset))
);

export class Control {
	_rotation: number;
	_detailLevel: number;
	_offset: Vec2;

	static create(canvas: HTMLCanvasElement) {
		return new Control(canvas);
	}

	constructor(canvas: HTMLCanvasElement) {
		if (canvas) {
			const gl: ?WebGLRenderingContext = canvas.getContext('webgl');

			if (gl) {
				gl.canvas.style.background = 'rgb(239, 233, 225)';

				const renderer = new Renderer(gl);
				this._rotation = 0;

				// start position for testing
				this._detailLevel = 11;

				// number of tile in a row on this detail level
				const max = 2 ** this._detailLevel;

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
					// gl.clear(gl.COLOR_BUFFER_BIT);
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
						const [x, y] = this._offset;

						const ox = Math.floor(x / SIZE);
						const oy = Math.floor(y / SIZE);
						const nx = Math.floor((x + d.x) / SIZE);
						const ny = Math.floor((y + d.y) / SIZE);

						if (ox !== nx || oy !== ny) {
							const p = findTiles([x + d.x, y + d.y], this._detailLevel);
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

				canvas.addEventListener('dblclick', (e: MouseEvent) => {
					const pos = vec2.add(vec2.mult(this._offset, -1), [e.clientX, e.clientY]);
					const factor = e.shiftKey ? -1 : 1;

					this._detailLevel += factor;
					this._offset = updateOffset(this._offset, pos, factor);

					tiles = [];
					findTiles(this._offset, this._detailLevel).forEach(loadTile);
				});

				// initial tile load
				findTiles(this._offset, this._detailLevel).forEach(loadTile);
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
