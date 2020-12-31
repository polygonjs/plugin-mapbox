import {Poly} from 'polygonjs-engine/src/engine/Poly';

import {ExtendedGeoNodeChildrenMap} from './ExtendedGeoNodeChildrenMap';
export {ExtendedGeoNodeChildrenMap};

import {MapboxTileCopNode} from './engine/nodes/cop/MapboxTile';
import {MapboxCameraObjNode} from './engine/nodes/obj/MapboxCamera';
import {MapboxLayerSopNode} from './engine/nodes/sop/MapboxLayer';
import {MapboxPlaneSopNode} from './engine/nodes/sop/MapboxPlane';
import {MapboxTransformSopNode} from './engine/nodes/sop/MapboxTransform';
export function PolygonjsPluginPhysics(poly: Poly) {
	poly.registerNode(MapboxTileCopNode, 'mapbox');
	poly.registerNode(MapboxCameraObjNode, 'mapbox');
	poly.registerNode(MapboxLayerSopNode, 'mapbox');
	poly.registerNode(MapboxPlaneSopNode, 'mapbox');
	poly.registerNode(MapboxTransformSopNode, 'mapbox');
}
