import {PerspectiveCamera} from 'three/src/cameras/PerspectiveCamera';
import {Raycaster} from 'three/src/core/Raycaster';
import {Vector2} from 'three/src/math/Vector2';
import {Vector3} from 'three/src/math/Vector3';
import {Matrix4} from 'three/src/math/Matrix4';
import {
	TypedCameraObjNode,
	CameraMainCameraParamConfig,
	BaseViewerOptions,
} from '@polygonjs/polygonjs/dist/src/engine/nodes/obj/_BaseCamera';
import mapboxgl from 'mapbox-gl';
import {MapboxViewer} from '../../viewers/Mapbox';
import {CoreMapboxClient} from '../../../core/mapbox/Client';
import {ParamConfig, NodeParamsConfig} from '@polygonjs/polygonjs/dist/src/engine/nodes/utils/params/ParamsConfig';
import {BaseNodeType} from '@polygonjs/polygonjs/dist/src/engine/nodes/_Base';
import {BaseParamType} from '@polygonjs/polygonjs/dist/src/engine/params/_Base';
import {Number2} from '@polygonjs/polygonjs/dist/src/types/GlobalTypes';
import {isBooleanTrue} from '@polygonjs/polygonjs/dist/src/core/Type';

const PRESETS = {
	LONDON: {
		style: 'mapbox://styles/mapbox/dark-v10',
		lngLat: [-0.07956, 51.5146] as Number2,
	},
	SAN_FRANCISCO: {
		style: 'mapbox://styles/mapbox/dark-v10',
		lngLat: [-122.4726194, 37.7577627] as Number2,
	},
	MOUNTAIN: {
		style: 'mapbox://styles/mapbox-map-design/ckhqrf2tz0dt119ny6azh975y',
		lngLat: [-114.34411, 32.6141] as Number2,
	},
};
const PRESET = PRESETS.LONDON;
class MapboxCameraObjParamConfig extends CameraMainCameraParamConfig(NodeParamsConfig) {
	style = ParamConfig.STRING(PRESET.style, {
		callback: (node: BaseNodeType) => {
			MapboxCameraObjNode.PARAM_CALLBACK_update_style(node as MapboxCameraObjNode);
		},
	});
	lngLat = ParamConfig.VECTOR2(PRESET.lngLat, {
		callback: (node: BaseNodeType) => {
			MapboxCameraObjNode.PARAM_CALLBACK_update_nav(node as MapboxCameraObjNode);
		},
	});
	zoom = ParamConfig.FLOAT(15.55, {
		range: [0, 24],
		rangeLocked: [true, true],
		callback: (node: BaseNodeType) => {
			MapboxCameraObjNode.PARAM_CALLBACK_update_nav(node as MapboxCameraObjNode);
		},
	});
	zoomRange = ParamConfig.VECTOR2([0, 24], {
		// range: [0, 24],
		// rangeLocked: [true, true]
		callback: (node: BaseNodeType) => {
			MapboxCameraObjNode.PARAM_CALLBACK_update_nav(node as MapboxCameraObjNode);
		},
	});
	pitch = ParamConfig.FLOAT(60, {
		range: [0, 60],
		rangeLocked: [true, true],
		callback: (node: BaseNodeType) => {
			MapboxCameraObjNode.PARAM_CALLBACK_update_nav(node as MapboxCameraObjNode);
		},
	});
	bearing = ParamConfig.FLOAT(60.373613, {
		range: [0, 360],
		callback: (node: BaseNodeType) => {
			MapboxCameraObjNode.PARAM_CALLBACK_update_nav(node as MapboxCameraObjNode);
		},
	});
	updateParamsFromMap = ParamConfig.BUTTON(null, {
		label: 'Set Navigation Params as Default',
		callback: (node: BaseNodeType, param: BaseParamType) => {
			MapboxCameraObjNode.PARAM_CALLBACK_update_params_from_map(node as MapboxCameraObjNode);
		},
	});
	allowDragRotate = ParamConfig.BOOLEAN(1, {
		callback: (node: BaseNodeType) => {
			MapboxCameraObjNode.PARAM_CALLBACK_update_nav(node as MapboxCameraObjNode);
		},
	});
	addZoomControl = ParamConfig.BOOLEAN(1, {
		callback: (node: BaseNodeType) => {
			MapboxCameraObjNode.PARAM_CALLBACK_update_nav(node as MapboxCameraObjNode);
		},
	});
	// this.create_player_camera_params();
	tlayerBuildings = ParamConfig.BOOLEAN(0);
	tlayer3D = ParamConfig.BOOLEAN(0);
	tlayerSky = ParamConfig.BOOLEAN(0);
}
const ParamsConfig = new MapboxCameraObjParamConfig();

