import {PolyScene} from 'polygonjs-engine/src/engine/scene/PolyScene';
import {ExtendedCopObjNode} from '../../../../src/engine/nodes/obj/ExtendedCop';

QUnit.test('height map from mapbox', async (assert) => {
	const scene = new PolyScene();
	const geo1 = scene.root.createNode('geo');
	const COP = scene.root.createNode('cop') as ExtendedCopObjNode;

	const mapboxTile1 = COP.createNode('mapboxTile');
	const plane1 = geo1.createNode('plane');
	const heightMap1 = geo1.createNode('heightMap');

	heightMap1.setInput(0, plane1);
	heightMap1.p.texture.set(mapboxTile1.fullPath());
	heightMap1.p.mult.set(100);

	mapboxTile1.p.type.set(0); // elevation
	await mapboxTile1.request_container();
	let container;
	container = await heightMap1.request_container();
	assert.equal(container.bounding_box().min.x, -0.5);
	assert.equal(container.bounding_box().max.x, 0.5);
	assert.equal(container.bounding_box().min.z, -0.5);
	assert.equal(container.bounding_box().max.z, 0.5);
	assert.in_delta(container.bounding_box().min.y, 17.2, 0.2);
	assert.in_delta(container.bounding_box().max.y, 18.8, 0.2);

	mapboxTile1.p.type.set(1); // satelite
	await mapboxTile1.request_container();
	container = await heightMap1.request_container();
	assert.equal(container.bounding_box().min.x, -0.5);
	assert.equal(container.bounding_box().max.x, 0.5);
	assert.equal(container.bounding_box().min.z, -0.5);
	assert.equal(container.bounding_box().max.z, 0.5);
	assert.in_delta(container.bounding_box().min.y, 9.4, 0.1);
	assert.in_delta(container.bounding_box().max.y, 21.5, 0.1);
});
