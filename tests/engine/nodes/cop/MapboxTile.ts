import {PolyScene} from '@polygonjs/polygonjs/dist/src/engine/scene/PolyScene';
import {ExtendedCopObjNode} from '../../../../src/engine/nodes/obj/ExtendedCop';

QUnit.test('height map from mapbox', async (assert) => {
	const scene = new PolyScene();
	const geo1 = scene.root().createNode('geo');
	const COP = scene.root().createNode('copNetwork') as ExtendedCopObjNode;

	const mapboxTile1 = COP.createNode('mapboxTile');
	const plane1 = geo1.createNode('plane');
	const heightMap1 = geo1.createNode('heightMap');

	heightMap1.setInput(0, plane1);
	heightMap1.p.texture.set(mapboxTile1.path());
	heightMap1.p.mult.set(100);

	mapboxTile1.p.type.set(0); // elevation
	await mapboxTile1.compute();
	let container;
	container = await heightMap1.compute();
	assert.equal(container.boundingBox().min.x, -0.5);
	assert.equal(container.boundingBox().max.x, 0.5);
	assert.equal(container.boundingBox().min.z, -0.5);
	assert.equal(container.boundingBox().max.z, 0.5);
	assert.in_delta(container.boundingBox().min.y, 17.2, 0.2);
	assert.in_delta(container.boundingBox().max.y, 18.8, 0.2);

	mapboxTile1.p.type.set(1); // satelite
	await mapboxTile1.compute();
	container = await heightMap1.compute();
	assert.equal(container.boundingBox().min.x, -0.5);
	assert.equal(container.boundingBox().max.x, 0.5);
	assert.equal(container.boundingBox().min.z, -0.5);
	assert.equal(container.boundingBox().max.z, 0.5);
	assert.in_delta(container.boundingBox().min.y, 12.15, 0.1);
	assert.in_delta(container.boundingBox().max.y, 21.5, 0.1);
});
