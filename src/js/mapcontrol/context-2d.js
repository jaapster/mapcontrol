// @flow

import { DEFAULT_SIZE } from './constants';

export class Context2d {
	_canvas: HTMLCanvasElement;
	_ctx: ?CanvasRenderingContext2D;

	static create(canvas: ?HTMLCanvasElement) {
		return new Context2d(canvas);
	}

	constructor(canvas: ?HTMLCanvasElement) {
		if (!canvas) {
			this._canvas = document.createElement('canvas');
			this._canvas.width = DEFAULT_SIZE;
			this._canvas.height = DEFAULT_SIZE;
		} else {
			this._canvas = canvas;
		}
		this._ctx = this._canvas.getContext('2d');
	}

	set fillStyle(color: string) {
		if (this._ctx) {
			this._ctx.fillStyle = color;
		}
	}

	set strokeStyle(color: string) {
		if (this._ctx) {
			this._ctx.strokeStyle = color;
		}
	}

	set font(font: string) {
		if (this._ctx) {
			this._ctx.font = font;
		}
	}

	set textAlign(align: string) {
		if (this._ctx) {
			this._ctx.textAlign = align;
		}
	}

	set lineWidth(width: number) {
		if (this._ctx) {
			this._ctx.lineWidth = width;
		}
	}

	set shadowColor(color: string) {
		if (this._ctx) {
			this._ctx.shadowColor = color;
		}
	}

	set shadowBlur(blur: number) {
		if (this._ctx) {
			this._ctx.shadowBlur = blur;
		}
	}

	rotate(angle: number) {
		if (this._ctx) {
			this._ctx.rotate(angle);
		}
	}

	clearRect(x: number, y: number, h: number, w: number) {
		if (this._ctx) {
			this._ctx.clearRect(x, y, h, w);
		}
	}

	drawImage(img: Image, x: number = 0, y: number = 0) {
		if (this._ctx) {
			this._ctx.drawImage(img, x, y);
		}
	}

	getImageData(x: number, y: number, width: number, height: number): ?ImageData {
		if (this._ctx) {
			return this._ctx.getImageData(0, 0, width, height);
		}

		return null;
	}

	putImageData(imgData: ?ImageData, x: number, y: number) {
		if (this._ctx && imgData) {
			this._ctx.putImageData(imgData, x, y);
		}
	}

	scale(x: number, y: number) {
		if (this._ctx) {
			this._ctx.scale(x, y);
		}
	}

	setTransform(hScale: number, hSkew: number, vSkew: number, vScale: number, hMove: number, vMove: number) {
		if (this._ctx) {
			this._ctx.setTransform(hScale, hSkew, vSkew, vScale, hMove, vMove);
		}
	}

	beginPath() {
		if (this._ctx) {
			this._ctx.beginPath();
		}
	}

	moveTo(x: number, y: number) {
		if (this._ctx) {
			this._ctx.moveTo(x, y);
		}
	}

	lineTo(x: number, y: number) {
		if (this._ctx) {
			this._ctx.lineTo(x, y);
		}
	}

	stroke() {
		if (this._ctx) {
			this._ctx.stroke();
		}
	}

	fill() {
		if (this._ctx) {
			this._ctx.fill();
		}
	}

	fillText(text: string, x: number, y: number) {
		if (this._ctx) {
			this._ctx.fillText(text, x, y);
		}
	}

	strokeText(text: string, x: number, y: number) {
		if (this._ctx) {
			this._ctx.strokeText(text, x, y);
		}
	}

	ellipse(x: number, y: number, radiusX: number, radiusY: number, rotation: number, startAngle: number, endAngle: number, anticlockwise: boolean) {
		if (this._ctx) {
			this._ctx.ellipse(x, y, radiusX, radiusY, rotation, startAngle, endAngle, anticlockwise);
		}
	}

	arc(x: number, y: number, radius: number, startAngle: number, endAngle: number, anticlockwise: boolean) {
		if (this._ctx) {
			this._ctx.arc(x, y, radius, startAngle, endAngle, anticlockwise);
		}
	}
}
