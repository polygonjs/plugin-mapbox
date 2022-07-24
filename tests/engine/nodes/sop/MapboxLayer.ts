import {CoreSleep} from '@polygonjs/polygonjs/dist/src/core/Sleep';
import {PolyScene} from '@polygonjs/polygonjs/dist/src/engine/scene/PolyScene';
import {ExtendedRootManagerNode} from '../../../../src/engine/nodes/manager/ExtendedRoot';
import {ExtendedGeoObjNode} from '../../../../src/engine/nodes/obj/ExtendedGeo';

QUnit.test('mapbox_layer simple', async (assert) => {
	const scene = new PolyScene();
	const root = scene.root() as ExtendedRootManagerNode;
	const geo1 = root.createNode('geo') as ExtendedGeoObjNode;

	const mapboxCamera1 = root.createNode('mapboxCamera');

	const element = document.createElement('div');
	// defined size should help predict the plane dimensions
	element.style.maxWidth = '200px';
	element.style.maxHeight = '200px';
	document.body.append(element);
	const viewer = (await mapboxCamera1.createViewer(element))!;
	await viewer.waitForMapLoaded();

	const mapboxLayer1 = geo1.createNode('mapboxLayer');
	mapboxLayer1.p.mapboxCamera.setNode(mapboxCamera1);
	mapboxLayer1.flags.display.set(true);

	// await CoreSleep.sleep(5000);
	let container = await mapboxLayer1.compute();
	await CoreSleep.sleep(100);
	const core_group = container.coreContent();
	assert.ok(core_group, 'core_group exists');
	assert.in_delta(core_group!.objects().length, 19, 30);
	assert.in_delta(core_group!.pointsCount(), 350, 150);

	// clear viewer
	viewer.dispose();
	document.body.removeChild(element);
});
