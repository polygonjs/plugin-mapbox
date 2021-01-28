import {ExtendedObjNodeChildrenMap} from '../../../ExtendedGeoNodeChildrenMap';
import {ParamsInitData} from '@polygonjs/polygonjs/dist/src/engine/nodes/utils/io/IOController';
import {ObjectsManagerNode} from '@polygonjs/polygonjs/dist/src/engine/nodes/manager/ObjectsManager';
import {ObjNodeChildrenMap} from '@polygonjs/polygonjs/dist/src/engine/poly/registers/nodes/Obj';
import {Constructor, valueof} from '@polygonjs/polygonjs/dist/src/types/GlobalTypes';

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