export class MapboxCameraObjNode extends TypedCameraObjNode<PerspectiveCamera, MapboxCameraObjParamConfig> {
	override paramsConfig = ParamsConfig;
	static override type(): Readonly<'mapboxCamera'> {
		return 'mapboxCamera';
	}
	public integration_data() {
		return CoreMapboxClient.integration_data();
	}

	private _maps_by_container_id: Map<string, mapboxgl.Map> = new Map();
	private _map_containers_by_container_id: Map<string, HTMLElement> = new Map();
	private _canvases_by_container_id: Map<string, HTMLCanvasElement> = new Map();
	private _controls_by_container_id: Map<string, mapboxgl.NavigationControl> = new Map();
	private _moving_maps = false;

	override createObject() {
		return new PerspectiveCamera(); // I use a PerspectiveCamera to have the picker working
	}

	override async cook() {
		this.updateMaps();
		this.cookController.endCook();
	}

	private _inverse_proj_mat = new Matrix4();
	private _cam_pos = new Vector3();
	private _mouse_pos = new Vector3();
	private _view_dir = new Vector3();
	override prepareRaycaster(mouse: Vector2, raycaster: Raycaster) {
		// adapted from https://github.com/mapbox/mapbox-gl-js/issues/7395
		// const camInverseProjection = this._inverse_proj_mat.getInverse(this._object.projectionMatrix);
		// this._cam_pos.set(0, 0, 0);
		// this._cam_pos.applyMatrix4(camInverseProjection);
		// this._mouse_pos.set(mouse.x, mouse.y, 1);
		// this._mouse_pos.applyMatrix4(camInverseProjection);
		// this._view_dir.copy(this._mouse_pos).sub(this._cam_pos).normalize();
		// raycaster.set(this._cam_pos, this._view_dir);
		this._inverse_proj_mat.copy(this._object.projectionMatrix);
		this._inverse_proj_mat.invert();
		this._cam_pos.set(0, 0, 0);
		this._cam_pos.applyMatrix4(this._inverse_proj_mat);
		this._mouse_pos.set(mouse.x, mouse.y, 1);
		this._mouse_pos.applyMatrix4(this._inverse_proj_mat);
		this._view_dir.copy(this._mouse_pos).sub(this._cam_pos).normalize();
		raycaster.set(this._cam_pos, this._view_dir);
	}

	createMap(container: HTMLElement) {
		const map = new mapboxgl.Map({
			style: this.pv.style,
			container,
			center: this.pv.lngLat.toArray() as Number2,
			zoom: this.pv.zoom,
			minZoom: this.pv.zoomRange.x,
			maxZoom: this.pv.zoomRange.y,
			pitch: this.pv.pitch,
			bearing: this.pv.bearing,
			// preserveDrawingBuffer: true,
			dragRotate: this.pv.allowDragRotate,
			pitchWithRotate: this.pv.allowDragRotate,
			antialias: true,
		});

		this._addRemoveControls(map, container.id);

		this._maps_by_container_id.set(container.id, map);
		this._map_containers_by_container_id.set(container.id, container);
		this._canvases_by_container_id.set(container.id, container.querySelector('canvas')!);

		return map;
	}

	// private _fetch_token(){
	// 	const token = POLY.mapbox_token()
	// 	if(token){
	// 		return token
	// 	} else {
	// 		const scene = this.scene();
	// 		const scene_uuid = scene.uuid();

	// 		let url;
	// 		if(scene_uuid){
	// 			url = `/api/scenes/${scene_uuid}/mapbox`;
	// 		} else {
	// 			// in case the scene has not been saved yet
	// 			url = `/api/account/mapbox_token`;
	// 		}

