// @flow

import { EventEmitter } from './event-emitter';
import { Context2d } from './context-2d';

export type CanvasProps = {
	width: number,
	height: number
}

const defaultCanvasProps = {
	width: 512,
	height: 512
};

export class Canvas extends EventEmitter {
	_canvasElement: HTMLCanvasElement;
	_ctx: Context2d;
	_snapShot: Image;

	static create(props?: CanvasProps = defaultCanvasProps): Canvas {
		return new Canvas(props);
	}

	constructor(props: CanvasProps) {
		super();

		this._canvasElement = document.createElement('canvas');
		this._canvasElement.height = props.height;
		this._canvasElement.width = props.width;
		this._canvasElement.className = 'map-control-canvas';

		this._ctx = Context2d.create(this._canvasElement);
		this._snapShot = new Image();

		let _mouseDown = false;

		this._canvasElement.addEventListener('mousedown', () => {
			_mouseDown = true;
		});

		this._canvasElement.addEventListener('mouseup', () => {
			_mouseDown = false;
		});

		this._canvasElement.addEventListener('mousemove', (e: MouseEvent) => {
			if (_mouseDown) {
				this.trigger('drag', {
					type: 'drag',
					originalEvent: e,
					movement: {
						x: e.movementX,
						y: e.movementY
					}
				});
			}
		});

		this._canvasElement.addEventListener('dblclick', (e: MouseEvent) => {
			this.trigger('dblclick', {
				type: 'dblclick',
				originalEvent: e
			});
		});

		this._canvasElement.addEventListener('wheel', (e: WheelEvent) => {
			this.trigger('wheel', {
				type: 'wheel',
				originalEvent: e,
				direction: e.deltaY > 0 ? 1 : -1
			});
		});
	}

	appendTo(container: HTMLElement) {
		container.appendChild(this._canvasElement);
	}

	get canvasElement(): HTMLCanvasElement {
		return this._canvasElement;
	}

	get ctx(): Context2d {
		return this._ctx;
	}

	get dimensions(): Object {
		return {
			width: this._canvasElement.width,
			height: this._canvasElement.height
		};
	}

	clear(x: number, y: number, h: number, w: number) {
		this._ctx.clearRect(x, y, h, w);
	}

	drawImage(img: Image, x: number = 0, y: number = 0) {
		this._ctx.drawImage(img, x, y);
	}

	displace(x: number, y: number) {
		const imgData = this._ctx.getImageData(0, 0, 512, 512);
		this._ctx.putImageData(imgData, x, y);
	}

	scaleUp() {
		this._ctx.scale(2, 2);
		this.drawImage(this._snapShot, -128, -128);
		this._ctx.setTransform(1, 0, 0, 1, 0, 0);
	}

	takeSnaphot() {
		this._snapShot.src = this._canvasElement.toDataURL('image/png');
	}

	getImageData() {
		this._ctx.getImageData(0, 0, 512, 512);
	}

	putImageData(data: ImageData) {
		this._ctx.putImageData(data, 0, 0);
	}

	fitParent() {
		if (this._canvasElement.parentNode instanceof HTMLElement) {
			const { width, height } = this._canvasElement.parentNode.getBoundingClientRect();
			this._canvasElement.height = height;
			this._canvasElement.width = width;
		}
	}
}
