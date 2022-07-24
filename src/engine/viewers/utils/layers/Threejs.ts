import {CoreMapboxTransform} from '../../../../core/mapbox/Transform';
import {MapboxCameraObjNode} from '../../../nodes/obj/MapboxCamera';
import {MapboxViewer} from '../../Mapbox';
import {WebGLRenderer, Vector2} from 'three';
import {Vector3} from 'three';
import {Scene} from 'three';
import {Matrix4} from 'three';
import {Camera} from 'three';
import mapboxgl from 'mapbox-gl';
import {PolyScene} from '@polygonjs/polygonjs/dist/src/engine/scene/PolyScene';
import {Mesh} from 'three';
import {PlaneBufferGeometry} from 'three';
import {TIME_CONTROLLER_UPDATE_TIME_OPTIONS_DEFAULT} from '@polygonjs/polygonjs/dist/src/engine/scene/utils/TimeController';
import {
	CoreCameraCSSRendererController,
	CSSRendererConfig,
} from '@polygonjs/polygonjs/dist/src/core/camera/CoreCameraCSSRendererController';

const ID = 'threejs_layer';
type RenderFunc = () => void;

export class ThreejsLayer {
	public readonly id: string = ID;
	public readonly type: 'custom' = 'custom';
	public readonly renderingMode: '3d' = '3d'; // 2d or 3d, the threejs will be either as an overlay or intersecting with buildings
	private _camera: Camera;
	private _scene: PolyScene;
	private _renderer: WebGLRenderer | undefined;
	private _map: mapboxgl.Map | undefined;
	private _gl: WebGLRenderingContext | undefined;
	private _renderCSSFunc: RenderFunc | undefined;
	private _cssRendererConfig: CSSRendererConfig | undefined;

	constructor(private _cameraNode: MapboxCameraObjNode, private _displayScene: Scene, private _viewer: MapboxViewer) {
		this._camera = this._cameraNode.object;
		this._scene = this._cameraNode.scene();
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

		this._cssRendererConfig = CoreCameraCSSRendererController.cssRendererConfig({
			scene: this._scene,
			camera: this._camera,
			canvas: this._viewer.canvas(),
		});
		const cssRendererNode = this._cssRendererConfig?.cssRendererNode;
		if (cssRendererNode) {
			cssRendererNode.mountRenderer(this._viewer.canvas());
		}
		const cssRenderer = this._cssRendererConfig?.cssRenderer;
		if (cssRenderer) {
			cssRenderer.domElement.style.zIndex = '99999';
		}
		this._renderCSSFunc = cssRenderer ? () => cssRenderer.render(this._displayScene, this._camera) : undefined;

		this._hack();
	}

	resize(size: Vector2) {
		this._renderer?.setSize(size.x, size.y);
		this._cssRendererConfig?.cssRenderer.setSize(size.x, size.y);
	}

	async render(gl: WebGLRenderingContext, matrix: number[]) {
		if (!this._renderer || !this._map) {
			return;
		}

		if (this._displayScene.background) {
			console.warn('scene background is not null, this will cover the map and prevent it from being seen');
		}

		this._scene.timeController.updateClockDelta();
		this._scene.timeController.incrementTimeIfPlaying(TIME_CONTROLLER_UPDATE_TIME_OPTIONS_DEFAULT);

		this._updateCameraMatrix(matrix);

		this._renderer.state.reset();
		this._renderer.render(this._displayScene, this._camera);
		this._map.triggerRepaint();

		if (this._renderCSSFunc) {
			this._renderCSSFunc();
		}
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
