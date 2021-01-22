import {CoreMapboxTransform} from '../../../../core/mapbox/Transform';
import {MapboxCameraObjNode} from '../../../nodes/obj/MapboxCamera';
import {MapboxViewer} from '../../Mapbox';
import {WebGLRenderer} from 'three/src/renderers/WebGLRenderer';
import {Vector3} from 'three/src/math/Vector3';
import {Scene} from 'three/src/scenes/Scene';
import {Matrix4} from 'three/src/math/Matrix4';
import {Camera} from 'three/src/cameras/Camera';
import mapboxgl from 'mapbox-gl';

const ID = 'threejs_layer';

export class ThreejsLayer {
	public readonly id: string = ID;
	public readonly type: 'custom' = 'custom';
	public readonly renderingMode: '3d' = '3d'; // 2d or 3d, the threejs will be either as an overlay or intersecting with buildings
	private _camera: Camera;
	private _renderer: WebGLRenderer | undefined;
	private _map: mapboxgl.Map | undefined;
	private _gl: WebGLRenderingContext | undefined;

	constructor(
		private _camera_node: MapboxCameraObjNode,
		private _display_scene: Scene,
		private _viewer: MapboxViewer
	) {
		this._camera = this._camera_node.object;
	}

	onAdd(map: mapboxgl.Map, gl: WebGLRenderingContext) {
		this._map = map;
		this._gl = gl;

		this.create_renderer();
	}

	create_renderer() {
		if (this._renderer != null) {
			this._renderer.dispose();
		}
		if (!this._map) {
			return;
		}
		this._renderer = new WebGLRenderer({
			// alpha: true
			// antialias: true
			canvas: this._map.getCanvas(),
			context: this._gl,
		});

		this._renderer.autoClear = false;
		this._renderer.shadowMap.enabled = true;
	}

	onRemove() {
		this._renderer?.dispose();
	}

	resize() {
		// TODO: resize is currently broken, as it seems to never be triggered
		// re-creating a renderer is the only way I found to reliably resize
		this.create_renderer();
	}

	private _prints_count = 0;
	render(gl: WebGLRenderingContext, matrix: number[]) {
		if (!this._renderer || !this._map) {
			return;
		}

		this._update_camera_matrix2(matrix);
		if (this._prints_count < 100) {
			this._prints_count++;
			// console.log('-> ', this._display_scene.uuid);
			// console.log(this._camera.projectionMatrix);
		}

		this._renderer.state.reset();
		this._renderer.render(this._display_scene, this._camera);
		this._map.triggerRepaint();
	}

	// https://github.com/mapbox/mapbox-gl-js/issues/7395
	// _update_camera_matrix3(gl, matrix){
	// 	this._camera.projectionMatrix.elements = matrix;
	// }

	// from https://docs.mapbox.com/mapbox-gl-js/example/add-3d-model/
	// this now rotates objects correctly
	_update_camera_matrix2(matrix: number[]) {
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

		const rotationX = new Matrix4().makeRotationAxis(new Vector3(1, 0, 0), transform.rotation.x);
		const rotationY = new Matrix4().makeRotationAxis(new Vector3(0, 1, 0), transform.rotation.y);
		const rotationZ = new Matrix4().makeRotationAxis(new Vector3(0, 0, 1), transform.rotation.z);

		const m = new Matrix4().fromArray(matrix);
		const l = new Matrix4()
			.makeTranslation(1 * transform.position.x, 1 * transform.position.y, 1 * (transform.position.z || 0))
			.scale(new Vector3(transform.scale, -transform.scale, transform.scale))
			.multiply(rotationX)
			.multiply(rotationY)
			.multiply(rotationZ);

		this._camera.projectionMatrix.elements = matrix;
		this._camera.projectionMatrix = m.multiply(l);
	}
}
