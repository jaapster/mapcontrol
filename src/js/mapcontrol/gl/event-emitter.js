// @flow

export class EventEmitter {
	_subscribers: { [string]: Set<Function> } = {};

	on(eventType: string, handler: Function) {
		this._subscribers[eventType] = this._subscribers[eventType] || new Set();
		this._subscribers[eventType].add(handler);
	}

	off(eventType: string, handler: Function) {
		if (this._subscribers[eventType]) {
			this._subscribers[eventType].delete(handler);
		}
	}

	trigger(eventType: string, data: any) {
		if (this._subscribers[eventType]) {
			this._subscribers[eventType].forEach(fn => fn(data));
		}
	}
}
