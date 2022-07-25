import type {ExtendedObjNodeChildrenMap} from '../../../ExtendedGeoNodeChildrenMap';
import {RootManagerNode} from '@polygonjs/polygonjs/dist/src/engine/nodes/manager/Root';
import {ObjNodeChildrenMap} from '@polygonjs/polygonjs/dist/src/engine/poly/registers/nodes/Obj';
import {Constructor, valueof} from '@polygonjs/polygonjs/dist/src/types/GlobalTypes';
import {NodeCreateOptions} from '@polygonjs/polygonjs/dist/src/engine/nodes/utils/hierarchy/ChildrenController';

export class ExtendedRootManagerNode extends RootManagerNode {
	override createNode<S extends keyof ExtendedObjNodeChildrenMap>(
		node_class: S,
		options?: NodeCreateOptions
	): ExtendedObjNodeChildrenMap[S];
	override createNode<K extends valueof<ExtendedObjNodeChildrenMap>>(
		node_class: Constructor<K>,
		options?: NodeCreateOptions
	): K;
	override createNode<K extends valueof<ExtendedObjNodeChildrenMap>>(
		node_class: Constructor<K>,
		options?: NodeCreateOptions
	): K {
		return super.createNode(node_class as any, options) as K;
	}

	override nodesByType<K extends keyof ExtendedObjNodeChildrenMap>(type: K): ExtendedObjNodeChildrenMap[K][] {
		return super.nodesByType(type as keyof ObjNodeChildrenMap) as ExtendedObjNodeChildrenMap[K][];
	}
}
