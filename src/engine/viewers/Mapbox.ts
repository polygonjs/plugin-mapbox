import mapboxgl from 'mapbox-gl';
import {PolyScene} from '@polygonjs/polygonjs/dist/src/engine/scene/PolyScene';
import {MapboxCameraObjNode} from '../nodes/obj/MapboxCamera';
import {TypedViewer} from '@polygonjs/polygonjs/dist/src/engine/viewers/_Base';
import {MapboxViewerEventsController} from './utils/controllers/Event';
import {MapboxViewerStylesheetController} from './utils/controllers/Stylesheet';
import {MapboxViewerLayersController} from './utils/controllers/Layers';
import {MapsRegister} from '../../core/mapbox/MapsRegister';
const CSS_CLASS = 'CoreMapboxViewer';

export class MapboxViewer extends TypedViewer<MapboxCameraObjNode> {
	private _canvas_container: HTMLElement;
	// private _canvas: HTMLCanvasElement | undefined;
	// private _camera_node: MapboxCameraObjNode | undefined;

	private _map: mapboxgl.Map;
	private _map_loaded: boolean = false;

	// controllers
	public readonly layers_controller = new MapboxViewerLayersController(this);
	public readonly mapbox_events_controller = new MapboxViewerEventsController(this);

	constructor(
		protected _element: HTMLElement,
		protected _scene: PolyScene,
		protected _camera_node: MapboxCameraObjNode
	) {
		super(_element, _scene, _camera_node);

		MapboxViewerStylesheetController.load();
		this._canvas_container = document.createElement('div');
		this._element.appendChild(this._canvas_container);
		this._element.classList.add(CSS_CLASS);
		this._canvas_container.id = `mapbox_container_id_${Math.random()}`.replace('.', '_');
		this._canvas_container.style.height = '100%';
		this._map = this._camera_node.createMap(this._canvas_container);

		this.mapbox_events_controller.init_events();
		this._map.on('load', () => {
			if (this._map) {
				this._map_loaded = true;

				this._canvas = this._findCanvas();
				this.eventsController.init();
				MapsRegister.instance().registerMap(this._canvas_container.id, this._map);
				this.layers_controller.addLayers();
				this.mapbox_events_controller.camera_node_move_end(); // to update mapbox planes
			}
		});
	}
	mapLoaded() {
		return this._map_loaded;
	}
	map() {
		return this._map;
	}
	cameraNode() {
		return this._camera_node;
	}
	canvasContainer() {
		return this._canvas_container;
	}

	onResize() {
		if (this._map) {
			this._map.resize();
		}
		this.layers_controller.resize();
		this.mapbox_events_controller.camera_node_move_end(); // to update mapbox planes
	}
	dispose() {
		MapsRegister.instance().deregisterMap(this._canvas_container.id);
		this._camera_node?.removeMap(this._canvas_container);
		super.dispose();
	}

	waitForMapLoaded() {
		if (this._map.loaded()) {
			return;
		} else {
			return new Promise((resolve, reject) => {
				if (this._map) {
					this._map.on('load', () => {
						resolve(undefined);
					});
				}
			});
		}
	}
	// canvas(): HTMLCanvasElement {
	// 	return this._canvas;
	// }
	cameraLngLat() {
		return this._camera_node?.lngLat();
	}

	_addNavigationControls() {
		const nav = new mapboxgl.NavigationControl();
		this._map?.addControl(nav, 'bottom-right');
	}

	private _findCanvas() {
		return this._canvas_container.getElementsByTagName('canvas')[0];
	}
}
