import {Poly} from 'polygonjs-engine/src/engine/Poly';
import {PolyScene} from 'polygonjs-engine/src/engine/scene/PolyScene';
import {ExtendedGeoObjNode} from './engine/nodes/obj/ExtendedGeo';

// register all nodes
import {AllRegister} from 'polygonjs-engine/src/engine/poly/registers/All';
AllRegister.run();
// register nodes for this plugin
import {PolygonjsPluginPhysics} from './index';
Poly.instance().pluginsRegister.register('polygonjs-plugin-physics', PolygonjsPluginPhysics);

// create a scene
const scene = new PolyScene();

// create a box
const geo = scene.root.createNode('geo') as ExtendedGeoObjNode;
const box = geo.createNode('roundedBox');
box.p.size.set(0.63);

// create points to instantiate boxes onto
const plane = geo.createNode('plane');
plane.p.size.set([4, 4]);
const planeTransform = geo.createNode('transform');
planeTransform.setInput(0, plane);
planeTransform.p.t.y.set(3);
const jitter = geo.createNode('jitter');
jitter.setInput(0, planeTransform);
jitter.p.amount.set(2.8);

// instantiate boxes
const copy = geo.createNode('copy');
copy.setInput(0, box);
copy.setInput(1, jitter);

// reset transforms
const boxTransformReset = geo.createNode('transformReset');
boxTransformReset.setInput(0, copy);
boxTransformReset.p.mode.set(2);

// add physics attributes
const boxPhysicsAttributes = geo.createNode('physicsRbdAttributes');
boxPhysicsAttributes.setInput(0, boxTransformReset);
// vary the restitution
const boxAttribCreateRestitution = geo.createNode('attribCreate');
boxAttribCreateRestitution.setInput(0, boxPhysicsAttributes);
boxAttribCreateRestitution.p.name.set('restitution');
boxAttribCreateRestitution.p.value1.set('rand(@ptnum+254)');

// rotate boxes
const boxTransform = geo.createNode('transform');
boxTransform.setInput(0, boxAttribCreateRestitution);
boxTransform.p.apply_on.set(1); // apply to objects
boxTransform.p.r.x.set(35);

// create ground
const boxGround = geo.createNode('box');
const boxGroundTransform = geo.createNode('transform');
boxGroundTransform.setInput(0, boxGround);
boxGroundTransform.p.t.y.set(-2);
boxGroundTransform.p.s.set([5, 1, 10]);
const boxGroundTransformReset = geo.createNode('transformReset');
boxGroundTransformReset.setInput(0, boxGroundTransform);
boxGroundTransformReset.p.mode.set(2);
const groundPhysicsAttributes = geo.createNode('physicsRbdAttributes');
groundPhysicsAttributes.setInput(0, boxGroundTransformReset);
groundPhysicsAttributes.p.active.set(0);
groundPhysicsAttributes.p.mass.set(100000); // inactive objects currently require a high mass

// merge objects
const merge = geo.createNode('merge');
merge.p.compact.set(0);
merge.setInput(0, groundPhysicsAttributes);
merge.setInput(1, boxTransform);

// create solver
const physicsSolver = geo.createNode('physicsSolver');
physicsSolver.setInput(0, merge);
physicsSolver.flags.display.set(true);

// add a light
scene.root.createNode('hemisphereLight');

// create a camera
const perspectiveCamera1 = scene.root.createNode('perspectiveCamera');
perspectiveCamera1.p.t.set([5, 5, 5]);
// add orbitControls
const events1 = perspectiveCamera1.createNode('events');
const orbitsControls = events1.createNode('cameraOrbitControls');
perspectiveCamera1.p.controls.setNode(orbitsControls);

perspectiveCamera1.createViewer(document.getElementById('app')!);

// start play
scene.play();

// make some noes globals to access in html controls
(window as any).scene = scene;
(window as any).plane = plane;
