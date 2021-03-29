/**
 * Transforms a geometry from the world space to the mapbox space
 *
 * @remarks
 * The mapbox space is very specific to mapbox, as it is very small (several orders of magnitude) compared to the threejs space.
 */
import {CoreMapboxTransform} from '../../../core/mapbox/Transform';
import {InputCloneMode} from '@polygonjs/polygonjs/dist/src/engine/poly/InputCloneMode';
import {CoreGroup} from '@polygonjs/polygonjs/dist/src/core/geometry/Group';
import {MapboxListenerParamConfig, MapboxListenerSopNode} from './utils/MapboxListener';

const INPUT_NAMES = ['points to transform in mapbox space'];

import {NodeParamsConfig} from '@polygonjs/polygonjs/dist/src/engine/nodes/utils/params/ParamsConfig';
class MapboxTransformSopParamsConfig extends MapboxListenerParamConfig(NodeParamsConfig) {}
const ParamsConfig = new MapboxTransformSopParamsConfig();

export class MapboxTransformSopNode extends MapboxListenerSopNode<MapboxTransformSopParamsConfig> {
	paramsConfig = ParamsConfig;

	static type() {
		return 'mapboxTransform';
	}

	static displayedInputNames(): string[] {
		return INPUT_NAMES;
	}

	initializeNode() {
		this.io.inputs.setCount(1);
		this.io.inputs.initInputsClonedState(InputCloneMode.FROM_NODE);

		// this.uiData.set_icon("map-marker-alt");
		// this._init_mapbox_listener();
	}

	cook(input_contents: CoreGroup[]) {
		if (!this._cameraNode) {
			this.updateMapboxCamera();
			if (!this._cameraNode) {
				this.states.error.set('mapbox camera not found');
				return;
			}
		}

		// No need to error here, as it would prevent scene.wait_all_cooks()
		// to complete in the export
		// if (!this._camera_node.first_map()) {
		// 	this.states.error.set('mapbox not yet loaded');
		// 	return;
		// }

		const core_group = input_contents[0];
		this._transformInput(core_group);
	}

	private _transformInput(core_group: CoreGroup) {
		if (this._cameraNode) {
			const transformer = new CoreMapboxTransform(this._cameraNode);
			for (let object of core_group.objects()) {
				transformer.transform_group_FINAL(object);
			}
		} else {
			this.states.error.set('no camera node found');
		}
		this.setCoreGroup(core_group);
	}

	_postInitController() {}
}
