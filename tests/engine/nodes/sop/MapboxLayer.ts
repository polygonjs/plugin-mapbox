import {CoreSleep} from 'polygonjs-engine/src/core/Sleep';
import {PolyScene} from 'polygonjs-engine/src/engine/scene/PolyScene';
import {ExtendedObjectsManagerNode} from '../../../../src/engine/nodes/manager/ExtendedObjectsManager';
import {ExtendedGeoObjNode} from '../../../../src/engine/nodes/obj/ExtendedGeo';

QUnit.test('mapbox_layer simple', async (assert) => {
	const scene = new PolyScene();
	const root = scene.root as ExtendedObjectsManagerNode;
	const geo1 = scene.root.createNode('geo') as ExtendedGeoObjNode;

	const mapbox_camera1 = root.createNode('mapboxCamera');
	const mapbox_layer1 = geo1.createNode('mapboxLayer');
	// await CoreSleep.sleep(200);
	mapbox_layer1.flags.display.set(true);

	const element = document.createElement('div');
	// defined size should help predict the plane dimensions
	element.style.maxWidth = '200px';
	element.style.maxHeight = '200px';
	document.body.append(element);
	const viewer = mapbox_camera1.createViewer(element);

	await viewer.waitForMapLoaded();
	// await CoreSleep.sleep(5000);
	let container = await mapbox_layer1.requestContainer();
	await CoreSleep.sleep(100);
	const core_group = container.coreContent();
	assert.ok(core_group, 'core_group exists');
	assert.in_delta(core_group!.objects().length, 50, 30);
	assert.in_delta(core_group!.pointsCount(), 350, 150);

	// clear viewer
	viewer.dispose();
	document.body.removeChild(element);
});