	// 		return new Promise((resolve, reject)=> {
	// 			axios.get(url).then((response)=>{
	// 				const token = response.data.token
	// 				POLY.register_mapbox_token(token)

	// 				resolve(token)
	// 			}).catch(()=>{
	// 				resolve()
	// 			})
	// 		})
	// 	}
	// }

	updateMaps() {
		this._maps_by_container_id.forEach((map, container_id) => {
			this.updateMapFromContainerId(container_id);
		});
	}

	//this.object().dispatchEvent('change')

	updateMapFromContainerId(container_id: string) {
		const map = this._maps_by_container_id.get(container_id);
		if (!map) {
			return;
		}
		this.updateMapNav(map);
		// controls
		this._addRemoveControls(map, container_id);
		// style
		map.setStyle(this.pv.style);
	}
	updateMapNav(map: mapboxgl.Map) {
		// position/zoom/pitch/bearing
		map.jumpTo(this.cameraOptionsFromParams());
		map.setMinZoom(this.pv.zoomRange.x);
		map.setMaxZoom(this.pv.zoomRange.y);

		const drag_rotate_handler = map.dragRotate;
		if (isBooleanTrue(this.pv.allowDragRotate)) {
			drag_rotate_handler.enable();
		} else {
			drag_rotate_handler.disable();
		}
	}

	firstMap() {
		let first_map: mapboxgl.Map | undefined;
		this._maps_by_container_id.forEach((map, id) => {
			if (!first_map) {
				first_map = map;
			}
		});
		return first_map;
	}
	firstId() {
		let first_id: string | undefined;
		this._maps_by_container_id.forEach((map, id) => {
			if (!first_id) {
				first_id = id;
			}
		});
		return first_id;
	}
	firstMapElement() {
		const id = this.firstId();
		if (id) {
			return this._map_containers_by_container_id.get(id);
		}
	}
	bounds() {
		const map = this.firstMap();
		if (map) {
			return map.getBounds();
		}
	}
	zoom() {
		const map = this.firstMap();
		if (map) {
			return map.getZoom();
		}
	}
	center() {
		const map = this.firstMap();
		if (map) {
			return map.getCenter();
		}
	}
	horizontal_lng_lat_points() {
		const id = this.firstId();
		if (id) {
			// const x = Math.floor(map._container.clientWidth*0.5*1.01)
			// const y = map._container.clientHeight / 2;
			// return [
			// 	map.unproject([-x, y]),
			// 	map.unproject([+x, y])
			// ]
			const map = this._maps_by_container_id.get(id);
			const element = this._canvases_by_container_id.get(id);
			if (map && element) {
				const y = element.clientHeight / 2;
				return [map.unproject([0, y]), map.unproject([100, y])];
			}
		}
	}
	// vertical_near_lng_lat_point(){
	// 	const map = this.first_map()
	// 	if(map){
	// 		const x = 0
	// 		const y = map._container.clientHeight
	// 		return map.unproject([+x, y])
	// 	}
	// }
	centerLngLatPoint() {
		const id = this.firstId();
		if (id) {
			const map = this._maps_by_container_id.get(id);
			const element = this._canvases_by_container_id.get(id);
			if (map && element) {
				const x = element.clientWidth * 0.5;
				const y = element.clientHeight * 0.5;
				return map.unproject([x, y]);
			}
		}
	}
	verticalFarLngLatPoints() {
		const id = this.firstId();
		if (id) {
			const map = this._maps_by_container_id.get(id);
			const element = this._canvases_by_container_id.get(id);
			if (map && element) {
				const x = element.clientWidth;
				const y = 0;

				return [map.unproject([0, y]), map.unproject([x, y])];
			}
		}
	}
	verticalNearLngLatPoints() {
		const id = this.firstId();
		if (id) {
			const map = this._maps_by_container_id.get(id);
			const element = this._canvases_by_container_id.get(id);
			if (map && element) {
				const x = element.clientWidth;
				const y = element.clientHeight;

				return [map.unproject([0, y]), map.unproject([x, y])];
			}
		}
	}
	// lng_lat_corners(){
	// 	const map = this.first_map()
	// 	if(map){
	// 		const x = map._container.clientWidth
	// 		const y = map._container.clientHeight
	// 		return [
	// 			map.unproject([0, 0]),
	// 			map.unproject([0, y]),
	// 			map.unproject([x, 0]),
	// 			map.unproject([x, y])
	// 		]
	// 	}
	// }

