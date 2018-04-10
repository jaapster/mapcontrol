
import React from 'react';
import { Control } from '../../mapcontrol/gl/control';

export class MapControl extends React.Component<any> {
	componentDidMount() {
		Control.create(this._canvas);
	}

	_canvas: ?HTMLCanvasElement;

	render() {
		return <canvas ref={(e) => { this._canvas = e; }} width="1024" height="1024" />;
	}
}
