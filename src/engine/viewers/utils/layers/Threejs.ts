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
import {Mesh} from 'three/src/objects/Mesh';
import {PlaneBufferGeometry} from 'three/src/geometries/PlaneBufferGeometry';

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
	onRemove() {
		this._renderer?.dispose();
	}
	private createRenderer() {
		if (this._renderer != null) {
			this._renderer.dispose();
		}
		if (!this._map) {
			console.error('no map given');
			return;
		}
		if (!this._gl) {
			console.error('no gl context given');
			return;
		}
		this._renderer = new WebGLRenderer({
			// alpha: true
			// antialias: true,
			canvas: this._map.getCanvas(),
			context: this._gl,
		});
		this._renderer.autoClear = false;
		this._renderer.shadowMap.enabled = true;

		this._hack();
	}

	resize() {
		// TODO: resize is currently broken, as it seems to never be triggered
		// re-creating a renderer is the only way I found to reliably resize
		this.createRenderer();
	}

	async render(gl: WebGLRenderingContext, matrix: number[]) {
		if (!this._renderer || !this._map) {
			return;
		}

		this._scene.timeController.incrementTimeIfPlaying();

		this._updateCameraMatrix(matrix);

		this._renderer.state.reset();
		this._renderer.render(this._display_scene, this._camera);
		this._map.triggerRepaint();
	}

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

	// This is a very dirty hack that seems to allow objects to render properly.
	// If this was not called,
	// all objects created would render for a couple frames and then disappear.
	// There sometimes would be an WebGL warning along the lines of "buffer not large enough"
	// but it is completely unclear what could have caused it.
	//
	// What I tried to debug this:
	//
	// - upgrade from mapbox 1 to 2
	// this made no difference
	//
	// - using Babylon Spector
	// but I was unable to isolate which call was problematic
	//
	// - fiddle with renderes options
	// that solved nothing
	//
	// - integrate the mapbox example as a layer instead of this one
	// When using the example layer and its included THREE.Scene,
	// it renders just fine.
	// But as soon as I replace the included scene with the one created by Polygonjs,
	// Then the problem reappears.
	// That's even if the scene is as simple as a Hemisphere Light and a Plane.
	// So that did not allow me to find a solution.
	//
	// - use src/debug.js (I forgot now where I copied it from)
	// to help find bad webgl calls.
	// but that didn't help.
	//
	// - setting Polygonjs scene's objects to
	// matrixAutoUpdate = true
	// or
	// frustumCulled = false
	// But that solved nothing.
	//
	// In short.... WFT?!?!
	// But for now, with this hack, it seems to work fine.
	private _hack() {
		const hackObject = new Mesh(new PlaneBufferGeometry());
		hackObject.frustumCulled = false;
		hackObject.position.z = -1000;
		hackObject.scale.set(0.01, 0.01, 0.01);
		const scene = this._scene.threejsScene();
		scene.add(hackObject);
	}
}
