import {AllRegister} from 'polygonjs-engine/src/engine/poly/registers/All';
AllRegister.run();
import {PolygonjsPluginPhysics} from '../src/index';
import {Poly} from 'polygonjs-engine/src/engine/Poly';
Poly.instance().pluginsRegister.register('polygonjs-plugin-physics', PolygonjsPluginPhysics);

import './helpers/setup';
import './tests';

QUnit.start();
