import {GeoObjNode} from '@polygonjs/polygonjs/dist/src/engine/nodes/obj/Geo';
import {ExtendedGeoNodeChildrenMap} from '../../../ExtendedGeoNodeChildrenMap';
import {GeoNodeChildrenMap} from '@polygonjs/polygonjs/dist/src/engine/poly/registers/nodes/Sop';
import {Constructor, valueof} from '@polygonjs/polygonjs/dist/src/types/GlobalTypes';
import {NodeCreateOptions} from '@polygonjs/polygonjs/dist/src/engine/nodes/utils/hierarchy/ChildrenController';

export class ExtendedGeoObjNode extends GeoObjNode {
	override createNode<S extends keyof ExtendedGeoNodeChildrenMap>(
		node_class: S,
		options?: NodeCreateOptions
	): ExtendedGeoNodeChildrenMap[S];
	override createNode<K extends valueof<ExtendedGeoNodeChildrenMap>>(
		node_class: Constructor<K>,
		options?: NodeCreateOptions
	): K;
	override createNode<K extends valueof<ExtendedGeoNodeChildrenMap>>(
		node_class: Constructor<K>,
		options?: NodeCreateOptions
	): K {
		return super.createNode(node_class as any, options) as K;
	}

	override nodesByType<K extends keyof ExtendedGeoNodeChildrenMap>(type: K): ExtendedGeoNodeChildrenMap[K][] {
		return super.nodesByType(type as keyof GeoNodeChildrenMap) as ExtendedGeoNodeChildrenMap[K][];
	}
}
