import {Raycaster, Vector2, Vector3, Matrix4} from 'three';
import {MapboxPerspectiveCamera} from './MapboxPerspectiveCamera';

export class MapboxRaycaster extends Raycaster {
	// @ts-ignore
	public firstHitOnly = true;

	private _inverse_proj_mat = new Matrix4();
	private _cam_pos = new Vector3();
	private _mouse_pos = new Vector3();
	private _view_dir = new Vector3();

	override setFromCamera(mouse: Vector2, camera: MapboxPerspectiveCamera) {
		this._inverse_proj_mat.copy(camera.projectionMatrix);
		this._inverse_proj_mat.invert();
		this._cam_pos.set(0, 0, 0);
		this._cam_pos.applyMatrix4(this._inverse_proj_mat);
		this._mouse_pos.set(mouse.x, mouse.y, 1);
		this._mouse_pos.applyMatrix4(this._inverse_proj_mat);
		this._view_dir.copy(this._mouse_pos).sub(this._cam_pos).normalize();
		this.set(this._cam_pos, this._view_dir);
	}
}
