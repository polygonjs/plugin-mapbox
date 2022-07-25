import {Poly} from '@polygonjs/polygonjs/dist/src/engine/Poly';
import {PolyScene} from '@polygonjs/polygonjs/dist/src/engine/scene/PolyScene';
import type {ExtendedGeoObjNode} from './engine/nodes/obj/ExtendedGeo';
import type {ExtendedRootManagerNode} from './engine/nodes/manager/ExtendedRoot';

// register all nodes
// import {AllRegister} from '@polygonjs/polygonjs/dist/src/engine/poly/registers/All';
// AllRegister.run();

import {AllCamerasRegister} from '@polygonjs/polygonjs/dist/src/engine/poly/registers/cameras/All';
import {AllExpressionsRegister} from '@polygonjs/polygonjs/dist/src/engine/poly/registers/expressions/All';
AllCamerasRegister.run(Poly);
AllExpressionsRegister.run(Poly);
import {GeoObjNode} from '@polygonjs/polygonjs/dist/src/engine/nodes/obj/Geo';
import {AddSopNode} from '@polygonjs/polygonjs/dist/src/engine/nodes/sop/Add';
import {MaterialSopNode} from '@polygonjs/polygonjs/dist/src/engine/nodes/sop/Material';
import {TextSopNode} from '@polygonjs/polygonjs/dist/src/engine/nodes/sop/Text';
import {TransformSopNode} from '@polygonjs/polygonjs/dist/src/engine/nodes/sop/Transform';
import {CopySopNode} from '@polygonjs/polygonjs/dist/src/engine/nodes/sop/Copy';
import {MaterialsNetworkObjNode} from '@polygonjs/polygonjs/dist/src/engine/nodes/obj/MaterialsNetwork';
import {MaterialsNetworkSopNode} from '@polygonjs/polygonjs/dist/src/engine/nodes/sop/MaterialsNetwork';
import {MeshLambertMatNode} from '@polygonjs/polygonjs/dist/src/engine/nodes/mat/MeshLambert';
import {HemisphereLightObjNode} from '@polygonjs/polygonjs/dist/src/engine/nodes/obj/HemisphereLight';
Poly.registerNode(GeoObjNode);
Poly.registerNode(AddSopNode);
Poly.registerNode(MaterialSopNode);
Poly.registerNode(TextSopNode);
Poly.registerNode(TransformSopNode);
Poly.registerNode(CopySopNode);
Poly.registerNode(MaterialsNetworkObjNode);
Poly.registerNode(MaterialsNetworkSopNode);
Poly.registerNode(MeshLambertMatNode);
Poly.registerNode(HemisphereLightObjNode);

// register nodes for this plugin
import {polyPluginMapbox} from './index';
import {token} from './ExampleData';
polyPluginMapbox.setToken(token);
Poly.registerPlugin(polyPluginMapbox);

// create a scene
const scene = new PolyScene();
const root = scene.root() as ExtendedRootManagerNode;

// create a mapbox camera
const mapboxCamera = root.createNode('mapboxCamera');
mapboxCamera.p.lngLat.set([148.9819, -35.3981]);

// async function createBox() {
// 	// create a box
// 	const geo = root.createNode('geo') as ExtendedGeoObjNode;
// 	const box = geo.createNode('roundedBox');
// 	box.p.center.y.set(0.5);
// 	const boxTransform = geo.createNode('transform');
// 	boxTransform.setInput(0, box);
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

// 	await material.requestContainer();

// 	// make some nodes globals to access in html controls
// 	(window as any).boxTransform = boxTransform;
// 	(window as any).scene = scene;
// }

function createText() {
	// create a box
	const geo = root.createNode('geo') as ExtendedGeoObjNode;
	const text = geo.createNode('text');
	text.p.text.set('Polygonjs + Mapbox');
	// text.p.text.set('`$F`');
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
	const MAT = root.createNode('materialsNetwork');
	// const meshBasic = MAT.createNode('meshBasic');
	const meshLambert = MAT.createNode('meshLambert');
	const material = geo.createNode('material');
	material.setInput(0, copy);
	material.p.material.setNode(meshLambert);
	material.flags.display.set(true);

	// make some nodes globals to access in html controls
	(window as any).text = text;
	(window as any).boxTransform = boxTransform;
	(window as any).scene = scene;
}
function createLights() {
	// add a light
	root.createNode('hemisphereLight');
	// TODO: there is currently a bug where this scene
	// would disappear after being rendered for a single frame
	// if there is only a hemisphereLight
	// const directionalLight = root.createNode('directionalLight');
	// directionalLight.p.r.x.set(8);
}

async function buildScene() {
	setTimeout(() => {
		createLights();
		createText();
	}, 1000);
	// scene.play();
	// mount the viewer
	mapboxCamera.createViewer(document.getElementById('app')!);
}

buildScene();
