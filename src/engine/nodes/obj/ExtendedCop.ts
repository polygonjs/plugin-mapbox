import {CopNetworkObjNode} from '@polygonjs/polygonjs/dist/src/engine/nodes/obj/CopNetwork';
import {ExtendedCopNodeChildrenMap} from '../../../ExtendedGeoNodeChildrenMap';
import {ParamsInitData} from '@polygonjs/polygonjs/dist/src/engine/nodes/utils/io/IOController';
import {CopNodeChildrenMap} from '@polygonjs/polygonjs/dist/src/engine/poly/registers/nodes/Cop';
import {Constructor, valueof} from '@polygonjs/polygonjs/dist/src/types/GlobalTypes';

export class ExtendedCopObjNode extends CopNetworkObjNode {
	createNode<S extends keyof ExtendedCopNodeChildrenMap>(
		node_class: S,
		params_init_value_overrides?: ParamsInitData
	): ExtendedCopNodeChildrenMap[S];
	createNode<K extends valueof<ExtendedCopNodeChildrenMap>>(
		node_class: Constructor<K>,
		params_init_value_overrides?: ParamsInitData
	): K;
	createNode<K extends valueof<ExtendedCopNodeChildrenMap>>(
		node_class: Constructor<K>,
		params_init_value_overrides?: ParamsInitData
	): K {
		return super.createNode(node_class, params_init_value_overrides) as K;
	}

	nodesByType<K extends keyof ExtendedCopNodeChildrenMap>(type: K): ExtendedCopNodeChildrenMap[K][] {
		return super.nodesByType(type as keyof CopNodeChildrenMap) as ExtendedCopNodeChildrenMap[K][];
	}
}
