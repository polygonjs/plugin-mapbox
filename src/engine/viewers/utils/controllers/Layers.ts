import {MapboxViewer} from '../../Mapbox';
import {ThreejsLayer} from '../layers/Threejs';
import {BuildingsLayer} from '../layers/Buildings';
import {MapboxCameraObjNode} from '../../../nodes/obj/MapboxCamera';

export class MapboxViewerLayersController {
	public _threejsLayer: ThreejsLayer | undefined;
	constructor(private _viewer: MapboxViewer) {}

	addLayers() {
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
		const cameraNode = this._viewer.cameraNode();

		if (label_layer_id != null) {
			this._addLayerBuildings(map, label_layer_id, cameraNode);
			this._addLayerThreejs(map, label_layer_id);
		}

		this._addLayer3D(map, cameraNode);
		this._addLayerSky(map, cameraNode);
	}
	resize() {
		if (this._threejsLayer) {
			this._threejsLayer.resize();
		}
	}
	private _addLayer3D(map: mapboxgl.Map, cameraNode: MapboxCameraObjNode) {
		if (!cameraNode.pv.tlayer3D) {
			return;
		}
		const scene = cameraNode.scene().threejsScene();
		if (scene.background != null) {
			console.warn(
				'the scene has the background set, which may prevent the layers from displaying correctly. Make sure to remove the background.'
			);
		}

		map.addSource('mapbox-dem', {
			type: 'raster-dem',
			url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
			tileSize: 512,
			maxzoom: 14,
		});
		// add the DEM source as a terrain layer with exaggerated height
		map.setTerrain({source: 'mapbox-dem', exaggeration: 1.5});
	}
	private _addLayerSky(map: mapboxgl.Map, cameraNode: MapboxCameraObjNode) {
		if (!cameraNode.pv.tlayerSky) {
			return;
		}
		// add a sky layer that will show when the map is highly pitched
		map.addLayer({
			id: 'sky',
			type: 'sky',
			paint: {
				'sky-type': 'atmosphere',
				'sky-atmosphere-sun': [0.0, 0.0],
				'sky-atmosphere-sun-intensity': 15,
			},
		});
	}
	private _addLayerBuildings(map: mapboxgl.Map, label_layer_id: string, cameraNode: MapboxCameraObjNode) {
		if (!map) {
			return;
		}
		if (!cameraNode.pv.tlayerBuildings) {
			return;
		}
		if (this._has_layer_id(BuildingsLayer.id)) {
			return;
		}
		map.addLayer(BuildingsLayer, label_layer_id);
	}

	private _addLayerThreejs(map: mapboxgl.Map, label_layer_id: string) {
		if (!map) {
			return;
		}
		const camera_node = this._viewer.cameraNode();
		if (!camera_node) {
			console.log('no camera_node found');
			return;
		}
		this._threejsLayer = new ThreejsLayer(camera_node, camera_node.scene().threejsScene(), this._viewer);
		map.addLayer(this._threejsLayer, label_layer_id);
		// const threejsScene = camera_node.scene().threejsScene();
		// console.log(Threejs3LayerBuilder);
		// const layer = Threejs3LayerBuilder(threejsScene);
		// map.addLayer(layer, label_layer_id);
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
