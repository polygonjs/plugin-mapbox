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
		if (!this._viewer.mapLoaded()) {
			console.warn('map not loaded');
			return;
		}
		const map = this._viewer.map();
		if (!map) {
			console.warn('no map found');
			return;
		}

		const current_style = map.getStyle();
		const layers = current_style.layers;
		if (!layers) {
			console.warn('no layers found');
			return;
		}

		let label_layer_id = null;
		for (let layer of layers) {
			if (layer.type == 'symbol' && (layer.layout as mapboxgl.SymbolLayout)['text-field']) {
				label_layer_id = layer.id;
			}
		}

		if (label_layer_id != null) {
			if (0 + 0) {
				this._add_buildings_layer(label_layer_id);
			}
			this._add_threejs_layer(label_layer_id);
		}
	}
	resize() {
		if (this._threejs_layer) {
			this._threejs_layer.resize();
		}
	}
	private _add_buildings_layer(label_layer_id: string) {
		if (this._has_layer_id(BuildingsLayer.id)) {
			return;
		}

		const map = this._viewer.map();
		if (map) {
			map.addLayer(BuildingsLayer, label_layer_id);
		}
	}

	private _add_threejs_layer(label_layer_id: string) {
		const camera_node = this._viewer.cameraNode();
		if (!camera_node) {
			console.log('no camera_node found');
			return;
		}
		this._threejs_layer = new ThreejsLayer(camera_node, camera_node.scene().threejsScene(), this._viewer);
		const map = this._viewer.map();
		if (!map) {
			console.log('no map found');
			return;
		}
		map.addLayer(this._threejs_layer, label_layer_id);
	}
	_has_layer_id(layer_id: string): boolean {
		const map = this._viewer.map();
		if (map) {
			const current_style = map.getStyle();
			const layer_ids = current_style.layers?.map((l) => l.id) || [];
			return layer_ids.includes(layer_id);
		}
		return false;
	}
}
