import {CoreMapboxString} from '../../../src/core/mapbox/String';

QUnit.test('string utils toId', (assert) => {
	assert.equal(CoreMapboxString.toId('ab'), 1068);
	assert.equal(CoreMapboxString.toId('ba'), 1077);

	assert.equal(CoreMapboxString.toId('a'), 97);
	assert.equal(CoreMapboxString.toId('b'), 98);
	assert.equal(CoreMapboxString.toId('c'), 99);
	assert.equal(CoreMapboxString.toId('e'), 101);
	assert.equal(CoreMapboxString.toId('bb'), 1078);
	assert.equal(CoreMapboxString.toId('cab'), 10968);
	assert.equal(CoreMapboxString.toId('auniqueid'), 10991758250);
	assert.equal(CoreMapboxString.toId('auniqueid'), 10991758250);
	assert.equal(CoreMapboxString.toId('anotherid'), 10923753550);
	assert.equal(CoreMapboxString.toId('Clerkenwell Rd'), 118330371044);
	assert.equal(CoreMapboxString.toId('אליהו בן חור'), 1661326144322);
});
