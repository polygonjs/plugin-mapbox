import {CoreSleep} from '@polygonjs/polygonjs/dist/src/core/Sleep';
import {PolyScene} from '@polygonjs/polygonjs/dist/src/engine/scene/PolyScene';
import {ExtendedRootManagerNode} from '../../../../src/engine/nodes/manager/ExtendedRoot';
import {ExtendedGeoObjNode} from '../../../../src/engine/nodes/obj/ExtendedGeo';

QUnit.test('mapbox_plane simple', async (assert) => {
	const scene = new PolyScene();
	const root = scene.root() as ExtendedRootManagerNode;
	const geo1 = root.createNode('geo') as ExtendedGeoObjNode;

	const mapboxCamera1 = root.createNode('mapboxCamera');
	const mapboxPlane1 = geo1.createNode('mapboxPlane');
	// await CoreSleep.sleep(200);
	mapboxPlane1.flags.display.set(true);
	mapboxPlane1.p.mapboxCamera.setNode(mapboxCamera1);

	const element = document.createElement('div');
	// defined size should help predict the plane dimensions
	element.style.maxWidth = '200px';
	element.style.maxHeight = '200px';
	document.body.append(element);
	const viewer = (await mapboxCamera1.createViewer(element))!;

	await viewer.waitForMapLoaded();
	// await CoreSleep.sleep(5000);
	let container = await mapboxPlane1.compute();
	await CoreSleep.sleep(100);
	let center = container.center().toArray();
	let bbox = container.boundingBox();
	console.log(bbox);
	assert.in_delta(center[0], 0, 0.1, 'center');
	assert.in_delta(bbox.min.x, -650, 50, 'bbox.min.x');
	assert.in_delta(bbox.max.x, 650, 50, 'bbox.max.x');
	assert.in_delta(bbox.min.y, 0, 1, 'bbox.min.y');
	assert.in_delta(bbox.max.y, 0, 1, 'bbox.max.y');
	assert.in_delta(bbox.min.z, -575, 50, 'bbox.min.z');
	assert.in_delta(bbox.max.z, 575, 50, 'bbox.max.z');

	// clear viewer
	viewer.dispose();
	document.body.removeChild(element);
});
