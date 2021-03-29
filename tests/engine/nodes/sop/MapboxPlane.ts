import {CoreSleep} from '@polygonjs/polygonjs/dist/src/core/Sleep';
import {PolyScene} from '@polygonjs/polygonjs/dist/src/engine/scene/PolyScene';
import {ExtendedObjectsManagerNode} from '../../../../src/engine/nodes/manager/ExtendedObjectsManager';
import {ExtendedGeoObjNode} from '../../../../src/engine/nodes/obj/ExtendedGeo';

QUnit.test('mapbox_plane simple', async (assert) => {
	const scene = new PolyScene();
	const root = scene.root() as ExtendedObjectsManagerNode;
	const geo1 = root.createNode('geo') as ExtendedGeoObjNode;

	const mapbox_camera1 = root.createNode('mapboxCamera');
	const mapbox_plane1 = geo1.createNode('mapboxPlane');
	// await CoreSleep.sleep(200);
	mapbox_plane1.flags.display.set(true);

	const element = document.createElement('div');
	// defined size should help predict the plane dimensions
	element.style.maxWidth = '200px';
	element.style.maxHeight = '200px';
	document.body.append(element);
	const viewer = mapbox_camera1.createViewer(element);

	await viewer.waitForMapLoaded();
	// await CoreSleep.sleep(5000);
	let container = await mapbox_plane1.requestContainer();
	await CoreSleep.sleep(100);
	let center = container.center().toArray();
	let bbox = container.boundingBox();
	assert.in_delta(center[0], 0, 0.1);
	assert.in_delta(bbox.min.x, -350, 50);
	assert.in_delta(bbox.max.x, 350, 50);
	assert.in_delta(bbox.min.y, 0, 1);
	assert.in_delta(bbox.max.y, 0, 1);
	assert.in_delta(bbox.min.z, -293, 50);
	assert.in_delta(bbox.max.z, 293, 50);

	// clear viewer
	viewer.dispose();
	document.body.removeChild(element);
});
