import {ExtendedObjNodeChildrenMap} from '../../../ExtendedGeoNodeChildrenMap';
import {ParamsInitData} from 'polygonjs-engine/src/engine/nodes/utils/io/IOController';
import {ObjectsManagerNode} from 'polygonjs-engine/src/engine/nodes/manager/ObjectsManager';
import {ObjNodeChildrenMap} from 'polygonjs-engine/src/engine/poly/registers/nodes/Obj';

export class ExtendedObjectsManagerNode extends ObjectsManagerNode {
	createNode<S extends keyof ExtendedObjNodeChildrenMap>(
		node_class: S,
		params_init_value_overrides?: ParamsInitData
	): ExtendedObjNodeChildrenMap[S];
	createNode<K extends valueof<ExtendedObjNodeChildrenMap>>(
		node_class: Constructor<K>,
		params_init_value_overrides?: ParamsInitData
	): K;
	createNode<K extends valueof<ExtendedObjNodeChildrenMap>>(
		node_class: Constructor<K>,
		params_init_value_overrides?: ParamsInitData
	): K {
		return super.createNode(node_class as any, params_init_value_overrides) as K;
	}

	nodesByType<K extends keyof ExtendedObjNodeChildrenMap>(type: K): ExtendedObjNodeChildrenMap[K][] {
		return super.nodesByType(type as keyof ObjNodeChildrenMap) as ExtendedObjNodeChildrenMap[K][];
	}
}
