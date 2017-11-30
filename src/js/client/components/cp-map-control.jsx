// @flow

import React from 'react';
import { Map } from '../../mapcontrol/map';

export class MapControl extends React.Component {
	componentDidMount() {
		const { zoom, center } = this.props;
		this._map = Map.create({ container: this._container, zoom, center });

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

		return (
			<div>
				<div className="mapcontrol-container" ref={setContainer} />
			</div>
		);
	}
}
