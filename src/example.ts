import {Poly} from '@polygonjs/polygonjs/dist/src/engine/Poly';
import {PolyScene} from '@polygonjs/polygonjs/dist/src/engine/scene/PolyScene';
import {ExtendedGeoObjNode} from './engine/nodes/obj/ExtendedGeo';
import {ExtendedObjectsManagerNode} from './engine/nodes/manager/ExtendedObjectsManager';

// register all nodes
import {AllRegister} from '@polygonjs/polygonjs/dist/src/engine/poly/registers/All';
AllRegister.run();
// register nodes for this plugin
import {polyPluginMapbox} from './index';
import {token} from './ExampleData';
polyPluginMapbox.setToken(token);
Poly.registerPlugin(polyPluginMapbox);

// create a scene
const scene = new PolyScene();
const root = scene.root() as ExtendedObjectsManagerNode;

// create a mapbox camera
const mapboxCamera = root.createNode('mapboxCamera');

// function createBox() {
// 	// create a box
// 	const geo = root.createNode('geo') as ExtendedGeoObjNode;
// 	const roundedBox = geo.createNode('roundedBox');
// 	roundedBox.p.center.y.set(0.5);
// 	const boxTransform = geo.createNode('transform');
// 	boxTransform.setInput(0, roundedBox);
// 	boxTransform.p.scale.set(100);

// 	// create a point to place the box
// 	const add = geo.createNode('add');
// 	const addTransform = geo.createNode('transform');
// 	addTransform.setInput(0, add);
// 	addTransform.p.t.x.set(mapboxCamera.pv.lngLat.x);
// 	addTransform.p.t.z.set(mapboxCamera.pv.lngLat.y);

// 	// create mapbox transform
// 	const mapboxTransform = geo.createNode('mapboxTransform');
// 	mapboxTransform.setInput(0, addTransform);
// 	mapboxTransform.p.mapboxCamera.setNode(mapboxCamera);

// 	// create a copy node
// 	const copy = geo.createNode('copy');
// 	copy.setInput(0, boxTransform);
// 	copy.setInput(1, mapboxTransform);

// 	// create a material and assign it
// 	const MAT = root.createNode('materials');
// 	// const meshBasic = MAT.createNode('meshBasic');
// 	const meshLambert = MAT.createNode('meshLambert');
// 	const material = geo.createNode('material');
// 	material.setInput(0, copy);
// 	material.p.material.setNode(meshLambert);
// 	material.flags.display.set(true);

// 	// add a light
// 	root.createNode('hemisphereLight');
// 	// TODO: there is currently a bug where this scene
// 	// would disappear after being rendered for a single frame
// 	// if there is only a hemisphereLight
// 	const directionalLight = root.createNode('directionalLight');
// 	directionalLight.p.r.x.set(8);

// 	// make some nodes globals to access in html controls
// 	(window as any).boxTransform = boxTransform;
// 	(window as any).scene = scene;
// }

function createText() {
	// create a box
	const geo = root.createNode('geo') as ExtendedGeoObjNode;
	const text = geo.createNode('text');
	text.p.text.set('`$F`');
	const boxTransform = geo.createNode('transform');
	boxTransform.setInput(0, text);
	boxTransform.p.scale.set(100);

	// create a point to place the box
	const add = geo.createNode('add');
	const addTransform = geo.createNode('transform');
	addTransform.setInput(0, add);
	addTransform.p.t.x.set(mapboxCamera.pv.lngLat.x);
	addTransform.p.t.z.set(mapboxCamera.pv.lngLat.y);

	// create mapbox transform
	const mapboxTransform = geo.createNode('mapboxTransform');
	mapboxTransform.setInput(0, addTransform);
	mapboxTransform.p.mapboxCamera.setNode(mapboxCamera);

	// create a copy node
	const copy = geo.createNode('copy');
	copy.setInput(0, boxTransform);
	copy.setInput(1, mapboxTransform);

	// create a material and assign it
	const MAT = root.createNode('materials');
	// const meshBasic = MAT.createNode('meshBasic');
	const meshLambert = MAT.createNode('meshLambert');
	const material = geo.createNode('material');
	material.setInput(0, copy);
	material.p.material.setNode(meshLambert);
	material.flags.display.set(true);

	// add a light
	root.createNode('hemisphereLight');

	// make some nodes globals to access in html controls
	(window as any).boxTransform = boxTransform;
	(window as any).scene = scene;
}
createText();
scene.play();

// mount the viewer
mapboxCamera.createViewer(document.getElementById('app')!);
