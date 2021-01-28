import {GeoObjNode} from '@polygonjs/polygonjs/dist/src/engine/nodes/obj/Geo';
import {ExtendedGeoNodeChildrenMap} from '../../../ExtendedGeoNodeChildrenMap';
import {ParamsInitData} from '@polygonjs/polygonjs/dist/src/engine/nodes/utils/io/IOController';
import {GeoNodeChildrenMap} from '@polygonjs/polygonjs/dist/src/engine/poly/registers/nodes/Sop';
import {Constructor, valueof} from '@polygonjs/polygonjs/dist/src/types/GlobalTypes';

export class ExtendedGeoObjNode extends GeoObjNode {
	createNode<S extends keyof ExtendedGeoNodeChildrenMap>(
		node_class: S,
		params_init_value_overrides?: ParamsInitData
	): ExtendedGeoNodeChildrenMap[S];
	createNode<K extends valueof<ExtendedGeoNodeChildrenMap>>(
		node_class: Constructor<K>,
		params_init_value_overrides?: ParamsInitData
	): K;
	createNode<K extends valueof<ExtendedGeoNodeChildrenMap>>(
		node_class: Constructor<K>,
		params_init_value_overrides?: ParamsInitData
	): K {
		return super.createNode(node_class as any, params_init_value_overrides) as K;
	}

	nodesByType<K extends keyof ExtendedGeoNodeChildrenMap>(type: K): ExtendedGeoNodeChildrenMap[K][] {
		return super.nodesByType(type as keyof GeoNodeChildrenMap) as ExtendedGeoNodeChildrenMap[K][];
	}
}
