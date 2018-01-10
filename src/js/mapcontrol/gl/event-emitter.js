export class EventEmitter {
	_subscribers: { [string]: Function[] };

	_subscribers = {}

	on(eventType: string, handler: Function) {
		this._subscribers[eventType] = this._subscribers[eventType] || [];

		this.off(eventType, handler);

		this._subscribers[eventType].push(handler);
	}

	off(eventType: string, handler: Function) {
		if (this._subscribers[eventType]) {
			this._subscribers[eventType] = this._subscribers[eventType]
				.filter(fn => fn !== handler);
		}
	}

	trigger(eventType: string, data: any) {
		if (this._subscribers[eventType]) {
			this._subscribers[eventType].forEach(fn => fn(data));
		}
	}
}
