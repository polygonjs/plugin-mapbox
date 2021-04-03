/**
 * Creates Mapbox layers.
 *
 * @remarks
 * This is best used with the Mapbox camera.
 * Note that you will need a mapbox key to use this node.
 */
import {Object3D} from 'three/src/core/Object3D';
import {CoreString} from '@polygonjs/polygonjs/dist/src/core/String';
import {FeatureConverter} from '../../../core/mapbox/FeatureConverter';

// const MULTILINESTRING = 'MultiLineString'
// const LINESTRING = 'LineString'

const DEFAULT_LIST: Readonly<string> = [
	// 'road-motorway-trunk', // not found in prod, need to investigate
	'road-primary',
	'road-secondary-tertiary',
	'road-street',
].join(' ');

import {NodeParamsConfig, ParamConfig} from '@polygonjs/polygonjs/dist/src/engine/nodes/utils/params/ParamsConfig';
import {MapboxListenerParamConfig, MapboxListenerSopNode} from './utils/MapboxListener';
import {MapUtils} from '@polygonjs/polygonjs/dist/src/core/MapUtils';
import {ArrayUtils} from '@polygonjs/polygonjs/dist/src/core/ArrayUtils';
// use_bounds: false,
// update_always_allowed: false
class MapboxLayerSopParamsConfig extends MapboxListenerParamConfig(NodeParamsConfig) {
	/** @param names of layers to create */
	layers = ParamConfig.STRING(DEFAULT_LIST);
}
const ParamsConfig = new MapboxLayerSopParamsConfig();

export class MapboxLayerSopNode extends MapboxListenerSopNode<MapboxLayerSopParamsConfig> {
	paramsConfig = ParamsConfig;
	static type() {
		return 'mapboxLayer';
	}

	cook() {
		this._mapboxListener.cook();
	}

	_postInitController() {
		if (!this._cameraNode) {
			return;
		}
		const firstMap = this._cameraNode.firstMap();
		if (firstMap == null) {
			this.states.error.set('map not initialized yet');
			return;
		}
		const layerNames = CoreString.attribNames(this.pv.layers);
		const existingLayerNames: string[] = [];
		for (let layerName of layerNames) {
			if (firstMap.getLayer(layerName)) {
				existingLayerNames.push(layerName);
			} else {
				// const layers = first_map.getStyle().layers;
				this.states.error.set(`layer ${layerName} does not exist`);
				return;
			}
		}

		const features = firstMap.queryRenderedFeatures(undefined, {
			layers: existingLayerNames,
		});

		const objects: Object3D[] = [];
		if (features) {
			const featuresByName = this._groupFeaturesByName(features);

			featuresByName.forEach((featuresForName, featureName) => {
				const converter = new FeatureConverter(this, featureName, featuresForName);
				const new_object = converter.createObject();
				if (new_object) {
					objects.push(new_object);
				}
			});
		}
		this.setObjects(objects);
	}

	private _features_by_name: Map<string, mapboxgl.MapboxGeoJSONFeature[]> = new Map();
	private _groupFeaturesByName(
		features: mapboxgl.MapboxGeoJSONFeature[]
	): Map<string, mapboxgl.MapboxGeoJSONFeature[]> {
		this._features_by_name.clear();
		for (let feature of features) {
			const name = this._feature_name(feature);
			if (name) {
				MapUtils.pushOnArrayAtEntry(this._features_by_name, name, feature);
			}
		}
		return this._features_by_name;
	}

	private _feature_name(feature: mapboxgl.MapboxGeoJSONFeature): string | undefined {
		const properties = feature['properties'];
		let name: string | undefined;
		if (properties) {
			name = properties['name'] || properties['name_en']; //|| Math.floor(Math.random()*100000000)
			if (name == null) {
				name = this._id_from_feature(feature);
			}
		}
		return name;
	}
	private _id_from_feature(feature: mapboxgl.MapboxGeoJSONFeature): string {
		const json_str = JSON.stringify(feature.geometry).replace(/{|}|"|:|\[|\]|,|\./g, '');
		const json_str_elements = json_str.split('');
		const letters_count = 30;
		const chunks = ArrayUtils.chunk(json_str_elements, json_str_elements.length / letters_count);
		const first_elements = chunks.map((c) => c[0]);

		return first_elements.join('');
	}
}
