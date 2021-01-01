import {MapboxViewer} from '../../Mapbox';
import {ThreejsLayer} from '../layers/Threejs';
import {BuildingsLayer} from '../layers/Buildings';

export class MapboxViewerLayersController {
	public _threejs_layer: ThreejsLayer | undefined;
	constructor(private _viewer: MapboxViewer) {}

	get threejs_layer() {
		return this._threejs_layer;
	}

	add_layers() {
		if (this._viewer.map_loaded != true) {
			return;
		}
		if (!this._viewer.map) {
			return;
		}

		const current_style = this._viewer.map.getStyle();
		const layers = current_style.layers;
		if (!layers) {
			return;
		}

		let label_layer_id = null;
		for (let layer of layers) {
			if (layer.type == 'symbol' && (layer.layout as mapboxgl.SymbolLayout)['text-field']) {
				label_layer_id = layer.id;
			}
		}

		if (label_layer_id != null) {
			this._add_buildings_layer(label_layer_id);
			this._add_threejs_layer(label_layer_id);
		}
	}
	resize() {
		if (this._threejs_layer) {
			this._threejs_layer.resize();
		}
	}
	_add_buildings_layer(label_layer_id: string) {
		if (this._has_layer_id(BuildingsLayer.id)) {
			return;
		}

		if (this._viewer.map) {
			this._viewer.map.addLayer(BuildingsLayer, label_layer_id);
		}
	}

	_add_threejs_layer(label_layer_id: string) {
		if (!this._viewer.camera_node) {
			return;
		}
		this._threejs_layer = new ThreejsLayer(
			this._viewer.camera_node,
			this._viewer.camera_node.scene.defaultScene,
			this._viewer
		);
		if (this._threejs_layer && this._viewer.map) {
			this._viewer.map.addLayer(this._threejs_layer, label_layer_id);
		}
	}
	_has_layer_id(layer_id: string): boolean {
		if (this._viewer.map) {
			const current_style = this._viewer.map.getStyle();
			const layer_ids = current_style.layers?.map((l) => l.id) || [];
			return layer_ids.includes(layer_id);
		}
		return false;
	}
}
