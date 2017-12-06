// @flow

import React from 'react';
import { Map } from '../../mapcontrol/map';

export class MapControl extends React.Component {
	state = {
		center: [0, 0],
		zoom: 0,
		zoomFloat: 0
	};

	componentDidMount() {
		const { zoom, center } = this.props;
		this._map = Map.create({ container: this._container, zoom, center });

		this._map.on(Map.EVENT.UPDATE, () => {
			this.setState({
				center: this._map.center,
				zoom: this._map._zoom,
				zoomFloat: this._map._zoomFloat
			});
		});

		if (this.props.sources) {
			this.props.sources.forEach((source) => {
				this._map.addSource(source);
			});
		}

		if (this.props.layers) {
			this.props.layers.forEach((layer) => {
				this._map.addLayer(layer);
			});
		}

		this._map.render();
	}

	_container: HTMLElement;
	_map: Map;

	render() {
		const setContainer = (element) => {
			this._container = element;
		};

		const [x, y] = this.state.center;
		const z = this.state.zoom;
		const zf = this.state.zoomFloat;

		return (
			<div className="mapcontrol">
				<div className="mapcontrol-container" ref={setContainer} />
				<p className="center-coordinate">{ x } | { y } | { z } | { zf }</p>
				<div className="guide guide-vertical" />
				<div className="guide guide-horizontal" />
			</div>
		);
	}
}
