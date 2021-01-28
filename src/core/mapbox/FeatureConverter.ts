import {Vector2} from 'three/src/math/Vector2';
import {Object3D} from 'three/src/core/Object3D';
import {LineSegments} from 'three/src/objects/LineSegments';
import {Float32BufferAttribute} from 'three/src/core/BufferAttribute';
import {BufferGeometry} from 'three/src/core/BufferGeometry';
import {CoreGeometry} from '@polygonjs/polygonjs/dist/src/core/geometry/Geometry';
import {ObjectType} from '@polygonjs/polygonjs/dist/src/core/geometry/Constant';
import {BaseSopNodeType} from '@polygonjs/polygonjs/dist/src/engine/nodes/sop/_Base';
import {CoordinatesCollection} from './CoordinatesCollection';
import {ArrayUtils} from '@polygonjs/polygonjs/dist/src/core/ArrayUtils';
import {CoreMapboxString} from './String';

const MULTILINESTRING = 'MultiLineString';
const LINESTRING = 'LineString';

export class FeatureConverter {
	id: number | undefined;
	constructor(private node: BaseSopNodeType, private name: string, private features: any[]) {}

	create_object(): Object3D | undefined {
		const coordinates_collections = this._create_all_coordinates_collections();
		const perimeter: number = ArrayUtils.sum(coordinates_collections.map((f) => f.perimeter()));
		const sorted_features = CoordinatesCollection.sort(coordinates_collections);

		const lines = sorted_features.map((feature) => {
			return this._create_line(feature);
		});
		lines.forEach((line) => {
			const geometry = line.geometry as BufferGeometry;
			const core_geometry = new CoreGeometry(geometry);
			core_geometry.addNumericAttrib('perimeter', 1, perimeter);
		});

		const geometries = lines.map((l) => l.geometry) as BufferGeometry[];
		const merged_geometry = CoreGeometry.merge_geometries(geometries);
		if (!merged_geometry) {
			return;
		}

		// pti
		const core_geometry = new CoreGeometry(merged_geometry);
		core_geometry.addNumericAttrib('pti', 1, 0);
		const points = core_geometry.points();
		const points_count = points.length;
		points.forEach((point, i) => {
			const pti = i / (points_count - 1);
			point.setAttribValue('pti', pti);
		});

		const merged_object = this.node.create_object(merged_geometry, ObjectType.LINE_SEGMENTS);
		return merged_object;
	}

	_create_line(coordinates_collection: CoordinatesCollection): LineSegments {
		const points_count = coordinates_collection.coordinates.length;

		const positions: number[] = [];
		const indices: number[] = [];
		for (let i = 0; i < points_count; i++) {
			const coordinates = coordinates_collection.coordinates[i];

			positions.push(coordinates.x);
			positions.push(0);
			positions.push(coordinates.y);

			if (i > 0) {
				indices.push(i - 1);
				indices.push(i);
			}
		}
		const geometry = new BufferGeometry();
		geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
		geometry.setIndex(indices);
		const object = this.node.create_object(geometry, ObjectType.LINE_SEGMENTS);

		const core_geometry = new CoreGeometry(geometry);
		const id_from_name = CoreMapboxString.toId(this.name) % 10000000;
		// console.log(this.name, id_from_name)
		core_geometry.addNumericAttrib('id', 1, this.id);
		core_geometry.addNumericAttrib('name_id', 1, id_from_name);

		return object;
	}

	private _create_all_coordinates_collections(): CoordinatesCollection[] {
		const coordinates_collections: CoordinatesCollection[] = [];
		this.features.forEach((feature) => {
			this.id = this.id || feature['id'];

			const feature_geometry = feature.geometry;
			if (feature_geometry) {
				const type = feature_geometry['type'];
				switch (type) {
					case MULTILINESTRING:
						const multi_coordinates = feature_geometry['coordinates'];
						if (multi_coordinates) {
							for (let i = 0; i < multi_coordinates.length; i++) {
								const coordinates = multi_coordinates[i];
								coordinates_collections.push(this._create_coordinates(coordinates));
							}
						}
						break;
					case LINESTRING:
						coordinates_collections.push(this._create_coordinates(feature_geometry['coordinates']));
						break;
					default:
						console.warn(`type ${type} not taken into account`);
				}
			}
		});
		return coordinates_collections;
	}
	private _create_coordinates(raw_coordinates: [number, number][]): CoordinatesCollection {
		const vectors = raw_coordinates.map((raw_coordinate) => {
			return new Vector2(raw_coordinate[0], raw_coordinate[1]);
		});
		return new CoordinatesCollection(vectors);
	}
}
