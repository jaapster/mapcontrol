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

		this._map.on(Map.EVENT.UPDATE, () => {
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

		setTimeout(() => {
			const styles2 = [
				{
					type: 'text',
					layer: 'place',
					class: 'city',
					paint: {
						color: '#fff',
						offset: [0, 25]
					}
				}, {
					type: 'circle',
					layer: 'place',
					class: 'city',
					paint: {
						radius: 6,
						fillColor: '#f00',
						strokeColor: '#fff',
						strokeWidth: 2
					}
				}
			];

			this._map.addLayer({
				source: 'vectorSource',
				type: 'vector',
				styles: styles2
			});
		}, 5000);
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
