import {AllRegister} from '@polygonjs/polygonjs/dist/src/engine/poly/registers/All';
AllRegister.run();
import {polyPluginMapbox} from '../src/index';
import {Poly} from '@polygonjs/polygonjs/dist/src/engine/Poly';
import {token} from '../src/ExampleData';
polyPluginMapbox.setToken(token);
Poly.registerPlugin(polyPluginMapbox);

import './helpers/setup';
import './tests';

QUnit.start();
