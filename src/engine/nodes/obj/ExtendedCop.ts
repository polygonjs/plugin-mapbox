import {CopNetworkObjNode} from '@polygonjs/polygonjs/dist/src/engine/nodes/obj/CopNetwork';
import type {ExtendedCopNodeChildrenMap} from '../../../ExtendedGeoNodeChildrenMap';
import {CopNodeChildrenMap} from '@polygonjs/polygonjs/dist/src/engine/poly/registers/nodes/Cop';
import {Constructor, valueof} from '@polygonjs/polygonjs/dist/src/types/GlobalTypes';
import {NodeCreateOptions} from '@polygonjs/polygonjs/dist/src/engine/nodes/utils/hierarchy/ChildrenController';

export class ExtendedCopObjNode extends CopNetworkObjNode {
	override createNode<S extends keyof ExtendedCopNodeChildrenMap>(
		node_class: S,
		options?: NodeCreateOptions
	): ExtendedCopNodeChildrenMap[S];
	override createNode<K extends valueof<ExtendedCopNodeChildrenMap>>(
		node_class: Constructor<K>,
		options?: NodeCreateOptions
	): K;
	override createNode<K extends valueof<ExtendedCopNodeChildrenMap>>(
		node_class: Constructor<K>,
		options?: NodeCreateOptions
	): K {
		return super.createNode(node_class, options) as K;
	}

	override nodesByType<K extends keyof ExtendedCopNodeChildrenMap>(type: K): ExtendedCopNodeChildrenMap[K][] {
		return super.nodesByType(type as keyof CopNodeChildrenMap) as ExtendedCopNodeChildrenMap[K][];
	}
}