	removeMap(container: HTMLElement) {
		if (container) {
			const map = this._maps_by_container_id.get(container.id);
			if (map) {
				map.remove();

				this._maps_by_container_id.delete(container.id);
				this._map_containers_by_container_id.delete(container.id);
				this._canvases_by_container_id.delete(container.id);
				this._controls_by_container_id.delete(container.id);
			}
		}
	}

	// allows all mapbox viewers depending on the same camera to sync up
	// once one has completed a move
	onMoveEnd(container: HTMLElement) {
		if (this._moving_maps === true) {
			return;
		}
		this._moving_maps = true; // to avoid infinite loop, as the moved maps will trigger the same event

		if (container != null) {
			const triggering_map = this._maps_by_container_id.get(container.id);
			if (triggering_map != null) {
				const camera_options = this.cameraOptionsFromMap(triggering_map);
				this._maps_by_container_id.forEach((map, container_id) => {
					if (container_id !== container.id) {
						const map = this._maps_by_container_id.get(container_id);
						map?.jumpTo(camera_options);
					}
				});
			}
		}

		this.object.dispatchEvent({type: 'moveend'});

		this._moving_maps = false;
	}
	lngLat() {
		const val = this.pv.lngLat;
		return {
			lng: val.x,
			lat: val.y,
		};
	}

	cameraOptionsFromParams() {
		return {
			center: this.lngLat(),
			pitch: this.pv.pitch,
			bearing: this.pv.bearing,
			zoom: this.pv.zoom,
		};
	}

	cameraOptionsFromMap(map: mapboxgl.Map) {
		// let data;
		// this.pv.lng_lat.toArray();

		return {
			center: map.getCenter(),
			pitch: map.getPitch(),
			bearing: map.getBearing(),
			zoom: map.getZoom(),
		};
	}

	_addRemoveControls(map: mapboxgl.Map, container_id: string) {
		let nav_control = this._controls_by_container_id.get(container_id);
		if (nav_control) {
			if (!isBooleanTrue(this.pv.addZoomControl)) {
				map.removeControl(nav_control);
				this._controls_by_container_id.delete(container_id);
			}
		} else {
			if (isBooleanTrue(this.pv.addZoomControl)) {
				nav_control = new mapboxgl.NavigationControl();
				map.addControl(nav_control, 'bottom-right');
				this._controls_by_container_id.set(container_id, nav_control);
			}
		}
	}

	updateParamsFromMap() {
		const map = this.firstMap();
		if (map) {
			const center = map.getCenter();
			const zoom = map.getZoom();
			const pitch = map.getPitch();
			const bearing = map.getBearing();
			this.p.lngLat.set([center.lng, center.lat]);
			this.p.zoom.set(zoom);
			this.p.pitch.set(pitch);
			this.p.bearing.set(bearing);
		}
	}
	static PARAM_CALLBACK_update_params_from_map(node: MapboxCameraObjNode) {
		node.updateParamsFromMap();
	}
	static PARAM_CALLBACK_update_style(node: MapboxCameraObjNode) {
		node.updateStyle();
	}
	static PARAM_CALLBACK_update_nav(node: MapboxCameraObjNode) {
		node.updateNav();
	}
	updateStyle() {
		this._maps_by_container_id.forEach((map, container_id) => {
			map.setStyle(this.pv.style);
		});
	}
	updateNav() {
		this._maps_by_container_id.forEach((map) => {
			this.updateMapNav(map);
		});
	}

	createViewer(options: BaseViewerOptions | HTMLElement) {
		const viewer = new MapboxViewer(this);
		let element: HTMLElement | undefined;
		if (options && options instanceof HTMLElement) {
			element = options;
		} else {
			element = options?.element;
		}
		if (element) {
			viewer.mount(element);
		}

		this.scene().viewersRegister.registerViewer(viewer);
		return viewer;
	}
}
