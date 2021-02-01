import {CoreMapboxTransform} from '../../../../core/mapbox/Transform';
import {MapboxCameraObjNode} from '../../../nodes/obj/MapboxCamera';
import {MapboxViewer} from '../../Mapbox';
import {WebGLRenderer} from 'three/src/renderers/WebGLRenderer';
import {Vector3} from 'three/src/math/Vector3';
import {Scene} from 'three/src/scenes/Scene';
import {Matrix4} from 'three/src/math/Matrix4';
import {Camera} from 'three/src/cameras/Camera';
import mapboxgl from 'mapbox-gl';
import {PolyScene} from '@polygonjs/polygonjs/dist/src/engine/scene/PolyScene';

const ID = 'threejs_layer';

export class ThreejsLayer {
	public readonly id: string = ID;
	public readonly type: 'custom' = 'custom';
	public readonly renderingMode: '3d' = '3d'; // 2d or 3d, the threejs will be either as an overlay or intersecting with buildings
	private _camera: Camera;
	private _scene: PolyScene;
	private _renderer: WebGLRenderer | undefined;
	private _map: mapboxgl.Map | undefined;
	private _gl: WebGLRenderingContext | undefined;
	// private _debug = true;

	constructor(
		private _camera_node: MapboxCameraObjNode,
		private _display_scene: Scene,
		private _viewer: MapboxViewer
	) {
		this._camera = this._camera_node.object;
		this._scene = this._camera_node.scene();
	}

	onAdd(map: mapboxgl.Map, gl: WebGLRenderingContext) {
		this._map = map;
		this._gl = gl;

		this.createRenderer();
	}

	private createRenderer() {
		if (this._renderer != null) {
			this._renderer.dispose();
		}
		if (!this._map) {
			return;
		}
		this._renderer = new WebGLRenderer({
			// alpha: true
			// antialias: true,
			canvas: this._map.getCanvas(),
			context: this._gl,
		});
		console.log('create renderer', this._gl);

		this._renderer.autoClear = false;
		this._renderer.shadowMap.enabled = true;
	}

	onRemove() {
		this._renderer?.dispose();
	}

	resize() {
		// TODO: resize is currently broken, as it seems to never be triggered
		// re-creating a renderer is the only way I found to reliably resize
		this.createRenderer();
	}

	// private _prints_count = 0;
	// private _stopped = false;
	render(gl: WebGLRenderingContext, matrix: number[]) {
		if (!this._renderer || !this._map) {
			return;
		}

		this._scene.timeController.incrementTimeIfPlaying();
		// if (this._prints_count > 20) {
		// 	return;
		// }

		// let childrenCount = 0;
		// this._display_scene.traverse((object) => {
		// 	childrenCount++;
		// });

		this._updateCameraMatrix(matrix);

		// if (this._debug && this._prints_count == 0) {
		// 	if ((window as any).spector) {
		// 		console.log('start capture');
		// 		(window as any).spector.startCapture(gl);
		// 	}
		// }
		// if (this._debug && this._scene.frame() > 200 && !this._stopped) {
		// 	if ((window as any).spector) {
		// 		console.log('stop', this._scene.frame());
		// 		this._stopped = true;
		// 		const result = (window as any).spector.stopCapture();
		// 		console.log(result);
		// 	}
		// }

		// this._prints_count++;
		// console.log('-> ', this._display_scene.uuid);
		// console.log(this._camera.projectionMatrix.elements);
		// console.log(this._camera.matrix.elements);
		// console.log(this._prints_count);
		// }
		// console.log(this._prints_count, childrenCount, this._scene.frame());

		// if (this._debug && (window as any).spector) {
		// 	(window as any).spector.setMarker(`Threejs layer reset (${this._prints_count})`);
		// }
		this._renderer.state.reset();
		// if (this._debug && (window as any).spector) {
		// 	(window as any).spector.clearMarker();
		// }

		// if (this._debug && (window as any).spector) {
		// 	const markerName = `Threejs layer render (${this._prints_count}, ${this._scene.frame()})`;
		// 	console.log('markerName', markerName);
		// 	(window as any).spector.setMarker(markerName);
		// }
		this._renderer.render(this._display_scene, this._camera);
		// if (this._debug && (window as any).spector) {
		// 	(window as any).spector.clearMarker();
		// }
		// if (this._debug && (window as any).spector) {
		// 	const markerName = `map (${this._prints_count}, ${this._scene.frame()})`;
		// 	console.log('markerName', markerName);
		// 	(window as any).spector.setMarker(markerName);
		// }
		this._map.triggerRepaint();
	}

	// https://github.com/mapbox/mapbox-gl-js/issues/7395
	// _update_camera_matrix3(gl, matrix){
	// 	this._camera.projectionMatrix.elements = matrix;
	// }

	// from https://docs.mapbox.com/mapbox-gl-js/example/add-3d-model/
	// this now rotates objects correctly
	private _vX = new Vector3(1, 0, 0);
	private _vY = new Vector3(0, 1, 0);
	private _vZ = new Vector3(0, 0, 1);
	private mRX = new Matrix4();
	private mRY = new Matrix4();
	private mRZ = new Matrix4();
	private s = new Vector3();
	private m = new Matrix4();
	private l = new Matrix4();
	_updateCameraMatrix(matrix: number[]) {
		const lng_lat = this._viewer.cameraLngLat();
		if (!lng_lat) {
			return;
		}
		const mercator = mapboxgl.MercatorCoordinate.fromLngLat([lng_lat.lng, lng_lat.lat], 0);
		const transform = {
			position: mercator,
			rotation: {x: Math.PI / 2, y: 0, z: 0},
			scale: CoreMapboxTransform.WORLD_SCALE,
		};

		this.mRX.identity();
		this.mRY.identity();
		this.mRZ.identity();
		const rotationX = this.mRX.makeRotationAxis(this._vX, transform.rotation.x);
		const rotationY = this.mRY.makeRotationAxis(this._vY, transform.rotation.y);
		const rotationZ = this.mRZ.makeRotationAxis(this._vZ, transform.rotation.z);

		this.s.x = transform.scale;
		this.s.y = -transform.scale;
		this.s.z = transform.scale;
		this.m.fromArray(matrix);
		this.l.identity();
		this.l
			.makeTranslation(1 * transform.position.x, 1 * transform.position.y, 1 * (transform.position.z || 0))
			.scale(this.s)
			.multiply(rotationX)
			.multiply(rotationY)
			.multiply(rotationZ);

		this._camera.projectionMatrix.elements = matrix;
		this._camera.projectionMatrix = this.m.multiply(this.l);
	}
}
