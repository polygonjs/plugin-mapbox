import {CameraController} from '@polygonjs/polygonjs/dist/src/core/CameraController';
import {NodeContext} from '@polygonjs/polygonjs/dist/src/engine/poly/NodeContext';
import {MapboxCameraObjNode} from '../../../nodes/obj/MapboxCamera';
import {TypedSopNode} from '@polygonjs/polygonjs/dist/src/engine/nodes/sop/_Base';
import {NodeParamsConfig, ParamConfig} from '@polygonjs/polygonjs/dist/src/engine/nodes/utils/params/ParamsConfig';
import {BaseNodeType} from '@polygonjs/polygonjs/dist/src/engine/nodes/_Base';
import {PerspectiveCamera} from 'three/src/cameras/PerspectiveCamera';
import {Constructor} from '@polygonjs/polygonjs/dist/src/types/GlobalTypes';
export function MapboxListenerParamConfig<TBase extends Constructor>(Base: TBase) {
	return class Mixin extends Base {
		// if use bounds
		useBounds = ParamConfig.BOOLEAN(0, {hidden: true});
		southWest = ParamConfig.VECTOR2([-0.11, 51.51], {
			visibleIf: {useBounds: 1},
		});
		northEast = ParamConfig.VECTOR2([-0.1, 51.52], {
			visibleIf: {useBounds: 1},
		});
		// if use zoom
		useZoom = ParamConfig.BOOLEAN(0, {hidden: true});
		zoom = ParamConfig.FLOAT(0, {
			visibleIf: {useZoom: 1},
		});
		// always
		mapboxCamera = ParamConfig.OPERATOR_PATH('/mapboxCamera1', {
			nodeSelection: {
				context: NodeContext.OBJ,
				types: [MapboxCameraObjNode.type()],
			},
			callback: (node: BaseNodeType) => {
				MapboxListenerSopNode.PARAM_CALLBACK_update_mapbox_camera(
					node as MapboxListenerSopNode<MapboxListenerParamsConfig>
				);
			},
		});
		zoomRange = ParamConfig.VECTOR2([0, 24]);
		// if updateAlwaysAllowed
		updateAlwaysAllowed = ParamConfig.BOOLEAN(0, {hidden: true});
		updateAlways = ParamConfig.BOOLEAN(0, {
			visibleIf: {updateAlwaysAllowed: 1},
		});
	};
}

class MapboxListenerParamsConfig extends MapboxListenerParamConfig(NodeParamsConfig) {}
export abstract class MapboxListenerSopNode<M extends MapboxListenerParamsConfig> extends TypedSopNode<M> {
	protected _mapboxListener: MapboxListener = new MapboxListener(this as MapboxListenerSopNodeWithParams);
	protected _cameraNode: MapboxCameraObjNode | undefined;

	static PARAM_CALLBACK_update_mapbox_camera(node: MapboxListenerSopNode<MapboxListenerParamsConfig>) {
		node.updateMapboxCamera();
	}
	updateMapboxCamera() {
		this._cameraNode = this.findCameraNode();
	}
	cameraNode() {
		return this._cameraNode;
	}
	cameraObject(): PerspectiveCamera | undefined {
		return this._cameraNode?.object;
	}
	findCameraNode(): MapboxCameraObjNode | undefined {
		const node = this.p.mapboxCamera.found_node_with_context(NodeContext.OBJ);
		if (node) {
			if (node.type() == MapboxCameraObjNode.type()) {
				return node as MapboxCameraObjNode;
			} else {
				this.states.error.set('found node is not a mapbox camera');
			}
		}
	}
	abstract _postInitController(): void;
}

class MapboxListenerSopNodeWithParams extends MapboxListenerSopNode<MapboxListenerParamsConfig> {
	paramsConfig = new MapboxListenerParamsConfig();
	_postInitController() {}
}

export class MapboxListener {
	private _current_camera_path: string | undefined;
	private _camera_controller: CameraController;
	constructor(private _node: MapboxListenerSopNodeWithParams) {
		this._camera_controller = new CameraController(this._updateFromCamera.bind(this));
	}

	// _init_mapbox_listener() {
	// 	// POLY.register_map_listener(this);
	// }
	// init_camera_controller() {

	// }
	async cook() {
		let cameraNode = this._node.cameraNode();
		if (!cameraNode) {
			this._node.updateMapboxCamera();
			this._updateCameraController();
		}
		cameraNode = this._node.cameraNode();
		if (!cameraNode) {
			this._node.setObjects([]);
			return;
		}

		let zoom = cameraNode.zoom();
		const isMapboxActive = cameraNode != null;
		const isZoomInRange = zoom != null && zoom > this._node.pv.zoomRange.x && zoom < this._node.pv.zoomRange.y;

		const doPostInitController = !isMapboxActive || isZoomInRange;

		if (doPostInitController) {
			this._node._postInitController();
		} else {
			this._node.setObjects([]);
		}
	}

	_updateCameraController() {
		this._camera_controller.setUpdateAlways(this._node.pv.updateAlways || false);

		if (this._current_camera_path == null || this._current_camera_path !== this._node.pv.camera) {
			const cameraObject = this._node.cameraObject();
			if (cameraObject) {
				// if (this._is_mapbox_camera(this._camera_object)) {
				this._camera_controller.setTarget(cameraObject);
				// } else {
				// 	this.set_error("camera must be a mapbox camera");
				// 	this._camera_controller.remove_target();
				// }
			} else {
				this._camera_controller.removeTarget();
			}

			this._current_camera_path = this._node.pv.mapboxCamera;
		}
	}

	_updateFromCamera() {
		if (this._node.cookController.isCooking()) {
			// TODO: this should be added to a queue instead
			// or once the params are safer, simple run now
			setTimeout(this._updateFromCamera.bind(this), 1000);
		} else {
			const hasZoomParam = this._node.pv.useZoom;
			const hasBoundsParams = this._node.pv.useBounds;

			const cooker = this._node.scene().cooker;
			if (hasBoundsParams || hasZoomParam) {
				cooker.block();
			}
			const cameraNode = this._node.cameraNode();

			if (hasBoundsParams) {
				const sw_param = this._node.p.southWest;
				const ne_param = this._node.p.northEast;
				if (cameraNode) {
					const bounds = cameraNode.bounds();
					if (cameraNode != null && bounds != null) {
						const sw = bounds.getSouthWest();
						const ne = bounds.getNorthEast();

						sw_param.set([sw.lng, sw.lat]);
						ne_param.set([ne.lng, ne.lat]);
					}
				}
			}
			if (hasZoomParam) {
				if (cameraNode) {
					const zoom = cameraNode.zoom();
					if (zoom) {
						this._node.p.zoom.set(zoom);
					}
				}
			}

			if (hasBoundsParams || hasZoomParam) {
				cooker.unblock();
			}

			if (!hasBoundsParams && !hasZoomParam) {
				this._node.setDirty();
			}
		}
	}

	// update_mapbox_camera() {
	// 	this._node.camera_node = this._found_camera_node();
	// }
	// private _found_camera_node() {
	// 	const node = this._node.p.mapbox_camera.found_node();
	// 	if (node) {
	// 		if (
	// 			node.node_context() == NodeContext.OBJ &&
	// 			node.type == MapboxCameraObjNode.type()
	// 		) {
	// 			return node as MapboxCameraObjNode;
	// 		}
	// 	}
	// }

	// private _found_camera_object() {
	// 	return this._camera_node?.object;
	// }

	// _is_mapbox_camera() {
	// 	// TODO
	// 	return true;
	// }
}
