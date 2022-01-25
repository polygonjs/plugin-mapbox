import mapboxgl from 'mapbox-gl';
import {MapboxCameraObjNode} from '../nodes/obj/MapboxCamera';
import {TypedViewer} from '@polygonjs/polygonjs/dist/src/engine/viewers/_Base';
import {MapboxViewerEventsController} from './utils/controllers/Event';
import {MapboxViewerStylesheetController} from './utils/controllers/Stylesheet';
import {MapboxViewerLayersController} from './utils/controllers/Layers';
import {MapsRegister} from '../../core/mapbox/MapsRegister';
const CSS_CLASS = 'CoreMapboxViewer';

export class MapboxViewer extends TypedViewer<MapboxCameraObjNode> {
	private _canvasContainer: HTMLElement;
	// private _canvas: HTMLCanvasElement | undefined;
	// private _camera_node: MapboxCameraObjNode | undefined;

	private _map: mapboxgl.Map;
	private _mapLoaded: boolean = false;

	// controllers
	public readonly layers_controller = new MapboxViewerLayersController(this);
	public readonly mapbox_events_controller = new MapboxViewerEventsController(this);

	constructor(protected override _cameraNode: MapboxCameraObjNode) {
		super(_cameraNode);
		this._canvasContainer = document.createElement('div');
		this._canvasContainer.id = `mapbox_container_id_${Math.random()}`.replace('.', '_');
		this._canvasContainer.style.height = '100%';
		MapboxViewerStylesheetController.load();
		this._map = this._cameraNode.createMap(this._canvasContainer);
	}
	override async mount(element: HTMLElement) {
		super.mount(element);
		this._domElement?.appendChild(this._canvasContainer);
		this._domElement?.classList.add(CSS_CLASS);

		this.mapbox_events_controller.init_events();
		this._map.on('load', () => {
			if (this._map) {
				this._mapLoaded = true;

				this._canvas = this._findCanvas();
				this.eventsController().init();
				MapsRegister.instance().registerMap(this._canvasContainer.id, this._map);
				this.layers_controller.addLayers();
				this.mapbox_events_controller.camera_node_move_end(); // to update mapbox planes
				window.dispatchEvent(new Event('resize')); // helps making sure it is resized correctly
			}
		});
	}

	mapLoaded() {
		return this._mapLoaded;
	}
	map() {
		return this._map;
	}
	canvasContainer() {
		return this._canvasContainer;
	}

	onResize() {
		if (this._map) {
			this._map.resize();
		}
		this.layers_controller.resize();
		this.mapbox_events_controller.camera_node_move_end(); // to update mapbox planes
	}
	override dispose() {
		MapsRegister.instance().deregisterMap(this._canvasContainer.id);
		this._cameraNode?.removeMap(this._canvasContainer);
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
		return this._cameraNode?.lngLat();
	}

	_addNavigationControls() {
		const nav = new mapboxgl.NavigationControl();
		this._map?.addControl(nav, 'bottom-right');
	}

	private _findCanvas() {
		return this._canvasContainer.getElementsByTagName('canvas')[0];
	}
}
