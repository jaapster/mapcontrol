// @flow

import React from 'react';
import { Map } from '../../mapcontrol/map';

export class MapControl extends React.Component {
	state = {
		center: [0, 0]
	};

	componentDidMount() {
		const { zoom, center } = this.props;
		this._map = Map.create({ container: this._container, zoom, center });

		this._map.on('update', () => {
			this.setState({ center: this._map.center });
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

		return (
			<div className="mapcontrol">
				<div className="mapcontrol-container" ref={setContainer} />
				<p className="center-coordinate">{ x } { y }</p>
				<div className="guide guide-vertical" />
				<div className="guide guide-horizontal" />
			</div>
		);
	}
}
