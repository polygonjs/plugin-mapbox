import {PolyScene} from '@polygonjs/polygonjs/dist/src/engine/scene/PolyScene';
import {ExtendedRootManagerNode} from '../../../../src/engine/nodes/manager/ExtendedRoot';
import {ExtendedGeoObjNode} from '../../../../src/engine/nodes/obj/ExtendedGeo';

QUnit.test('mapbox_transform simple', async (assert) => {
	const scene = new PolyScene();
	const root = scene.root() as ExtendedRootManagerNode;
	const geo1 = root.createNode('geo') as ExtendedGeoObjNode;

	const mapboxCamera1 = root.createNode('mapboxCamera');
	const add1 = geo1.createNode('add');
	const transform1 = geo1.createNode('transform');
	transform1.p.t.set([-0.07956000001661323, 0, 51.514600000018646]);
	const mapboxTransform1 = geo1.createNode('mapboxTransform');
	transform1.setInput(0, add1);
	mapboxTransform1.setInput(0, transform1);
	mapboxTransform1.p.mapboxCamera.setNode(mapboxCamera1);

	const element = document.createElement('div');
	// defined size should help predict the plane dimensions
	element.style.maxWidth = '200px';
	element.style.maxHeight = '200px';
	document.body.append(element);
	const viewer = (await mapboxCamera1.createViewer(element))!;

	await viewer.waitForMapLoaded();
	let container = await mapboxTransform1.compute();
	let center = container.center();
	assert.in_delta(center.x, 0, 0.01);
	assert.in_delta(center.y, 0, 0.01);
	assert.in_delta(center.z, 0.09, 0.01);

	// change the position in world space and check it's updated correctly in mapbox space
	transform1.p.t.set([-0.07956000001661323, 0, 51.8]);
	container = await mapboxTransform1.compute();
	center = container.center();
	assert.in_delta(center.x, 0, 0.01);
	assert.in_delta(center.y, 0, 0.01);
	assert.in_delta(center.z, -23000, 1000);

	transform1.p.t.set([-0.1, 0, 51.8]);
	container = await mapboxTransform1.compute();
	center = container.center();
	assert.in_delta(center.x, -1050, 100);
	assert.in_delta(center.y, 0, 0.01);
	assert.in_delta(center.z, -23000, 1000);

	// clear viewer
	viewer.dispose();
	document.body.removeChild(element);
});
