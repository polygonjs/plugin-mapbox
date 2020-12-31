import {GeoNodeChildrenMap} from 'polygonjs-engine/src/engine/poly/registers/nodes/Sop';
import {CopNodeChildrenMap} from 'polygonjs-engine/src/engine/poly/registers/nodes/Cop';
import {ObjNodeChildrenMap} from 'polygonjs-engine/src/engine/poly/registers/nodes/Obj';
import {MapboxTileCopNode} from './engine/nodes/cop/MapboxTile';
import {MapboxCameraObjNode} from './engine/nodes/obj/MapboxCamera';
import {MapboxLayerSopNode} from './engine/nodes/sop/MapboxLayer';
import {MapboxPlaneSopNode} from './engine/nodes/sop/MapboxPlane';
import {MapboxTransformSopNode} from './engine/nodes/sop/MapboxTransform';

export interface ExtendedGeoNodeChildrenMap extends GeoNodeChildrenMap {
	mapboxLayer: MapboxLayerSopNode;
	mapboxPlane: MapboxPlaneSopNode;
	mapboxTransform: MapboxTransformSopNode;
}
export interface ExtendedCopNodeChildrenMap extends CopNodeChildrenMap {
	MapboxTile: MapboxTileCopNode;
}
export interface ExtendedObjNodeChildrenMap extends ObjNodeChildrenMap {
	MapboxCamera: MapboxCameraObjNode;
}
