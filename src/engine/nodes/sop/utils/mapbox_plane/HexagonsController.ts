import {MapboxPlaneSopNode} from '../../MapboxPlane';
import {Vector2} from 'three';
import {Vector3} from 'three';
import {BufferGeometry} from 'three';
import {CoreGeometryOperationHexagon} from '@polygonjs/polygonjs/dist/src/core/geometry/operation/Hexagon';
import {CoreTransform} from '@polygonjs/polygonjs/dist/src/core/Transform';
import {Vector2Like} from '@polygonjs/polygonjs/dist/src/types/GlobalTypes';

const DIR_ORIGIN = new Vector3(0, 1, 0);
const DIR_DEST = new Vector3(0, 0, 1);
export class MapboxPlaneHexagonsController {
	private _coreTransform = new CoreTransform();
	constructor(private node: MapboxPlaneSopNode) {}

	geometry(plane_dimensions: Vector2, segments_counts: Vector2Like): BufferGeometry {
		// for the hexagons, we have a constraint which is that
		// we cannot have different segment_counts for x and y,
		// we can only give a hexagon radius
		// therefore we need to compensate the scale.
		// not doing so, in the case of creating the plane in world pos
		// and after pluging it in a mapbox_transform
		// would result in uneven hexagons.
		const hexagons_radius = Math.max(
			plane_dimensions.x / segments_counts.x,
			plane_dimensions.y / segments_counts.y
		);
		let hexagons_scale_compensate: Vector3 | undefined;
		if (!this.node.pv.mapboxTransform) {
			const new_plane_dimensions = {
				x: segments_counts.x * hexagons_radius,
				y: segments_counts.y * hexagons_radius,
			};
			hexagons_scale_compensate = new Vector3(1, plane_dimensions.y / new_plane_dimensions.y, 1);
			plane_dimensions.x = new_plane_dimensions.x;
			plane_dimensions.y = new_plane_dimensions.y;
		}
		const operation = new CoreGeometryOperationHexagon(
			plane_dimensions,
			hexagons_radius,
			true // always as points in the case of hexagons. too complicated otherwise
		);
		const geometry = operation.process();
		this._coreTransform.rotateGeometry(geometry, DIR_ORIGIN, DIR_DEST);
		if (!this.node.pv.mapboxTransform && hexagons_scale_compensate) {
			geometry.scale(hexagons_scale_compensate.x, hexagons_scale_compensate.y, hexagons_scale_compensate.z);
		}
		return geometry;
	}
}
