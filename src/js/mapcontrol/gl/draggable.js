// @flow

import { EventEmitter } from './event-emitter';

export class Draggable extends EventEmitter {
	constructor(element: HTMLElement) {
		super();

		let dragging = false;

		element.addEventListener('mouseup', () => { dragging = false; });
		element.addEventListener('mousedown', () => { dragging = true; });
		element.addEventListener('mousemove', (e: MouseEvent) => {
			if (dragging) {
				this.trigger('drag', {
					vec: [e.movementX, e.movementY],
					x: e.movementX,
					y: e.movementY,
					ctrl: e.ctrlKey,
					alt: e.altKey
				});
			}
		});

		element.addEventListener('wheel', (e: MouseEvent) => this.trigger('wheel', e));
	}
}
