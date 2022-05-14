import {PolyEngine} from '@polygonjs/polygonjs/dist/src/engine/Poly';

import {MapboxTileCopNode} from './engine/nodes/cop/MapboxTile';
import {MapboxCameraObjNode} from './engine/nodes/obj/MapboxCamera';
import {MapboxLayerSopNode} from './engine/nodes/sop/MapboxLayer';
import {MapboxPlaneSopNode} from './engine/nodes/sop/MapboxPlane';
import {MapboxTransformSopNode} from './engine/nodes/sop/MapboxTransform';
import {PolyPluginMapbox} from './PolyPluginMapbox';
function PolygonjsPluginMapbox(poly: PolyEngine) {
	poly.registerNode(MapboxTileCopNode, 'mapbox');
	poly.registerNode(MapboxCameraObjNode, 'mapbox');
	poly.registerNode(MapboxLayerSopNode, 'mapbox');
	poly.registerNode(MapboxPlaneSopNode, 'mapbox');
	poly.registerNode(MapboxTransformSopNode, 'mapbox');
}
export const polyPluginMapbox = new PolyPluginMapbox('mapbox', PolygonjsPluginMapbox, {
	libraryName: '@polygonjs/plugin-mapbox',
	libraryImportPath: '@polygonjs/plugin-mapbox/dist',
});
