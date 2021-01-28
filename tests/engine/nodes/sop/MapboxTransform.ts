import {PolyScene} from '@polygonjs/polygonjs/dist/src/engine/scene/PolyScene';
import {ExtendedObjectsManagerNode} from '../../../../src/engine/nodes/manager/ExtendedObjectsManager';
import {ExtendedGeoObjNode} from '../../../../src/engine/nodes/obj/ExtendedGeo';

QUnit.test('mapbox_transform simple', async (assert) => {
	const scene = new PolyScene();
	const root = scene.root() as ExtendedObjectsManagerNode;
	const geo1 = root.createNode('geo') as ExtendedGeoObjNode;

	const mapbox_camera1 = root.createNode('mapboxCamera');
	const add1 = geo1.createNode('add');
	const transform1 = geo1.createNode('transform');
	transform1.p.t.set([-0.07956000001661323, 0, 51.514600000018646]);
	const mapbox_transform1 = geo1.createNode('mapboxTransform');
	transform1.setInput(0, add1);
	mapbox_transform1.setInput(0, transform1);

	const element = document.createElement('div');
	// defined size should help predict the plane dimensions
	element.style.maxWidth = '200px';
	element.style.maxHeight = '200px';
	document.body.append(element);
	const viewer = mapbox_camera1.createViewer(element);

	await viewer.waitForMapLoaded();
	let container = await mapbox_transform1.requestContainer();
	let center = container.center();
	assert.in_delta(center.x, 0, 0.01);
	assert.in_delta(center.y, 0, 0.01);
	assert.in_delta(center.z, 0.09, 0.01);

	// change the position in world space and check it's updated correctly in mapbox space
	transform1.p.t.set([-0.07956000001661323, 0, 51.8]);
	container = await mapbox_transform1.requestContainer();
	center = container.center();
	assert.in_delta(center.x, 0, 0.01);
	assert.in_delta(center.y, 0, 0.01);
	assert.in_delta(center.z, -23000, 1000);

	transform1.p.t.set([-0.1, 0, 51.8]);
	container = await mapbox_transform1.requestContainer();
	center = container.center();
	assert.in_delta(center.x, -1050, 100);
	assert.in_delta(center.y, 0, 0.01);
	assert.in_delta(center.z, -23000, 1000);

	// clear viewer
	viewer.dispose();
	document.body.removeChild(element);
});
