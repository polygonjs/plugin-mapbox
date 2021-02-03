import {Camera, HemisphereLight, Scene, WebGLRenderer, Vector3, Matrix4} from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader';
import {MercatorCoordinate} from 'mapbox-gl';

// parameters to ensure the model is georeferenced correctly on the map
var modelOrigin: [number, number] = [148.9819, -35.39847];
var modelAltitude = 0;
var modelRotate = [Math.PI / 2, 0, 0];

var modelAsMercatorCoordinate = MercatorCoordinate.fromLngLat(modelOrigin, modelAltitude);

// transformation parameters to position, rotate and scale the 3D model onto the map
var modelTransform = {
	translateX: modelAsMercatorCoordinate.x,
	translateY: modelAsMercatorCoordinate.y,
	translateZ: modelAsMercatorCoordinate.z as number,
	rotateX: modelRotate[0],
	rotateY: modelRotate[1],
	rotateZ: modelRotate[2],
	/* Since our 3D model is in real world meters, a scale transform needs to be
	 * applied since the CustomLayerInterface expects units in MercatorCoordinates.
	 */
	scale: modelAsMercatorCoordinate.meterInMercatorCoordinateUnits(),
};
console.log(modelTransform);
const camera = new Camera();
const scene = new Scene();
scene.matrixAutoUpdate = false;
let renderer: WebGLRenderer | undefined;
let mainMap: mapboxgl.Map | undefined;
// configuration of the custom layer for a 3D model per the CustomLayerInterface
export const Threejs2Layer = {
	id: '3d-model',
	type: 'custom' as 'custom',
	renderingMode: '3d' as '3d',
	onAdd: function (map: mapboxgl.Map, gl: WebGLRenderingContext) {
		// create two three.js lights to illuminate the model
		// var directionalLight = new THREE.DirectionalLight(0xffffff);
		// directionalLight.position.set(0, -70, 100).normalize();
		// this.scene.add(directionalLight);

		// var directionalLight2 = new THREE.DirectionalLight(0xffffff);
		// directionalLight2.position.set(0, 70, 100).normalize();
		// this.scene.add(directionalLight2);

		var hemisphereLight = new HemisphereLight();
		scene.add(hemisphereLight);
		hemisphereLight.matrixAutoUpdate = false;

		// use the three.js GLTF loader to add the 3D model to the three.js scene
		var loader = new GLTFLoader();
		loader.load(
			'https://docs.mapbox.com/mapbox-gl-js/assets/34M_17/34M_17.gltf',
			function (gltf: any) {
				scene.add(gltf.scene);
			}.bind(this)
		);
		mainMap = map;

		// use the Mapbox GL JS map canvas for three.js
		renderer = new WebGLRenderer({
			canvas: map.getCanvas(),
			context: gl,
			// antialias: true,
		});

		renderer.autoClear = false;
	},
	render: function (gl: WebGLRenderingContext, matrix: number[]) {
		if (!renderer) {
			return;
		}
		if (!mainMap) {
			return;
		}

		var rotationX = new Matrix4().makeRotationAxis(new Vector3(1, 0, 0), modelTransform.rotateX);
		var rotationY = new Matrix4().makeRotationAxis(new Vector3(0, 1, 0), modelTransform.rotateY);
		var rotationZ = new Matrix4().makeRotationAxis(new Vector3(0, 0, 1), modelTransform.rotateZ);

		var m = new Matrix4().fromArray(matrix);
		var l = new Matrix4()
			.makeTranslation(modelTransform.translateX, modelTransform.translateY, modelTransform.translateZ)
			.scale(new Vector3(modelTransform.scale, -modelTransform.scale, modelTransform.scale))
			.multiply(rotationX)
			.multiply(rotationY)
			.multiply(rotationZ);

		camera.projectionMatrix = m.multiply(l);
		renderer.state.reset();
		renderer.render(scene, camera);
		mainMap.triggerRepaint();
	},
};
